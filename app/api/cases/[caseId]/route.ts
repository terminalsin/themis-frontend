import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
// Temporarily disabled Zod validation due to v4 compatibility issues
// import { z } from 'zod';

const WORKSPACE_DIR = path.join(process.cwd(), 'workspace');

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ caseId: string }> }
) {
    try {
        const caseParams = await params;
        const caseDir = path.join(WORKSPACE_DIR, caseParams.caseId);
        const caseFile = path.join(caseDir, 'case.json');

        const caseData = await fs.readFile(caseFile, 'utf-8');
        const parsedCase = JSON.parse(caseData);


        // Convert date strings back to Date objects
        parsedCase.created_at = new Date(parsedCase.created_at);
        parsedCase.updated_at = new Date(parsedCase.updated_at);
        if (parsedCase.processing_completed_at) {
            parsedCase.processing_completed_at = new Date(parsedCase.processing_completed_at);
        }

        // Skip Zod validation for now due to v4 compatibility issues
        // TODO: Fix Zod v4 compatibility or downgrade to v3
        console.log('Returning parsedCase without validation');

        return NextResponse.json(parsedCase);
    } catch (error) {
        console.error('Failed to get case:', error);
        return NextResponse.json(
            { error: 'Case not found' },
            { status: 404 }
        );
    }
}

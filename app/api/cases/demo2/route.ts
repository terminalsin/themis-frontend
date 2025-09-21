import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const WORKSPACE_DIR = path.join(process.cwd(), 'workspace');

export async function GET(request: NextRequest) {
    try {
        // Simulate some processing delay
        await new Promise(resolve => setTimeout(resolve, 750));

        const caseDir = path.join(WORKSPACE_DIR, 'demo2');
        const caseFile = path.join(caseDir, 'case.json');

        const caseData = await fs.readFile(caseFile, 'utf-8');
        const parsedCase = JSON.parse(caseData);

        // Convert date strings back to Date objects
        parsedCase.created_at = new Date(parsedCase.created_at);
        parsedCase.updated_at = new Date(parsedCase.updated_at);
        if (parsedCase.processing_completed_at) {
            parsedCase.processing_completed_at = new Date(parsedCase.processing_completed_at);
        }

        console.log('Returning demo2 case data');

        return NextResponse.json(parsedCase);
    } catch (error) {
        console.error('Failed to get demo2 case:', error);
        return NextResponse.json(
            { error: 'Demo2 case not found' },
            { status: 404 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { CaseSchema } from '@/types/case';

const WORKSPACE_DIR = path.join(process.cwd(), 'workspace');

export async function POST() {
    try {
        const caseId = randomUUID();
        const caseDir = path.join(WORKSPACE_DIR, caseId);

        // Create case directory
        await fs.mkdir(caseDir, { recursive: true });

        // Create initial case data
        const caseData = {
            id: caseId,
            step: 'upload' as const,
            created_at: new Date(),
            updated_at: new Date(),
        };

        // Save case data
        await fs.writeFile(
            path.join(caseDir, 'case.json'),
            JSON.stringify(caseData, null, 2)
        );

        return NextResponse.json({ caseId });
    } catch (error) {
        console.error('Failed to create case:', error);
        return NextResponse.json(
            { error: 'Failed to create case' },
            { status: 500 }
        );
    }
}

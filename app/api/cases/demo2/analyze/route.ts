import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const WORKSPACE_DIR = path.join(process.cwd(), 'workspace');

export async function POST(request: NextRequest) {
    try {
        const caseDir = path.join(WORKSPACE_DIR, 'demo2');
        const caseFile = path.join(caseDir, 'case.json');

        // Update case step to analysis
        const caseData = JSON.parse(await fs.readFile(caseFile, 'utf-8'));
        caseData.step = 'analysis';
        caseData.updated_at = new Date().toISOString();

        await fs.writeFile(caseFile, JSON.stringify(caseData, null, 2));

        // Simulate analysis workflow with delays (like the original)
        setTimeout(async () => {
            try {
                // Update case with analysis (already hardcoded in demo2 case.json)
                const updatedCaseData = JSON.parse(await fs.readFile(caseFile, 'utf-8'));
                updatedCaseData.step = 'timeline_analysis';
                updatedCaseData.updated_at = new Date().toISOString();

                await fs.writeFile(caseFile, JSON.stringify(updatedCaseData, null, 2));

                // Simulate timeline analysis completion
                setTimeout(async () => {
                    const finalCaseData = JSON.parse(await fs.readFile(caseFile, 'utf-8'));
                    finalCaseData.step = 'resolution';
                    finalCaseData.has_case = false; // Demo2 has no case (self at fault)
                    finalCaseData.updated_at = new Date().toISOString();

                    await fs.writeFile(caseFile, JSON.stringify(finalCaseData, null, 2));
                }, 3000);

            } catch (error) {
                console.error('Failed to complete demo2 analysis:', error);
            }
        }, 2000);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to start demo2 analysis:', error);
        return NextResponse.json(
            { error: 'Failed to start demo2 analysis' },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const WORKSPACE_DIR = path.join(process.cwd(), 'workspace');

export async function POST(request: NextRequest) {
    try {
        const caseDir = path.join(WORKSPACE_DIR, 'demo1');
        const caseFile = path.join(caseDir, 'case.json');

        // Verify case exists and has video
        const caseData = JSON.parse(await fs.readFile(caseFile, 'utf-8'));

        if (!caseData.video_path) {
            return NextResponse.json(
                { error: 'No video found for processing in demo1' },
                { status: 400 }
            );
        }

        // Update case step to processing
        caseData.step = 'processing';
        caseData.updated_at = new Date().toISOString();

        await fs.writeFile(caseFile, JSON.stringify(caseData, null, 2));

        // Start demo processing workflow (simulated)
        startDemo1Processing(caseFile);

        return NextResponse.json({
            success: true,
            message: 'Demo1 video processing workflow started (simulated)'
        });

    } catch (error) {
        console.error('Failed to start demo1 video processing:', error);
        return NextResponse.json(
            { error: 'Failed to start demo1 video processing' },
            { status: 500 }
        );
    }
}

/**
 * Simulate video processing workflow for demo1
 */
async function startDemo1Processing(caseFile: string): Promise<void> {
    // Run workflow in background without blocking the API response
    setImmediate(async () => {
        try {
            console.log(`🚀 Starting demo1 video processing workflow (simulated)`);

            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 5000));

            // Update case file with results
            const updatedCaseData = JSON.parse(await fs.readFile(caseFile, 'utf-8'));

            // Simulate successful processing
            updatedCaseData.step = 'processed';
            updatedCaseData.processing_completed_at = new Date().toISOString();
            updatedCaseData.processing_summary = {
                total_collision_events: 1,
                processing_time_seconds: 45.2,
                confidence_score: 0.95
            };

            console.log(`✅ Demo1 video processing completed (simulated)`);

            updatedCaseData.updated_at = new Date().toISOString();
            await fs.writeFile(caseFile, JSON.stringify(updatedCaseData, null, 2));

        } catch (error) {
            console.error('Failed to execute demo1 video processing workflow:', error);

            // Update case with error state
            try {
                const errorCaseData = JSON.parse(await fs.readFile(caseFile, 'utf-8'));
                errorCaseData.step = 'upload'; // Revert to upload step on error
                errorCaseData.processing_error = error instanceof Error ? error.message : 'Unknown demo1 workflow error';
                errorCaseData.updated_at = new Date().toISOString();

                await fs.writeFile(caseFile, JSON.stringify(errorCaseData, null, 2));
            } catch (fileError) {
                console.error('Failed to update demo1 case with error state:', fileError);
            }
        }
    });
}

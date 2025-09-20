import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { VideoTrackingClient, createStandardModeRequest } from '../../../../../temporal/client/video-tracking-client';

const WORKSPACE_DIR = path.join(process.cwd(), 'workspace');

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ caseId: string }> }
) {
    try {
        const resolvedParams = await params;
        const caseDir = path.join(WORKSPACE_DIR, resolvedParams.caseId);
        const caseFile = path.join(caseDir, 'case.json');

        // Verify case exists and has video
        const caseData = JSON.parse(await fs.readFile(caseFile, 'utf-8'));

        if (!caseData.video_path) {
            return NextResponse.json(
                { error: 'No video found for processing' },
                { status: 400 }
            );
        }

        // Update case step to processing
        caseData.step = 'processing';
        caseData.updated_at = new Date().toISOString();

        await fs.writeFile(caseFile, JSON.stringify(caseData, null, 2));

        // Start Temporal workflow for video processing (Python worker)
        startTemporalVideoProcessing(resolvedParams.caseId, caseData.video_path, caseFile);

        return NextResponse.json({
            success: true,
            message: 'Video processing workflow started (Python worker)'
        });

    } catch (error) {
        console.error('Failed to start video processing:', error);
        return NextResponse.json(
            { error: 'Failed to start video processing' },
            { status: 500 }
        );
    }
}

/**
 * Start Temporal video processing workflow asynchronously.
 * This function runs the workflow in the background and updates the case file when complete.
 * The workflow delegates to a Python worker for actual video processing.
 */
async function startTemporalVideoProcessing(
    caseId: string,
    videoPath: string,
    caseFile: string
): Promise<void> {
    // Run workflow in background without blocking the API response
    setImmediate(async () => {
        const client = new VideoTrackingClient();

        try {
            console.log(`🚀 Starting Temporal video processing workflow (Python worker) for case: ${caseId}`);

            // Connect to Temporal server
            await client.connect();

            // Create processing request (matches Python worker interface)
            const request = createStandardModeRequest(videoPath);

            // Execute workflow (delegates to Python worker)
            const result = await client.executeWorkflow(request);

            // Update case file with results
            const updatedCaseData = JSON.parse(await fs.readFile(caseFile, 'utf-8'));

            if (result.success) {
                updatedCaseData.step = 'analysis';
                updatedCaseData.processing_completed_at = new Date().toISOString();
                updatedCaseData.processed_video_path = result.output_file;
                updatedCaseData.processing_summary = result.processing_summary;

                console.log(`✅ Python worker completed video processing for case: ${caseId}`);
                console.log(`📁 Output video: ${result.output_file}`);

                // Log collision detection results
                const collisionEvents = (result.processing_summary?.total_collision_events as number) || 0;
                if (collisionEvents > 0) {
                    console.log(`⚠️  ${collisionEvents} collision event(s) detected in case: ${caseId}`);
                }
            } else {
                updatedCaseData.step = 'upload'; // Revert to upload step on error
                updatedCaseData.processing_error = result.error_message;

                console.error(`❌ Python worker failed for case: ${caseId}`, result.error_message);
            }

            updatedCaseData.updated_at = new Date().toISOString();
            await fs.writeFile(caseFile, JSON.stringify(updatedCaseData, null, 2));

        } catch (error) {
            console.error('Failed to execute Temporal video processing workflow (Python worker):', error);

            // Update case with error state
            try {
                const errorCaseData = JSON.parse(await fs.readFile(caseFile, 'utf-8'));
                errorCaseData.step = 'upload'; // Revert to upload step on error
                errorCaseData.processing_error = error instanceof Error ? error.message : 'Unknown Temporal workflow error';
                errorCaseData.updated_at = new Date().toISOString();

                await fs.writeFile(caseFile, JSON.stringify(errorCaseData, null, 2));
            } catch (fileError) {
                console.error('Failed to update case with error state:', fileError);
            }
        } finally {
            // Always disconnect from Temporal
            await client.disconnect();
        }
    });
}
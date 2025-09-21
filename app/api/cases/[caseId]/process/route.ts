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

            // Create processing request (matches Python workflow interface)
            const request = createStandardModeRequest(videoPath);

            console.log(`🔧 Processing request details:`, {
                input_video: request.input_video,
                output_video: request.output_video,
                model_path: request.model_path,
                confidence_threshold: request.confidence_threshold,
                collision_distance_threshold: request.collision_distance_threshold,
                overlap_threshold: request.overlap_threshold
            });

            // Execute workflow (delegates to Python worker)
            const result = await client.executeWorkflow(request);

            // Update case file with results
            const updatedCaseData = JSON.parse(await fs.readFile(caseFile, 'utf-8'));

            if (result.success) {
                try {
                    // Copy the processed video from temporal worker output to case workspace
                    const temporalOutputPath = path.resolve(result.output_file);
                    const processedVideoName = `processed_${path.basename(updatedCaseData.video_path)}`;
                    const localProcessedVideoPath = path.join(path.dirname(caseFile), processedVideoName);

                    console.log(`📁 Copying processed video from: ${temporalOutputPath}`);
                    console.log(`📁 To case workspace: ${localProcessedVideoPath}`);

                    // Verify source file exists before copying
                    try {
                        await fs.access(temporalOutputPath);
                        console.log(`✅ Source file exists: ${temporalOutputPath}`);
                    } catch (accessError) {
                        throw new Error(`Source file not found: ${temporalOutputPath}`);
                    }

                    // Read the entire video file content and write to workspace
                    console.log(`📖 Reading video file content...`);
                    const videoBuffer = await fs.readFile(temporalOutputPath);
                    console.log(`📊 Video file size: ${videoBuffer.length} bytes`);

                    console.log(`💾 Writing video to workspace...`);
                    await fs.writeFile(localProcessedVideoPath, new Uint8Array(videoBuffer));

                    // Verify the copied file exists and has the same size
                    const copiedStats = await fs.stat(localProcessedVideoPath);
                    console.log(`✅ Copied file size: ${copiedStats.size} bytes`);

                    if (copiedStats.size !== videoBuffer.length) {
                        throw new Error(`File copy incomplete: expected ${videoBuffer.length} bytes, got ${copiedStats.size} bytes`);
                    }

                    updatedCaseData.step = 'processed';
                    updatedCaseData.processing_completed_at = new Date().toISOString();
                    updatedCaseData.processed_video_path = localProcessedVideoPath;
                    updatedCaseData.processing_summary = result.processing_summary;
                    updatedCaseData.temporal_output_path = result.output_file; // Keep reference to original

                    console.log(`✅ Python worker completed video processing for case: ${caseId}`);
                    console.log(`📁 Original output: ${result.output_file}`);
                    console.log(`📁 Copied to workspace: ${localProcessedVideoPath}`);

                    // Log collision detection results
                    const collisionEvents = (result.processing_summary?.total_collision_events as number) || 0;
                    if (collisionEvents > 0) {
                        console.log(`⚠️  ${collisionEvents} collision event(s) detected in case: ${caseId}`);
                    }
                } catch (copyError) {
                    console.error(`❌ Failed to copy processed video for case: ${caseId}`, copyError);
                    // Still mark as processed but with error
                    updatedCaseData.step = 'analysis'; // Fallback to analysis step
                    updatedCaseData.processing_completed_at = new Date().toISOString();
                    updatedCaseData.processing_summary = result.processing_summary;
                    updatedCaseData.processing_error = `Failed to copy processed video: ${copyError instanceof Error ? copyError.message : 'Unknown error'}`;
                    updatedCaseData.temporal_output_path = result.output_file; // Keep reference
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
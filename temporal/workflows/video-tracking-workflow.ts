/**
 * Temporal workflow for vehicle tracking and collision detection.
 * 
 * This workflow simply calls the Python worker to process videos.
 * All actual processing logic is handled by the Python worker.
 */

import {
    proxyActivities,
    defineQuery,
    setHandler,
    log,
    workflowInfo,
} from '@temporalio/workflow';
import type {
    VideoProcessingRequest,
    VideoProcessingResult,
    VideoTrackingActivities,
} from '../../types/temporal';

// Create activity proxy for calling Python worker
const { executeVideoTrackingActivity } = proxyActivities<VideoTrackingActivities>({
    startToCloseTimeout: '30m', // 30 minutes for video processing
    scheduleToCloseTimeout: '35m', // 35 minutes total including scheduling
    heartbeatTimeout: '30s', // Heartbeat every 30 seconds
    retry: {
        initialInterval: '1s',
        maximumInterval: '30s',
        backoffCoefficient: 2,
        maximumAttempts: 3,
    },
});

// Query definitions for workflow state monitoring
export const getProcessingStatusQuery = defineQuery<string>('getProcessingStatus');
export const getCurrentPhaseQuery = defineQuery<string>('getCurrentPhase');

/**
 * Video tracking workflow implementation.
 * Delegates all processing to the Python worker via Temporal.
 */
export async function videoTrackingWorkflow(
    request: VideoProcessingRequest
): Promise<VideoProcessingResult> {
    const workflowId = workflowInfo().workflowId;

    // Workflow state variables
    let currentPhase = 'initializing';
    let processingStatus = 'Starting video tracking workflow';

    // Set up query handlers
    setHandler(getProcessingStatusQuery, () => processingStatus);
    setHandler(getCurrentPhaseQuery, () => currentPhase);

    log.info('Starting video tracking workflow (Python worker)', {
        workflowId,
        inputVideo: request.input_video,
        modelPath: request.model_path,
    });

    try {
        // Update status
        currentPhase = 'processing';
        processingStatus = 'Calling Python worker for video processing';

        log.info('Delegating to Python worker', {
            inputVideo: request.input_video,
            modelPath: request.model_path,
        });

        // Call Python worker via activity
        const result = await executeVideoTrackingActivity(request);

        if (result.success) {
            currentPhase = 'completed';
            processingStatus = 'Video processing completed successfully';

            log.info('Python worker completed successfully', {
                outputFile: result.output_file,
                processingSummary: result.processing_summary,
            });

            // Log collision detection results
            const collisionEvents = result.processing_summary?.total_collision_events || 0;
            if (collisionEvents > 0) {
                log.warn('Collision events detected', {
                    totalCollisions: collisionEvents,
                    outputFile: result.output_file,
                });
            } else {
                log.info('No collision events detected in video');
            }
        } else {
            currentPhase = 'failed';
            processingStatus = `Python worker failed: ${result.error_message}`;

            log.error('Python worker failed', {
                errorMessage: result.error_message,
            });
        }

        return result;

    } catch (error) {
        currentPhase = 'failed';
        const errorMessage = error instanceof Error ? error.message : 'Unknown workflow error';
        processingStatus = `Workflow failed: ${errorMessage}`;

        log.error('Video tracking workflow failed with exception', {
            error: errorMessage,
            workflowId,
        });

        return {
            success: false,
            output_file: '',
            processing_summary: {},
            error_message: `Workflow execution failed: ${errorMessage}`,
        };
    }
}
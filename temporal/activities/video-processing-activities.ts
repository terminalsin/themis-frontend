/**
 * Temporal activities for video processing workflow.
 * 
 * This activity simply calls the Python worker via Temporal to process videos.
 * All actual video processing logic is handled by the Python worker.
 */

import { Context } from '@temporalio/activity';
import { Connection, Client } from '@temporalio/client';
import type {
    VideoProcessingRequest,
    VideoProcessingResult,
} from '../../types/temporal';

/**
 * Activity to execute video tracking by calling the Python worker via Temporal.
 * This is a simple client call that delegates all processing to the Python worker.
 */
export async function executeVideoTrackingActivity(
    request: VideoProcessingRequest
): Promise<VideoProcessingResult> {
    const context = Context.current();

    context.log.info('Starting video tracking via Python worker', {
        inputVideo: request.input_video,
        modelPath: request.model_path,
    });

    try {
        // Connect to Temporal server
        const connection = await Connection.connect({
            address: 'localhost:7233',
        });
        
        const client = new Client({
            connection,
        });

        context.log.info('Connected to Temporal server, executing Python workflow');

        // Execute the Python workflow
        const result = await client.workflow.execute('VideoTrackingWorkflow.run', {
            args: [request],
            taskQueue: 'vehicle-tracking',
            workflowId: `python-video-tracking-${Date.now()}`,
        });

        context.log.info('Python workflow completed', {
            success: result.success,
            outputFile: result.output_file,
        });

        // Close connection
        await connection.close();

        return result as VideoProcessingResult;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown processing error';
        context.log.error('Python workflow execution failed', { error: errorMessage });

        return {
            success: false,
            output_file: '',
            processing_summary: {},
            error_message: `Python workflow execution failed: ${errorMessage}`,
        };
    }
}
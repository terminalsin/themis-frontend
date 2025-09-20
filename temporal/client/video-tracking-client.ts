/**
 * Temporal client for executing video tracking workflows.
 * 
 * This client provides a high-level interface for starting and monitoring
 * video tracking workflows that delegate to Python workers.
 */

import { Connection, Client, WorkflowHandle } from '@temporalio/client';
import { videoTrackingWorkflow } from '../workflows/video-tracking-workflow';
import type {
    VideoProcessingRequest,
    VideoProcessingResult,
    WorkflowExecutionOptions,
} from '../../types/temporal';
import { TEMPORAL_CONSTANTS } from '../../types/temporal';

/**
 * Video tracking client for managing workflow execution.
 */
export class VideoTrackingClient {
    private client: Client | null = null;
    private connection: Connection | null = null;
    private isConnected = false;

    /**
     * Connect to the Temporal server.
     */
    async connect(serverAddress = 'localhost:7233'): Promise<void> {
        try {
            this.connection = await Connection.connect({
                address: serverAddress,
            });
            this.client = new Client({
                connection: this.connection,
            });
            this.isConnected = true;
            console.log(`✅ Connected to Temporal server at ${serverAddress}`);
        } catch (error) {
            this.isConnected = false;
            const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
            console.error(`❌ Failed to connect to Temporal server: ${errorMessage}`);
            console.error('Make sure Temporal server is running. You can start it with: temporal server start-dev');
            throw new Error(`Temporal connection failed: ${errorMessage}`);
        }
    }

    /**
     * Disconnect from the Temporal server.
     */
    async disconnect(): Promise<void> {
        if (this.connection) {
            await this.connection.close();
            this.connection = null;
            this.client = null;
            this.isConnected = false;
            console.log('🔌 Disconnected from Temporal server');
        }
    }

    /**
     * Check if the client is connected to Temporal.
     */
    get connected(): boolean {
        return this.isConnected && this.client !== null;
    }

    /**
     * Start a video tracking workflow.
     */
    async startWorkflow(
        request: VideoProcessingRequest,
        options?: Partial<WorkflowExecutionOptions>
    ): Promise<WorkflowHandle<typeof videoTrackingWorkflow>> {
        if (!this.client) {
            throw new Error('Client not connected. Call connect() first.');
        }

        const workflowOptions: WorkflowExecutionOptions = {
            taskQueue: TEMPORAL_CONSTANTS.TASK_QUEUE,
            workflowId: `video-tracking-${Date.now()}`,
            ...options,
        };

        console.log('🚀 Starting video tracking workflow (Python worker)', {
            workflowId: workflowOptions.workflowId,
            inputVideo: request.input_video,
        });

        try {
            const handle = await this.client.workflow.start(videoTrackingWorkflow, {
                args: [request],
                taskQueue: workflowOptions.taskQueue,
                workflowId: workflowOptions.workflowId,
            });

            console.log(`📋 Workflow started with ID: ${handle.workflowId}`);
            return handle;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown workflow start error';
            console.error('❌ Failed to start workflow:', errorMessage);
            throw new Error(`Workflow start failed: ${errorMessage}`);
        }
    }

    /**
     * Execute a video tracking workflow and wait for completion.
     */
    async executeWorkflow(
        request: VideoProcessingRequest,
        options?: Partial<WorkflowExecutionOptions>
    ): Promise<VideoProcessingResult> {
        if (!this.client) {
            throw new Error('Client not connected. Call connect() first.');
        }

        const workflowOptions: WorkflowExecutionOptions = {
            taskQueue: TEMPORAL_CONSTANTS.TASK_QUEUE,
            workflowId: `video-tracking-${Date.now()}`,
            ...options,
        };

        console.log('🎯 Executing video tracking workflow (Python worker)', {
            workflowId: workflowOptions.workflowId,
            inputVideo: request.input_video,
            modelPath: request.model_path,
        });

        try {
            const result = await this.client.workflow.execute(videoTrackingWorkflow, {
                args: [request],
                taskQueue: workflowOptions.taskQueue,
                workflowId: workflowOptions.workflowId,
            });

            if (result.success) {
                console.log('✅ Video tracking completed successfully!');
                console.log(`📁 Output saved as: ${result.output_file}`);

                const summary = result.processing_summary;
                console.log('📊 Processing Summary:');
                console.log(`   Total Frames: ${summary?.total_frames || 'N/A'}`);
                console.log(`   Processing Time: ${summary?.processing_time || 'N/A'}`);
                console.log(`   Average FPS: ${summary?.average_fps || 'N/A'}`);
                console.log(`   Unique Vehicles: ${summary?.unique_vehicles_detected || 'N/A'}`);
                console.log(`   Collision Events: ${summary?.total_collision_events || 'N/A'}`);

                if (summary?.total_collision_events && summary.total_collision_events > 0) {
                    console.log('⚠️  COLLISIONS DETECTED! Review the output video for details.');
                    if (summary.collision_details) {
                        summary.collision_details.forEach((collision, index) => {
                            console.log(`   Collision ${index + 1}: ${collision.timestamp} - ${collision.severity} severity`);
                        });
                    }
                } else {
                    console.log('✅ No collisions detected in this video.');
                }
            } else {
                console.log(`❌ Video tracking failed: ${result.error_message}`);
            }

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown workflow execution error';
            console.error('❌ Workflow execution failed:', errorMessage);
            throw new Error(`Workflow execution failed: ${errorMessage}`);
        }
    }

    /**
     * Get a handle to an existing workflow.
     */
    async getWorkflowHandle(workflowId: string): Promise<WorkflowHandle<typeof videoTrackingWorkflow>> {
        if (!this.client) {
            throw new Error('Client not connected. Call connect() first.');
        }

        return this.client.workflow.getHandle(workflowId);
    }

    /**
     * Query the current processing status of a workflow.
     */
    async getProcessingStatus(workflowId: string): Promise<string> {
        const handle = await this.getWorkflowHandle(workflowId);
        return await handle.query('getProcessingStatus');
    }

    /**
     * Query the current phase of a workflow.
     */
    async getCurrentPhase(workflowId: string): Promise<string> {
        const handle = await this.getWorkflowHandle(workflowId);
        return await handle.query('getCurrentPhase');
    }

    /**
     * Cancel a running workflow.
     */
    async cancelWorkflow(workflowId: string, reason = 'User requested cancellation'): Promise<void> {
        const handle = await this.getWorkflowHandle(workflowId);
        await handle.cancel();
        console.log(`🛑 Workflow ${workflowId} cancelled: ${reason}`);
    }

    /**
     * Terminate a running workflow.
     */
    async terminateWorkflow(workflowId: string, reason = 'User requested termination'): Promise<void> {
        const handle = await this.getWorkflowHandle(workflowId);
        await handle.terminate(reason);
        console.log(`⚡ Workflow ${workflowId} terminated: ${reason}`);
    }
}

/**
 * Convenience function to run a video tracking workflow with default settings.
 */
export async function runVideoTrackingWorkflow(
    request: VideoProcessingRequest,
    serverAddress = 'localhost:7233'
): Promise<VideoProcessingResult> {
    const client = new VideoTrackingClient();

    try {
        await client.connect(serverAddress);
        const result = await client.executeWorkflow(request);
        return result;
    } finally {
        await client.disconnect();
    }
}

/**
 * Create a video processing request with demo mode settings.
 */
export function createDemoModeRequest(
    inputVideo: string,
    outputVideo?: string
): VideoProcessingRequest {
    return {
        input_video: inputVideo,
        output_video: outputVideo || `demo_tracked_${inputVideo}`,
        model_path: TEMPORAL_CONSTANTS.DEFAULT_MODEL_PATH,
        confidence_threshold: TEMPORAL_CONSTANTS.DEMO_MODE_SETTINGS.confidence_threshold,
        collision_distance_threshold: TEMPORAL_CONSTANTS.DEMO_MODE_SETTINGS.collision_distance_threshold,
        overlap_threshold: TEMPORAL_CONSTANTS.DEMO_MODE_SETTINGS.overlap_threshold,
        display_realtime: false,
    };
}

/**
 * Create a video processing request with standard mode settings.
 */
export function createStandardModeRequest(
    inputVideo: string,
    outputVideo?: string
): VideoProcessingRequest {
    return {
        input_video: inputVideo,
        output_video: outputVideo || `tracked_${inputVideo}`,
        model_path: TEMPORAL_CONSTANTS.DEFAULT_MODEL_PATH,
        confidence_threshold: TEMPORAL_CONSTANTS.STANDARD_MODE_SETTINGS.confidence_threshold,
        collision_distance_threshold: TEMPORAL_CONSTANTS.STANDARD_MODE_SETTINGS.collision_distance_threshold,
        overlap_threshold: TEMPORAL_CONSTANTS.STANDARD_MODE_SETTINGS.overlap_threshold,
        display_realtime: false,
    };
}
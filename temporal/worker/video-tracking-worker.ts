/**
 * Temporal worker for video tracking workflows.
 * 
 * This worker processes video tracking workflows that delegate to Python workers.
 * It should be run as a separate process alongside your Next.js application.
 */

import { Worker, NativeConnection } from '@temporalio/worker';
import * as activities from '../activities/video-processing-activities';
import { TEMPORAL_CONSTANTS } from '../../types/temporal';

/**
 * Configuration for the video tracking worker.
 */
export interface WorkerConfig {
    serverAddress?: string;
    taskQueue?: string;
    maxConcurrentActivityTaskExecutions?: number;
    maxConcurrentWorkflowTaskExecutions?: number;
}

/**
 * Create and configure a Temporal worker for video tracking.
 */
export async function createVideoTrackingWorker(config: WorkerConfig = {}): Promise<Worker> {
    const {
        serverAddress = 'localhost:7233',
        taskQueue = TEMPORAL_CONSTANTS.TASK_QUEUE,
        maxConcurrentActivityTaskExecutions = 5,
        maxConcurrentWorkflowTaskExecutions = 10,
    } = config;

    console.log('🔧 Configuring Temporal worker (Python worker client)...');
    console.log(`   Server: ${serverAddress}`);
    console.log(`   Task Queue: ${taskQueue}`);
    console.log(`   Max Concurrent Activities: ${maxConcurrentActivityTaskExecutions}`);
    console.log(`   Max Concurrent Workflows: ${maxConcurrentWorkflowTaskExecutions}`);

    // Create connection to Temporal server
    const connection = await NativeConnection.connect({
        address: serverAddress,
    });

    // Create worker with configuration
    const worker = await Worker.create({
        connection,
        namespace: 'default',
        taskQueue,
        workflowsPath: require.resolve('../workflows/video-tracking-workflow'),
        activities,
        maxConcurrentActivityTaskExecutions,
        maxConcurrentWorkflowTaskExecutions,
        // Enable activity heartbeats
        enableLoggingInReplay: true,
        // Graceful shutdown configuration
        shutdownGraceTime: '30s',
        // Activity timeout configuration
        defaultActivityOptions: {
            startToCloseTimeout: '30m',
            heartbeatTimeout: '30s',
            retry: {
                initialInterval: '1s',
                maximumInterval: '30s',
                backoffCoefficient: 2,
                maximumAttempts: 3,
            },
        },
    });

    console.log('✅ Temporal worker configured successfully (delegates to Python worker)');
    return worker;
}

/**
 * Start the video tracking worker.
 * This function will run indefinitely until the process is terminated.
 */
export async function startVideoTrackingWorker(config: WorkerConfig = {}): Promise<void> {
    console.log('🚀 Starting Temporal video tracking worker (Python worker client)...');

    try {
        const worker = await createVideoTrackingWorker(config);

        // Set up graceful shutdown
        process.on('SIGINT', async () => {
            console.log('\n🛑 Received SIGINT, shutting down worker gracefully...');
            await worker.shutdown();
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            console.log('\n🛑 Received SIGTERM, shutting down worker gracefully...');
            await worker.shutdown();
            process.exit(0);
        });

        // Start the worker
        console.log('🎯 Worker is running and ready to process workflows (delegates to Python worker)...');
        console.log('Press Ctrl+C to stop the worker');

        await worker.run();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown worker error';
        console.error('❌ Failed to start worker:', errorMessage);
        process.exit(1);
    }
}

/**
 * Main function to run the worker when this file is executed directly.
 */
async function main(): Promise<void> {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const config: WorkerConfig = {};

    // Simple argument parsing
    for (let i = 0; i < args.length; i += 2) {
        const key = args[i];
        const value = args[i + 1];

        switch (key) {
            case '--server':
                config.serverAddress = value;
                break;
            case '--task-queue':
                config.taskQueue = value;
                break;
            case '--max-activities':
                config.maxConcurrentActivityTaskExecutions = parseInt(value, 10);
                break;
            case '--max-workflows':
                config.maxConcurrentWorkflowTaskExecutions = parseInt(value, 10);
                break;
            case '--help':
                console.log(`
Usage: node video-tracking-worker.js [options]

Options:
  --server <address>        Temporal server address (default: localhost:7233)
  --task-queue <name>       Task queue name (default: ${TEMPORAL_CONSTANTS.TASK_QUEUE})
  --max-activities <num>    Max concurrent activities (default: 5)
  --max-workflows <num>     Max concurrent workflows (default: 10)
  --help                    Show this help message

Examples:
  node video-tracking-worker.js
  node video-tracking-worker.js --server temporal.example.com:7233
  node video-tracking-worker.js --max-activities 10 --max-workflows 20

Note: This worker delegates video processing to Python workers via Temporal.
        `);
                process.exit(0);
                break;
        }
    }

    await startVideoTrackingWorker(config);
}

// Run the worker if this file is executed directly
if (require.main === module) {
    main().catch((error) => {
        console.error('❌ Worker startup failed:', error);
        process.exit(1);
    });
}
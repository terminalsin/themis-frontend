#!/usr/bin/env node

/**
 * One-click CLI runner for vehicle tracking with Temporal.
 * 
 * This script provides a command-line interface for running Python video tracking workflows
 * directly via Temporal.
 */

import { promises as fs } from 'fs';
import path from 'path';
import {
    runVideoTrackingWorkflow,
    createDemoModeRequest,
    createStandardModeRequest
} from '../client/video-tracking-client';

interface CliOptions {
    inputVideo: string;
    outputVideo?: string;
    modelPath: string;
    demoMode: boolean;
    server: string;
    help: boolean;
}

/**
 * Parse command line arguments.
 */
function parseArguments(): CliOptions {
    const args = process.argv.slice(2);
    const options: CliOptions = {
        inputVideo: 'demo.mov',
        modelPath: 'yolo11n.pt',
        demoMode: false,
        server: 'localhost:7233',
        help: false,
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        switch (arg) {
            case '--demo':
                options.demoMode = true;
                break;
            case '--input':
            case '-i':
                options.inputVideo = args[++i];
                break;
            case '--output':
            case '-o':
                options.outputVideo = args[++i];
                break;
            case '--model':
            case '-m':
                options.modelPath = args[++i];
                break;
            case '--server':
            case '-s':
                options.server = args[++i];
                break;
            case '--help':
            case '-h':
                options.help = true;
                break;
            default:
                // If no flag is provided, treat as input video
                if (!arg.startsWith('-') && i === 0) {
                    options.inputVideo = arg;
                }
                break;
        }
    }

    return options;
}

/**
 * Display help information.
 */
function showHelp(): void {
    console.log(`
🚗 Vehicle Tracking with Temporal - CLI Runner (Python Worker)

Usage: npm run temporal:track [options] [input-video]

Options:
  --demo                    Run in DEMO mode with sensitive collision detection
  -i, --input <file>        Input video file (default: demo.mov)
  -o, --output <file>       Output video file (auto-generated if not specified)
  -m, --model <path>        AI model path (default: yolo11n.pt)
  -s, --server <address>    Temporal server address (default: localhost:7233)
  -h, --help                Show this help message

Examples:
  npm run temporal:track                                    # Process demo.mov in standard mode
  npm run temporal:track --demo                             # Process demo.mov in demo mode
  npm run temporal:track my-video.mp4                       # Process specific video
  npm run temporal:track --demo --input crash.mp4          # Demo mode with specific video

Demo Mode vs Standard Mode:
  Demo Mode:     More sensitive collision detection (confidence: 0.25, distance: 60.0)
  Standard Mode: Normal collision detection (confidence: 0.4, distance: 45.0)

Prerequisites:
  1. Temporal server must be running: temporal server start-dev
  2. Python worker must be running and registered with Temporal
  3. Video file must be accessible
  `);
}

/**
 * Check if a file exists at the given path.
 */
async function fileExists(filePath: string): Promise<boolean> {
    try {
        const stats = await fs.stat(filePath);
        return stats.isFile();
    } catch {
        return false;
    }
}

/**
 * Main function to run the video tracking workflow.
 */
async function main(): Promise<void> {
    const options = parseArguments();

    if (options.help) {
        showHelp();
        process.exit(0);
    }

    console.log('🚗 Starting Vehicle Tracking with Temporal (Python Worker)...');

    try {
        // Check if input video exists
        if (!await fileExists(options.inputVideo)) {
            throw new Error(`Video file not found: ${options.inputVideo}`);
        }

        // Configure request based on mode
        let request;
        if (options.demoMode) {
            console.log('🎯 Running in DEMO mode with sensitive collision detection...');
            request = createDemoModeRequest(
                options.inputVideo,
                options.outputVideo
            );
        } else {
            console.log('🎯 Running in STANDARD mode...');
            request = createStandardModeRequest(
                options.inputVideo,
                options.outputVideo
            );
        }

        // Override model path if specified
        if (options.modelPath !== 'yolo11n.pt') {
            request.model_path = options.modelPath;
        }

        console.log(`📹 Input: ${request.input_video}`);
        console.log(`💾 Output: ${request.output_video}`);
        console.log(`🤖 Model: ${request.model_path}`);
        console.log(`🔧 Confidence: ${request.confidence_threshold}`);
        console.log(`📏 Collision Distance: ${request.collision_distance_threshold}`);
        console.log(`📐 Overlap: ${request.overlap_threshold}`);

        // Run the Python workflow directly
        const result = await runVideoTrackingWorkflow(request, options.server);

        if (result.success) {
            process.exit(0);
        } else {
            process.exit(1);
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`\n❌ Error: ${errorMessage}`);

        if (errorMessage.includes('not found')) {
            console.error('\n💡 Make sure:');
            console.error('   1. The video file exists');
            console.error('   2. Temporal server is running: temporal server start-dev');
            console.error('   3. Python worker is running and registered with Temporal');
        }

        process.exit(1);
    }
}

// Run the CLI if this file is executed directly
if (require.main === module) {
    main().catch((error) => {
        console.error('❌ CLI execution failed:', error);
        process.exit(1);
    });
}
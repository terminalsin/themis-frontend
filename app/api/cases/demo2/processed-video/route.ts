import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { createVideoStreamResponse, handleVideoOptions } from '@/lib/video-stream';
import { ensureWebCompatibleVideo, updateCaseWithWebVideo } from '@/lib/video-converter';

const WORKSPACE_DIR = path.join(process.cwd(), 'workspace');

export async function OPTIONS() {
    return handleVideoOptions();
}

export async function GET(request: NextRequest) {
    try {
        // Add artificial delay for testing/demo purposes
        await new Promise(resolve => setTimeout(resolve, 2000));

        const caseDir = path.join(WORKSPACE_DIR, 'demo2');
        const caseFile = path.join(caseDir, 'case.json');

        const caseData = JSON.parse(await fs.readFile(caseFile, 'utf-8'));

        console.log(`📹 Requesting demo2 processed video`);
        console.log(`📁 Case step: ${caseData.step}`);
        console.log(`📁 Processed video path: ${caseData.processed_video_path}`);

        if (!caseData.processed_video_path) {
            console.log(`❌ No processed video path found in demo2 case data`);
            return NextResponse.json(
                { error: 'Demo2 processed video not found' },
                { status: 404 }
            );
        }

        // Check if the processed video file exists
        try {
            const stats = await fs.stat(caseData.processed_video_path);
            console.log(`✅ Demo2 processed video file exists, size: ${stats.size} bytes`);
        } catch (error) {
            console.log(`❌ Demo2 processed video file not accessible: ${error}`);
            return NextResponse.json(
                { error: 'Demo2 processed video file not accessible' },
                { status: 404 }
            );
        }

        console.log(`📖 Streaming demo2 processed video file...`);

        // Check for cached web video first, then ensure web-compatible
        let videoPath = caseData.processed_video_path;

        // First, check if we already have a cached web video
        if (caseData.processed_web_video_path) {
            try {
                await fs.access(caseData.processed_web_video_path);
                videoPath = caseData.processed_web_video_path;
                console.log(`📹 Using cached demo2 processed web video: ${videoPath}`);
            } catch {
                console.log(`⚠️ Cached demo2 processed web video not found, will reconvert`);
                // Remove invalid path from case data
                delete caseData.processed_web_video_path;
            }
        }

        // If no cached web video, ensure video is web-compatible
        if (videoPath === caseData.processed_video_path) {
            try {
                videoPath = await ensureWebCompatibleVideo(caseData.processed_video_path);
                console.log(`📹 Serving converted demo2 processed video: ${videoPath}`);

                // Update case data with new web video path
                await updateCaseWithWebVideo(caseDir, caseData.processed_video_path, videoPath);
            } catch (conversionError) {
                console.error('Demo2 processed video conversion failed, serving original:', conversionError);
                // Fall back to original processed video if conversion fails
                videoPath = caseData.processed_video_path;
            }
        }

        return createVideoStreamResponse({
            videoPath,
            request
        });
    } catch (error) {
        console.error('Failed to get demo2 processed video:', error);
        return NextResponse.json(
            { error: 'Demo2 processed video not found' },
            { status: 404 }
        );
    }
}

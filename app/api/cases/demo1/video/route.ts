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
        const caseDir = path.join(WORKSPACE_DIR, 'demo1');
        const caseFile = path.join(caseDir, 'case.json');

        const caseData = JSON.parse(await fs.readFile(caseFile, 'utf-8'));

        if (!caseData.video_path) {
            return NextResponse.json(
                { error: 'Demo1 video not found' },
                { status: 404 }
            );
        }

        // Check if video file exists
        try {
            await fs.access(caseData.video_path);
        } catch (error) {
            console.error('Demo1 video file not accessible:', error);
            return NextResponse.json(
                { error: 'Demo1 video file not accessible' },
                { status: 404 }
            );
        }

        // Check for cached web video first, then ensure web-compatible
        let videoPath = caseData.video_path;

        // First, check if we already have a cached web video
        if (caseData.web_video_path) {
            try {
                await fs.access(caseData.web_video_path);
                videoPath = caseData.web_video_path;
                console.log(`📹 Using cached demo1 web video: ${videoPath}`);
            } catch {
                console.log(`⚠️ Cached demo1 web video not found, will reconvert`);
                // Remove invalid path from case data
                delete caseData.web_video_path;
            }
        }

        // If no cached web video, ensure video is web-compatible
        if (videoPath === caseData.video_path) {
            try {
                videoPath = await ensureWebCompatibleVideo(caseData.video_path);
                console.log(`📹 Serving converted demo1 video: ${videoPath}`);

                // Update case data with new web video path
                await updateCaseWithWebVideo(caseDir, caseData.video_path, videoPath);
            } catch (conversionError) {
                console.error('Demo1 video conversion failed, serving original:', conversionError);
                // Fall back to original video if conversion fails
                videoPath = caseData.video_path;
            }
        }

        return createVideoStreamResponse({
            videoPath,
            request
        });
    } catch (error) {
        console.error('Failed to get demo1 video:', error);
        return NextResponse.json(
            { error: 'Demo1 video not found' },
            { status: 404 }
        );
    }
}

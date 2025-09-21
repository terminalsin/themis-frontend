import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export interface VideoStreamOptions {
    videoPath: string;
    request: NextRequest;
}

export async function createVideoStreamResponse({ videoPath, request }: VideoStreamOptions): Promise<NextResponse> {
    try {
        // Get file stats
        const stats = await fs.stat(videoPath);
        const fileSize = stats.size;
        const fileExtension = path.extname(videoPath).toLowerCase();

        // Determine content type
        let contentType = 'video/mp4';
        if (fileExtension === '.mov') contentType = 'video/quicktime';
        if (fileExtension === '.avi') contentType = 'video/x-msvideo';
        if (fileExtension === '.webm') contentType = 'video/webm';

        // Parse range header
        const range = request.headers.get('range');

        if (range) {
            // Handle range request for video streaming
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunkSize = (end - start) + 1;

            // Read the requested chunk
            const buffer = Buffer.alloc(chunkSize);
            const fileHandle = await fs.open(videoPath, 'r');
            await fileHandle.read(buffer, 0, chunkSize, start);
            await fileHandle.close();

            return new NextResponse(buffer, {
                status: 206, // Partial Content
                headers: {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunkSize.toString(),
                    'Content-Type': contentType,
                    'Cache-Control': 'public, max-age=3600',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
                    'Access-Control-Allow-Headers': 'Range',
                },
            });
        } else {
            // Serve entire file
            const videoBuffer = await fs.readFile(videoPath);

            return new NextResponse(videoBuffer, {
                status: 200,
                headers: {
                    'Content-Type': contentType,
                    'Content-Length': fileSize.toString(),
                    'Accept-Ranges': 'bytes',
                    'Cache-Control': 'public, max-age=3600',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
                    'Access-Control-Allow-Headers': 'Range',
                },
            });
        }
    } catch (error) {
        console.error('Error streaming video:', error);
        return NextResponse.json(
            { error: 'Video streaming failed' },
            { status: 500 }
        );
    }
}

export async function handleVideoOptions(): Promise<NextResponse> {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': 'Range',
        },
    });
}

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const WORKSPACE_DIR = path.join(process.cwd(), 'workspace');

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ caseId: string }> }
) {
    try {
        const caseParams = await params;
        const caseDir = path.join(WORKSPACE_DIR, caseParams.caseId);
        const caseFile = path.join(caseDir, 'case.json');

        const caseData = JSON.parse(await fs.readFile(caseFile, 'utf-8'));

        if (!caseData.video_path) {
            return NextResponse.json(
                { error: 'Video not found' },
                { status: 404 }
            );
        }

        const videoBuffer = await fs.readFile(caseData.video_path);
        const fileExtension = path.extname(caseData.video_path).toLowerCase();

        let contentType = 'video/mp4';
        if (fileExtension === '.mov') contentType = 'video/quicktime';
        if (fileExtension === '.avi') contentType = 'video/x-msvideo';
        if (fileExtension === '.webm') contentType = 'video/webm';

        return new NextResponse(videoBuffer as unknown as BodyInit, {
            headers: {
                'Content-Type': contentType,
                'Content-Length': videoBuffer.length.toString(),
            },
        });
    } catch (error) {
        console.error('Failed to get video:', error);
        return NextResponse.json(
            { error: 'Video not found' },
            { status: 404 }
        );
    }
}

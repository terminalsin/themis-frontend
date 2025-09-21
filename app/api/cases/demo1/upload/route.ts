import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const WORKSPACE_DIR = path.join(process.cwd(), 'workspace');

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('video') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No video file provided for demo1' },
                { status: 400 }
            );
        }

        const caseDir = path.join(WORKSPACE_DIR, 'demo1');
        const videoPath = path.join(caseDir, `video.${file.name.split('.').pop()}`);

        // Save video file
        const bytes = await file.arrayBuffer();
        await fs.writeFile(videoPath, new Uint8Array(bytes));

        // Update case data
        const caseFile = path.join(caseDir, 'case.json');
        const caseData = JSON.parse(await fs.readFile(caseFile, 'utf-8'));

        caseData.video_path = videoPath;
        caseData.step = 'processing';
        caseData.updated_at = new Date().toISOString();

        await fs.writeFile(caseFile, JSON.stringify(caseData, null, 2));

        // Trigger video processing workflow for demo1
        console.log('Triggering demo1 video processing workflow');
        try {
            const processResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/cases/demo1/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!processResponse.ok) {
                console.error('Failed to trigger demo1 processing workflow:', await processResponse.text());
            }
        } catch (error) {
            console.error('Failed to trigger demo1 processing workflow:', error);
            // Don't fail the upload if processing trigger fails
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to upload demo1 video:', error);
        return NextResponse.json(
            { error: 'Failed to upload demo1 video' },
            { status: 500 }
        );
    }
}

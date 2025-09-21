import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const WORKSPACE_DIR = path.join(process.cwd(), 'workspace');

interface MemeData {
    filename: string;
    url: string;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ caseId: string }> }
) {
    try {
        const resolvedParams = await params;
        const caseId = resolvedParams.caseId;
        const memesDir = path.join(WORKSPACE_DIR, caseId, 'memes');

        // Check if memes directory exists
        try {
            await fs.access(memesDir);
        } catch {
            return NextResponse.json(
                { error: 'Memes directory not found for this case' },
                { status: 404 }
            );
        }

        // Read all files in the memes directory
        const files = await fs.readdir(memesDir);

        // Filter for image files (PNG, JPG, JPEG, SVG)
        const imageExtensions = ['.png', '.jpg', '.jpeg', '.svg'];
        const memeFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return imageExtensions.includes(ext);
        });

        if (memeFiles.length === 0) {
            return NextResponse.json(
                { error: 'No meme images found in the directory' },
                { status: 404 }
            );
        }

        // Create meme data with URLs
        const memes: MemeData[] = memeFiles.map(filename => ({
            filename,
            url: `/api/cases/${caseId}/memes/${encodeURIComponent(filename)}`
        }));

        return NextResponse.json({
            memes,
            count: memes.length
        });

    } catch (error) {
        console.error('Error fetching memes:', error);
        return NextResponse.json(
            { error: 'Failed to fetch memes' },
            { status: 500 }
        );
    }
}

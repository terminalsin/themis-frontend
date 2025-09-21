import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const WORKSPACE_DIR = path.join(process.cwd(), 'workspace');

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ caseId: string; filename: string }> }
) {
    try {
        const resolvedParams = await params;
        const { caseId, filename } = resolvedParams;

        // Decode the filename in case it was URL encoded
        const decodedFilename = decodeURIComponent(filename);

        // Security check: prevent directory traversal
        if (decodedFilename.includes('..') || decodedFilename.includes('/') || decodedFilename.includes('\\')) {
            return NextResponse.json(
                { error: 'Invalid filename' },
                { status: 400 }
            );
        }

        const filePath = path.join(WORKSPACE_DIR, caseId, 'memes', decodedFilename);

        // Check if file exists
        try {
            await fs.access(filePath);
        } catch {
            return NextResponse.json(
                { error: 'Meme file not found' },
                { status: 404 }
            );
        }

        // Read the file
        const fileBuffer = await fs.readFile(filePath);

        // Determine content type based on file extension
        const ext = path.extname(decodedFilename).toLowerCase();
        let contentType = 'application/octet-stream';

        switch (ext) {
            case '.png':
                contentType = 'image/png';
                break;
            case '.jpg':
            case '.jpeg':
                contentType = 'image/jpeg';
                break;
            case '.svg':
                contentType = 'image/svg+xml';
                break;
            case '.gif':
                contentType = 'image/gif';
                break;
        }

        // Return the file with appropriate headers
        return new NextResponse(fileBuffer as any, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
                'Content-Disposition': `inline; filename="${decodedFilename}"`
            }
        });

    } catch (error) {
        console.error('Error serving meme file:', error);
        return NextResponse.json(
            { error: 'Failed to serve meme file' },
            { status: 500 }
        );
    }
}

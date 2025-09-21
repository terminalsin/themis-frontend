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
        const caseDir = path.join(WORKSPACE_DIR, resolvedParams.caseId);
        const victoryDir = path.join(caseDir, 'victory');
        const filePath = path.join(victoryDir, resolvedParams.filename);

        // Security check - ensure the file is within the victory directory
        if (!filePath.startsWith(victoryDir)) {
            return NextResponse.json(
                { error: 'Invalid file path' },
                { status: 400 }
            );
        }

        // Check if file exists and is a PNG or SVG
        const isValidFile = resolvedParams.filename.toLowerCase().endsWith('.png') ||
            resolvedParams.filename.toLowerCase().endsWith('.svg');

        if (!isValidFile) {
            return NextResponse.json(
                { error: 'Only PNG and SVG files are supported' },
                { status: 400 }
            );
        }

        const fileBuffer = await fs.readFile(filePath);
        const contentType = resolvedParams.filename.toLowerCase().endsWith('.svg')
            ? 'image/svg+xml'
            : 'image/png';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000',
            },
        });
    } catch (error) {
        console.error('Failed to get victory meme file:', error);
        return NextResponse.json(
            { error: 'Victory meme not found' },
            { status: 404 }
        );
    }
}

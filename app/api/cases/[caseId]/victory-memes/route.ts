import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const WORKSPACE_DIR = path.join(process.cwd(), 'workspace');

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ caseId: string }> }
) {
    try {
        const resolvedParams = await params;
        const caseDir = path.join(WORKSPACE_DIR, resolvedParams.caseId);
        const victoryDir = path.join(caseDir, 'victory');

        // Check if victory directory exists
        try {
            await fs.access(victoryDir);
        } catch {
            return NextResponse.json([]);
        }

        // Read all PNG and SVG files from victory directory
        const files = await fs.readdir(victoryDir);
        const imageFiles = files.filter(file =>
            file.toLowerCase().endsWith('.png') || file.toLowerCase().endsWith('.svg')
        );

        return NextResponse.json(imageFiles);
    } catch (error) {
        console.error('Failed to get victory memes:', error);
        return NextResponse.json([]);
    }
}

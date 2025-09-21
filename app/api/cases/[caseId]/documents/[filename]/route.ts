import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(
    request: NextRequest,
    { params }: { params: { caseId: string; filename: string } }
) {
    try {
        const { caseId, filename } = await params;
        const workspacePath = path.join(process.cwd(), 'workspace', caseId);
        const filePath = path.join(workspacePath, 'docs', filename);

        // Security check - ensure the file is within the workspace
        const resolvedPath = path.resolve(filePath);
        const resolvedWorkspace = path.resolve(workspacePath);

        if (!resolvedPath.startsWith(resolvedWorkspace)) {
            return NextResponse.json(
                { error: 'Invalid file path' },
                { status: 400 }
            );
        }

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return NextResponse.json(
                { error: 'Document not found' },
                { status: 404 }
            );
        }

        // Read the file
        const fileBuffer = fs.readFileSync(filePath);
        const stats = fs.statSync(filePath);

        // Set appropriate headers for PDF download
        const headers = new Headers();
        headers.set('Content-Type', 'application/pdf');
        headers.set('Content-Length', stats.size.toString());
        headers.set('Content-Disposition', `attachment; filename="${filename}"`);

        return new NextResponse(fileBuffer, {
            status: 200,
            headers
        });
    } catch (error) {
        console.error('Error serving document:', error);
        return NextResponse.json(
            { error: 'Failed to serve document' },
            { status: 500 }
        );
    }
}

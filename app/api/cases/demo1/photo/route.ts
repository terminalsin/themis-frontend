import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const WORKSPACE_DIR = path.join(process.cwd(), 'workspace');

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('photo') as File;
        const type = formData.get('type') as string;

        if (!file || !type) {
            return NextResponse.json(
                { error: 'Missing photo file or type' },
                { status: 400 }
            );
        }

        const caseDir = path.join(WORKSPACE_DIR, 'demo1');
        const photoPath = path.join(caseDir, `${type}_photo.${file.name.split('.').pop()}`);

        // Save photo file
        const bytes = await file.arrayBuffer();
        await fs.writeFile(photoPath, new Uint8Array(bytes));

        // Update case data
        const caseFile = path.join(caseDir, 'case.json');
        const caseData = JSON.parse(await fs.readFile(caseFile, 'utf-8'));

        if (type === 'user') {
            caseData.user_photo = photoPath;
        } else {
            caseData.other_party_photo = photoPath;
        }

        caseData.updated_at = new Date().toISOString();

        await fs.writeFile(caseFile, JSON.stringify(caseData, null, 2));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to upload demo1 photo:', error);
        return NextResponse.json(
            { error: 'Failed to upload demo1 photo' },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const WORKSPACE_DIR = path.join(process.cwd(), 'workspace');

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ caseId: string }> }
) {
    try {
        const resolvedParams = await params;
        const formData = await request.formData();

        const caseDir = path.join(WORKSPACE_DIR, resolvedParams.caseId);
        const caseFile = path.join(caseDir, 'case.json');

        // Ensure case directory exists
        await fs.mkdir(caseDir, { recursive: true });

        // Get the two picture files from form data
        const userPhoto = formData.get('userPhoto') as File;
        const otherPhoto = formData.get('otherPhoto') as File;

        if (!userPhoto || !otherPhoto) {
            return NextResponse.json(
                { error: 'Both user photo and other photo are required' },
                { status: 400 }
            );
        }

        // Save user photo
        const userPhotoBuffer = Buffer.from(await userPhoto.arrayBuffer());
        const userPhotoPath = path.join(caseDir, 'user_photo.png');
        await fs.writeFile(userPhotoPath, userPhotoBuffer);

        // Save other photo
        const otherPhotoBuffer = Buffer.from(await otherPhoto.arrayBuffer());
        const otherPhotoPath = path.join(caseDir, 'other_photo.png');
        await fs.writeFile(otherPhotoPath, otherPhotoBuffer);

        // Update case data
        let caseData: any = {};
        try {
            const existingData = await fs.readFile(caseFile, 'utf-8');
            caseData = JSON.parse(existingData);
        } catch {
            // Case file doesn't exist yet, create new one
            caseData = {
                id: resolvedParams.caseId,
                created_at: new Date().toISOString(),
            };
        }

        // Update case with photo paths and mark as ready for completion
        caseData.user_photo_path = userPhotoPath;
        caseData.other_photo_path = otherPhotoPath;
        caseData.photos_stored = true;
        caseData.step = 'completed';
        caseData.updated_at = new Date().toISOString();

        await fs.writeFile(caseFile, JSON.stringify(caseData, null, 2));

        // Return success with redirect URL
        return NextResponse.json({
            success: true,
            redirectUrl: `/case/${resolvedParams.caseId}/completed`
        });

    } catch (error) {
        console.error('Failed to store pictures:', error);
        return NextResponse.json(
            { error: 'Failed to store pictures' },
            { status: 500 }
        );
    }
}

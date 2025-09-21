import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { PDFDocument } from 'pdf-lib';

export async function GET(
    request: NextRequest,
    { params }: { params: { caseId: string } }
) {
    try {
        const { caseId } = params;
        const workspacePath = path.join(process.cwd(), 'workspace', caseId);
        const docsPath = path.join(workspacePath, 'docs');

        // Check if docs directory exists
        if (!fs.existsSync(docsPath)) {
            return NextResponse.json({ documents: [] });
        }

        // Read all files in the docs directory
        const files = fs.readdirSync(docsPath);
        const pdfFiles = files.filter(file => file.endsWith('.pdf'));

        const documents = await Promise.all(
            pdfFiles.map(async (file) => {
                try {
                    const filePath = path.join(docsPath, file);
                    const pdfBytes = fs.readFileSync(filePath);
                    const pdfDoc = await PDFDocument.load(pdfBytes);

                    const metadata = {
                        title: pdfDoc.getTitle() || '',
                        author: pdfDoc.getAuthor() || '',
                        subject: pdfDoc.getSubject() || '',
                        creator: pdfDoc.getCreator() || '',
                        keywords: pdfDoc.getKeywords() || [],
                        creationDate: pdfDoc.getCreationDate(),
                        modificationDate: pdfDoc.getModificationDate(),
                    };

                    return {
                        filename: file,
                        name: cleanTitle(metadata.title) || getDocumentDisplayName(file),
                        description: cleanDescription(metadata.subject) || getDocumentDescription(file),
                        author: metadata.author,
                        creator: metadata.creator,
                        keywords: Array.isArray(metadata.keywords) ? metadata.keywords : [],
                        creationDate: metadata.creationDate?.toISOString(),
                        modificationDate: metadata.modificationDate?.toISOString(),
                        path: `/api/cases/${caseId}/documents/${file}`
                    };
                } catch (error) {
                    console.error(`Error reading PDF metadata for ${file}:`, error);
                    // Fallback to filename-based info if PDF reading fails
                    return {
                        filename: file,
                        name: getDocumentDisplayName(file),
                        description: getDocumentDescription(file),
                        path: `/api/cases/${caseId}/documents/${file}`
                    };
                }
            })
        );

        return NextResponse.json({ documents });
    } catch (error) {
        console.error('Error fetching documents:', error);
        return NextResponse.json(
            { error: 'Failed to fetch documents' },
            { status: 500 }
        );
    }
}

function cleanTitle(title: string): string {
    if (!title) return '';

    const redundantPhrases = [
        'Case Analysis Complete',
        'Legal Document',
        'PDF Document',
        'Report Document',
        'Analysis Complete',
        'Document',
        'Report'
    ];

    let cleaned = title;
    redundantPhrases.forEach(phrase => {
        const regex = new RegExp(phrase, 'gi');
        cleaned = cleaned.replace(regex, '').trim();
    });

    // Remove extra whitespace and clean up
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
}

function cleanDescription(description: string): string {
    if (!description) return '';

    const redundantPhrases = [
        'This document contains',
        'This is a',
        'Document containing',
        'Report on',
        'Analysis of'
    ];

    let cleaned = description;
    redundantPhrases.forEach(phrase => {
        const regex = new RegExp(phrase, 'gi');
        cleaned = cleaned.replace(regex, '').trim();
    });

    // Remove extra whitespace and clean up
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
}

function getDocumentDisplayName(filename: string): string {
    // Map common document prefixes to display names
    const nameMap: { [key: string]: string } = {
        'cm': 'Case Management Report',
        'pldpi': 'Personal Injury Documentation',
        'sum': 'Case Summary',
        'evidence': 'Evidence Report',
        'analysis': 'Legal Analysis',
        'timeline': 'Timeline Report'
    };

    const prefix = filename.split(/\d/)[0].toLowerCase();
    return nameMap[prefix] || filename.replace('.pdf', '').toUpperCase();
}

function getDocumentDescription(filename: string): string {
    // Map common document prefixes to descriptions
    const descriptionMap: { [key: string]: string } = {
        'cm': 'Comprehensive case management and incident analysis',
        'pldpi': 'Personal injury documentation and medical assessment',
        'sum': 'Executive summary of case findings and recommendations',
        'evidence': 'Detailed evidence analysis and documentation',
        'analysis': 'Legal analysis and fault determination',
        'timeline': 'Chronological timeline of incident events'
    };

    const prefix = filename.split(/\d/)[0].toLowerCase();
    return descriptionMap[prefix] || 'Legal document related to your case';
}

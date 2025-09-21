import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const WORKSPACE_DIR = path.join(process.cwd(), 'workspace');

export async function POST(request: NextRequest) {
    try {
        const caseDir = path.join(WORKSPACE_DIR, 'demo1');
        const caseFile = path.join(caseDir, 'case.json');

        // Update case step to document generation
        const caseData = JSON.parse(await fs.readFile(caseFile, 'utf-8'));
        caseData.step = 'document_generation';
        caseData.updated_at = new Date().toISOString();

        await fs.writeFile(caseFile, JSON.stringify(caseData, null, 2));

        // Start document generation workflow (placeholder)
        setTimeout(async () => {
            try {
                // Mock document generation
                const documentContent = generateDemo1Document(caseData);
                const documentPath = path.join(caseDir, 'case_document.html');

                await fs.writeFile(documentPath, documentContent);

                // Update case with document path
                const updatedCaseData = JSON.parse(await fs.readFile(caseFile, 'utf-8'));
                updatedCaseData.document_path = documentPath;
                updatedCaseData.step = 'completed';
                updatedCaseData.updated_at = new Date().toISOString();

                await fs.writeFile(caseFile, JSON.stringify(updatedCaseData, null, 2));
            } catch (error) {
                console.error('Failed to generate demo1 document:', error);
            }
        }, 3000);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to start demo1 document generation:', error);
        return NextResponse.json(
            { error: 'Failed to start demo1 document generation' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const caseDir = path.join(WORKSPACE_DIR, 'demo1');
        const documentPath = path.join(caseDir, 'case_document.html');

        const documentContent = await fs.readFile(documentPath, 'utf-8');

        return new NextResponse(documentContent, {
            headers: {
                'Content-Type': 'text/html',
                'Content-Disposition': `attachment; filename="case_demo1.html"`,
            },
        });
    } catch (error) {
        console.error('Failed to get demo1 document:', error);
        return NextResponse.json(
            { error: 'Demo1 document not found' },
            { status: 404 }
        );
    }
}

function generateDemo1Document(caseData: any): string {
    const analysis = caseData.analysis;
    const date = new Date().toLocaleDateString();

    return `
<!DOCTYPE html>
<html>
<head>
    <title>Legal Case Document - Demo1 Case</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
        .timeline { background: #f9f9f9; padding: 20px; border-left: 4px solid #007bff; }
        .timestamp { font-weight: bold; color: #007bff; }
        .resolution { background: #e8f5e9; padding: 20px; border-radius: 5px; }
        .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; }
        .demo-banner { background: #ff9800; color: white; padding: 10px; text-align: center; font-weight: bold; }
    </style>
</head>
<body>
    <div class="demo-banner">
        🚨 DEMO CASE - SAMPLE DATA ONLY 🚨
    </div>
    
    <div class="header">
        <h1>LEGAL CASE ANALYSIS REPORT</h1>
        <p>Case ID: DEMO1 (Demonstration Case)</p>
        <p>Generated: ${date}</p>
    </div>

    <div class="section">
        <h2>CASE SUMMARY</h2>
        <p>This is a demonstration case showing a clear-cut scenario where the other party is at fault. 
        The demo vehicle had the right of way when struck by a red light runner.</p>
    </div>

    <div class="section">
        <h2>INCIDENT TIMELINE</h2>
        <div class="timeline">
            ${analysis.timeline.map((item: any) => `
                <div style="margin-bottom: 15px;">
                    <div class="timestamp">${item.timestamp}</div>
                    <div>${item.description}</div>
                </div>
            `).join('')}
        </div>
    </div>

    <div class="section">
        <h2>FAULT ANALYSIS</h2>
        <div class="resolution">
            <h3>Resolution: ${analysis.resolution.replace('-', ' ').toUpperCase()}</h3>
            <p><strong>Details:</strong> ${analysis.resolution_details}</p>
            
            <h4>Party Analysis:</h4>
            ${analysis.parties.map((party: any) => `
                <p><strong>${party.party.toUpperCase()}:</strong> ${party.at_fault ? 'At Fault' : 'Not At Fault'}</p>
            `).join('')}
        </div>
    </div>

    <div class="section">
        <h2>LEGAL RECOMMENDATION</h2>
        <p>Based on the video analysis, this demo case shows clear evidence of fault by the other party. 
        This is an excellent example of a strong case with clear liability.</p>
    </div>

    <div class="footer">
        <p>This document was generated by Themis AI Legal Analysis System (Demo Mode)</p>
        <p>For legal advice, please consult with a qualified attorney</p>
    </div>
</body>
</html>
  `;
}

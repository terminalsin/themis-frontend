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
        const caseDir = path.join(WORKSPACE_DIR, resolvedParams.caseId);
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
                const documentContent = generateMockDocument(caseData);
                const documentPath = path.join(caseDir, 'case_document.html');

                await fs.writeFile(documentPath, documentContent);

                // Update case with document path
                const updatedCaseData = JSON.parse(await fs.readFile(caseFile, 'utf-8'));
                updatedCaseData.document_path = documentPath;
                updatedCaseData.step = 'completed';
                updatedCaseData.updated_at = new Date().toISOString();

                await fs.writeFile(caseFile, JSON.stringify(updatedCaseData, null, 2));
            } catch (error) {
                console.error('Failed to generate document:', error);
            }
        }, 3000);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to start document generation:', error);
        return NextResponse.json(
            { error: 'Failed to start document generation' },
            { status: 500 }
        );
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ caseId: string }> }
) {
    try {
        const resolvedParams = await params;
        const url = new URL(request.url);
        const docType = url.searchParams.get('type') || '1';

        const caseDir = path.join(WORKSPACE_DIR, resolvedParams.caseId);
        const caseFile = path.join(caseDir, 'case.json');
        const caseData = JSON.parse(await fs.readFile(caseFile, 'utf-8'));

        // Generate different document types
        let documentContent: string;
        let filename: string;

        switch (docType) {
            case '1':
                documentContent = generateCaseSummary(caseData);
                filename = `case_summary_${resolvedParams.caseId}.html`;
                break;
            case '2':
                documentContent = generateEvidenceReport(caseData);
                filename = `evidence_report_${resolvedParams.caseId}.html`;
                break;
            case '3':
                documentContent = generateLegalAssessment(caseData);
                filename = `legal_assessment_${resolvedParams.caseId}.html`;
                break;
            case '4':
                documentContent = generateRecommendations(caseData);
                filename = `recommendations_${resolvedParams.caseId}.html`;
                break;
            default:
                documentContent = generateMockDocument(caseData);
                filename = `case_${resolvedParams.caseId}.html`;
        }

        return new NextResponse(documentContent, {
            headers: {
                'Content-Type': 'text/html',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error('Failed to get document:', error);
        return NextResponse.json(
            { error: 'Document not found' },
            { status: 404 }
        );
    }
}

function generateMockDocument(caseData: any): string {
    const analysis = caseData.analysis;
    const date = new Date().toLocaleDateString();

    return `
<!DOCTYPE html>
<html>
<head>
    <title>Legal Case Document - Case ${caseData.id}</title>
    <style>
        body { font-family: Georgia, serif; margin: 40px; line-height: 1.6; color: #333; }
        .header { text-align: center; border-bottom: 1px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
        .timeline { background: #f9f9f9; padding: 20px; border-left: 2px solid #333; }
        .timestamp { font-weight: bold; color: #333; }
        .resolution { background: #f5f5f5; padding: 20px; border: 1px solid #ccc; }
        .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>LEGAL CASE ANALYSIS REPORT</h1>
        <p>Case ID: ${caseData.id}</p>
        <p>Generated: ${date}</p>
    </div>

    <div class="section">
        <h2>CASE SUMMARY</h2>
        <p>This document presents a comprehensive analysis of the incident captured in the submitted video evidence.</p>
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
        <p>Based on the video analysis, this case shows clear evidence of fault by the other party. 
        We recommend proceeding with legal action to recover damages and assert your rights.</p>
    </div>

    <div class="footer">
        <p>This document was generated by Themis AI Legal Analysis System</p>
        <p>For legal advice, please consult with a qualified attorney</p>
    </div>
</body>
</html>
  `;
}

function generateCaseSummary(caseData: any): string {
    const analysis = caseData.analysis;
    const date = new Date().toLocaleDateString();

    return `
<!DOCTYPE html>
<html>
<head>
    <title>Case Summary - ${caseData.id}</title>
    <style>
        body { font-family: Georgia, serif; margin: 40px; line-height: 1.8; color: #333; }
        .header { text-align: center; border-bottom: 1px solid #333; padding-bottom: 20px; margin-bottom: 40px; }
        .section { margin-bottom: 40px; }
        h1 { font-size: 28px; font-weight: normal; }
        h2 { font-size: 20px; font-weight: normal; margin-bottom: 20px; }
        .footer { margin-top: 60px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ccc; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>CASE SUMMARY</h1>
        <p>Case Reference: ${caseData.id}</p>
        <p>Date of Analysis: ${date}</p>
    </div>

    <div class="section">
        <h2>Executive Summary</h2>
        <p>This document provides a comprehensive overview of the incident analysis conducted on the submitted video evidence. The case has been thoroughly examined using advanced AI analysis to determine fault and liability.</p>
    </div>

    <div class="section">
        <h2>Incident Overview</h2>
        <p><strong>Resolution:</strong> ${analysis.resolution.replace('-', ' ').toUpperCase()}</p>
        <p><strong>Analysis Details:</strong> ${analysis.resolution_details}</p>
    </div>

    <div class="section">
        <h2>Key Findings</h2>
        <p>The analysis has determined the following key findings based on video evidence and traffic law assessment:</p>
        <ul>
            ${analysis.parties.map((party: any) => `
                <li><strong>${party.party === 'self' ? 'Claimant' : 'Other Party'}:</strong> ${party.at_fault ? 'Found at fault' : 'Not at fault'}</li>
            `).join('')}
        </ul>
    </div>

    <div class="footer">
        <p>Themis AI Legal Analysis System</p>
        <p>This summary is for informational purposes only. Consult with a qualified attorney for legal advice.</p>
    </div>
</body>
</html>`;
}

function generateEvidenceReport(caseData: any): string {
    const analysis = caseData.analysis;
    const date = new Date().toLocaleDateString();

    return `
<!DOCTYPE html>
<html>
<head>
    <title>Evidence Report - ${caseData.id}</title>
    <style>
        body { font-family: Georgia, serif; margin: 40px; line-height: 1.8; color: #333; }
        .header { text-align: center; border-bottom: 1px solid #333; padding-bottom: 20px; margin-bottom: 40px; }
        .section { margin-bottom: 40px; }
        .timeline { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .timestamp { font-weight: bold; margin-bottom: 5px; }
        h1 { font-size: 28px; font-weight: normal; }
        h2 { font-size: 20px; font-weight: normal; margin-bottom: 20px; }
        .footer { margin-top: 60px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ccc; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>VIDEO EVIDENCE ANALYSIS REPORT</h1>
        <p>Case Reference: ${caseData.id}</p>
        <p>Analysis Date: ${date}</p>
    </div>

    <div class="section">
        <h2>Evidence Overview</h2>
        <p>This report details the comprehensive analysis of video evidence submitted for case ${caseData.id}. The analysis employed advanced computer vision and AI algorithms to extract key moments and determine sequence of events.</p>
    </div>

    <div class="section">
        <h2>Timeline of Events</h2>
        <div class="timeline">
            ${analysis.timeline.map((item: any, index: number) => `
                <div style="margin-bottom: 20px; padding-bottom: 15px; ${index < analysis.timeline.length - 1 ? 'border-bottom: 1px solid #ccc;' : ''}">
                    <div class="timestamp">Timestamp: ${item.timestamp}</div>
                    <div><strong>Event ${index + 1}:</strong> ${item.description}</div>
                </div>
            `).join('')}
        </div>
    </div>

    <div class="section">
        <h2>Technical Analysis</h2>
        <p>The video evidence was processed using state-of-the-art AI analysis tools that examined vehicle movements, traffic patterns, and adherence to traffic regulations. The analysis considered factors including speed, positioning, right-of-way, and traffic signal compliance.</p>
    </div>

    <div class="footer">
        <p>Themis AI Legal Analysis System - Evidence Analysis Division</p>
        <p>This report contains technical analysis for legal reference purposes.</p>
    </div>
</body>
</html>`;
}

function generateLegalAssessment(caseData: any): string {
    const analysis = caseData.analysis;
    const date = new Date().toLocaleDateString();

    return `
<!DOCTYPE html>
<html>
<head>
    <title>Legal Assessment - ${caseData.id}</title>
    <style>
        body { font-family: Georgia, serif; margin: 40px; line-height: 1.8; color: #333; }
        .header { text-align: center; border-bottom: 1px solid #333; padding-bottom: 20px; margin-bottom: 40px; }
        .section { margin-bottom: 40px; }
        .assessment { background: #f5f5f5; padding: 25px; border: 1px solid #ccc; margin: 20px 0; }
        h1 { font-size: 28px; font-weight: normal; }
        h2 { font-size: 20px; font-weight: normal; margin-bottom: 20px; }
        .footer { margin-top: 60px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ccc; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>LEGAL FAULT ASSESSMENT</h1>
        <p>Case Reference: ${caseData.id}</p>
        <p>Assessment Date: ${date}</p>
    </div>

    <div class="section">
        <h2>Legal Determination</h2>
        <div class="assessment">
            <h3>Primary Finding: ${analysis.resolution.replace('-', ' ').toUpperCase()}</h3>
            <p><strong>Legal Basis:</strong> ${analysis.resolution_details}</p>
        </div>
    </div>

    <div class="section">
        <h2>Party Liability Analysis</h2>
        ${analysis.parties.map((party: any) => `
            <div class="assessment">
                <h3>${party.party === 'self' ? 'Claimant Analysis' : 'Defendant Analysis'}</h3>
                <p><strong>Liability Status:</strong> ${party.at_fault ? 'At Fault - Liable for damages' : 'Not At Fault - No liability established'}</p>
                <p><strong>Legal Implications:</strong> ${party.at_fault
            ? 'This party bears legal responsibility for the incident and associated damages.'
            : 'This party is not legally responsible and may be entitled to compensation for damages suffered.'
        }</p>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>Legal Precedent</h2>
        <p>This assessment is based on established traffic law principles, statutory regulations, and common law precedents governing motor vehicle incidents. The determination considers duty of care, breach of that duty, causation, and resulting damages.</p>
    </div>

    <div class="footer">
        <p>Themis AI Legal Analysis System - Legal Assessment Division</p>
        <p><strong>IMPORTANT:</strong> This assessment is for informational purposes only and does not constitute legal advice. Consult with a qualified attorney for legal representation.</p>
    </div>
</body>
</html>`;
}

function generateRecommendations(caseData: any): string {
    const analysis = caseData.analysis;
    const hasCase = caseData.has_case;
    const date = new Date().toLocaleDateString();

    return `
<!DOCTYPE html>
<html>
<head>
    <title>Legal Recommendations - ${caseData.id}</title>
    <style>
        body { font-family: Georgia, serif; margin: 40px; line-height: 1.8; color: #333; }
        .header { text-align: center; border-bottom: 1px solid #333; padding-bottom: 20px; margin-bottom: 40px; }
        .section { margin-bottom: 40px; }
        .recommendation { background: #f9f9f9; padding: 20px; border-left: 4px solid #333; margin: 15px 0; }
        .priority { font-weight: bold; color: #333; }
        h1 { font-size: 28px; font-weight: normal; }
        h2 { font-size: 20px; font-weight: normal; margin-bottom: 20px; }
        .footer { margin-top: 60px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ccc; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>LEGAL RECOMMENDATIONS</h1>
        <p>Case Reference: ${caseData.id}</p>
        <p>Recommendation Date: ${date}</p>
    </div>

    <div class="section">
        <h2>Case Viability Assessment</h2>
        <div class="recommendation">
            <p class="priority">${hasCase ? 'VIABLE LEGAL CASE IDENTIFIED' : 'LIMITED LEGAL VIABILITY'}</p>
            <p>${hasCase
            ? 'Based on our analysis, you have strong grounds for pursuing legal action. The evidence supports your position and indicates liability on the part of the other party.'
            : 'Our analysis indicates limited grounds for legal action. The evidence suggests you may bear primary responsibility for the incident.'
        }</p>
        </div>
    </div>

    <div class="section">
        <h2>Immediate Action Items</h2>
        ${hasCase ? `
            <div class="recommendation">
                <p class="priority">HIGH PRIORITY:</p>
                <p>1. Preserve all evidence including the video analysis and this documentation</p>
                <p>2. Consult with a qualified personal injury attorney within 30 days</p>
                <p>3. Gather additional supporting documentation (medical records, repair estimates, witness statements)</p>
            </div>
            <div class="recommendation">
                <p class="priority">MEDIUM PRIORITY:</p>
                <p>1. Document all ongoing damages and expenses related to the incident</p>
                <p>2. Avoid discussing the case with the other party's insurance without legal representation</p>
                <p>3. Consider the statute of limitations in your jurisdiction</p>
            </div>
        ` : `
            <div class="recommendation">
                <p class="priority">RECOMMENDED ACTIONS:</p>
                <p>1. Review your insurance coverage and file appropriate claims</p>
                <p>2. Consider defensive driving courses to prevent future incidents</p>
                <p>3. Document any damages for insurance purposes</p>
                <p>4. Learn from this experience to improve future driving safety</p>
            </div>
        `}
    </div>

    <div class="section">
        <h2>Legal Considerations</h2>
        <p>${hasCase
            ? 'Time is of the essence in personal injury cases. Most jurisdictions have statutes of limitations that require legal action to be initiated within a specific timeframe. We strongly recommend consulting with an attorney promptly to protect your rights and maximize your potential recovery.'
            : 'While this incident may not provide grounds for legal action against the other party, it is important to understand your insurance coverage and ensure all appropriate claims are filed. Consider this an opportunity to review and potentially improve your coverage for future protection.'
        }</p>
    </div>

    <div class="footer">
        <p>Themis AI Legal Analysis System - Advisory Division</p>
        <p><strong>DISCLAIMER:</strong> These recommendations are based on AI analysis and are not a substitute for professional legal advice. Always consult with a qualified attorney for legal matters.</p>
    </div>
</body>
</html>`;
}

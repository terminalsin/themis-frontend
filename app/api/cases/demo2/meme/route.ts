import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const WORKSPACE_DIR = path.join(process.cwd(), 'workspace');

export async function POST(request: NextRequest) {
    try {
        const caseDir = path.join(WORKSPACE_DIR, 'demo2');
        const caseFile = path.join(caseDir, 'case.json');

        // Start meme generation workflow (hardcoded for demo)
        setTimeout(async () => {
            try {
                const caseData = JSON.parse(await fs.readFile(caseFile, 'utf-8'));

                // Create SVG meme with hardcoded response
                const memeContent = generateDemo2Meme(caseData);
                const memePath = path.join(caseDir, 'celebration_meme.svg');

                await fs.writeFile(memePath, memeContent);

                // Update case with meme path (already has gemini_meme_response)
                caseData.meme_path = memePath;
                caseData.updated_at = new Date().toISOString();

                await fs.writeFile(caseFile, JSON.stringify(caseData, null, 2));
            } catch (error) {
                console.error('Failed to generate demo2 meme:', error);
            }
        }, 2000);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to start demo2 meme generation:', error);
        return NextResponse.json(
            { error: 'Failed to start demo2 meme generation' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const responseType = url.searchParams.get('type');

        const caseDir = path.join(WORKSPACE_DIR, 'demo2');
        const caseFile = path.join(caseDir, 'case.json');

        // If requesting just the Gemini response
        if (responseType === 'response') {
            try {
                const caseData = JSON.parse(await fs.readFile(caseFile, 'utf-8'));
                const geminiResponse = caseData.gemini_meme_response || 'No Gemini response available';

                return NextResponse.json({
                    gemini_response: geminiResponse,
                    case_status: caseData.has_case ? 'HAS CASE' : 'NO CASE',
                    resolution: caseData.analysis?.resolution || 'unknown'
                });
            } catch (error) {
                return NextResponse.json(
                    { error: 'Demo2 case data not found' },
                    { status: 404 }
                );
            }
        }

        // Default: return the SVG meme
        const memePath = path.join(caseDir, 'celebration_meme.svg');
        const memeContent = await fs.readFile(memePath, 'utf-8');

        return new NextResponse(memeContent, {
            headers: {
                'Content-Type': 'image/svg+xml',
            },
        });
    } catch (error) {
        console.error('Failed to get demo2 meme:', error);
        return NextResponse.json(
            { error: 'Demo2 meme not found' },
            { status: 404 }
        );
    }
}

function generateDemo2Meme(caseData: any): string {
    const hasCase = caseData.has_case;
    const resolution = caseData.analysis?.resolution || 'unknown';
    const geminiResponse = caseData.gemini_meme_response;

    // Create an SVG that includes the Gemini response
    const backgroundColor = hasCase ? '#4CAF50' : '#FF9800';
    const title = hasCase ? '🎉 DEMO2 MEME! 🎉' : '😅 DEMO2 MEME 😅';

    // Split the Gemini response into lines for better display
    const responseLines = geminiResponse.split('\n').filter((line: string) => line.trim());
    const maxLineLength = 50;
    const wrappedLines: string[] = [];

    responseLines.forEach((line: string) => {
        if (line.length <= maxLineLength) {
            wrappedLines.push(line);
        } else {
            const words = line.split(' ');
            let currentLine = '';
            words.forEach(word => {
                if ((currentLine + word).length <= maxLineLength) {
                    currentLine += (currentLine ? ' ' : '') + word;
                } else {
                    if (currentLine) wrappedLines.push(currentLine);
                    currentLine = word;
                }
            });
            if (currentLine) wrappedLines.push(currentLine);
        }
    });

    // Limit to first 8 lines to fit in SVG
    const displayLines = wrappedLines.slice(0, 8);

    let svgContent = `
<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="400" fill="${backgroundColor}"/>
  <text x="300" y="40" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="white">
    ${title}
  </text>
  <text x="300" y="70" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="white">
    Demo Meme Description:
  </text>`;

    // Add each line of the Gemini response
    displayLines.forEach((line, index) => {
        const yPosition = 100 + (index * 20);
        svgContent += `
  <text x="300" y="${yPosition}" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="white">
    ${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
  </text>`;
    });

    // Add case info at the bottom
    svgContent += `
  <text x="300" y="350" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="white">
    Demo Case Status: ${hasCase ? 'HAS CASE' : 'NO CASE'} | Resolution: ${resolution.replace('-', ' ').toUpperCase()}
  </text>
  <text x="300" y="380" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="white">
    🚗😅📏😅🚗
  </text>
</svg>`;

    return svgContent;
}

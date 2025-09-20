import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

const WORKSPACE_DIR = path.join(process.cwd(), 'workspace');
const PUBLIC_DIR = path.join(process.cwd(), 'public');

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const resolvedParams = await params;
    const caseDir = path.join(WORKSPACE_DIR, resolvedParams.caseId);
    const caseFile = path.join(caseDir, 'case.json');

    // Check if GEMINI_API_KEY is available
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY environment variable is required' },
        { status: 500 }
      );
    }

    // Start meme generation workflow with Gemini API
    setTimeout(async () => {
      try {
        const caseData = JSON.parse(await fs.readFile(caseFile, 'utf-8'));

        // Generate meme using Gemini API
        const memeResponse = await generateMemeWithGemini(resolvedParams.caseId, apiKey);

        // Create SVG meme with Gemini's response
        const memeContent = generateMemeFromGeminiResponse(caseData, memeResponse);
        const memePath = path.join(caseDir, 'celebration_meme.svg');

        await fs.writeFile(memePath, memeContent);

        // Update case with meme path and Gemini response
        caseData.meme_path = memePath;
        caseData.gemini_meme_response = memeResponse;
        caseData.updated_at = new Date().toISOString();

        await fs.writeFile(caseFile, JSON.stringify(caseData, null, 2));
      } catch (error) {
        console.error('Failed to generate meme:', error);
      }
    }, 2000);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to start meme generation:', error);
    return NextResponse.json(
      { error: 'Failed to start meme generation' },
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
    const responseType = url.searchParams.get('type');

    const caseDir = path.join(WORKSPACE_DIR, resolvedParams.caseId);
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
          { error: 'Case data not found' },
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
    console.error('Failed to get meme:', error);
    return NextResponse.json(
      { error: 'Meme not found' },
      { status: 404 }
    );
  }
}

async function generateMemeWithGemini(caseId: string, apiKey: string): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey });

    // Read the ID picture from workspace
    const caseDir = path.join(WORKSPACE_DIR, caseId);
    const idPicturePath = path.join(caseDir, 'user_photo.png');

    // Read the maniac picture from public folder
    const maniacPicturePath = path.join(PUBLIC_DIR, 'maniac.jpg');

    // Check if both images exist
    let idPictureExists = false;
    let maniacPictureExists = false;

    try {
      await fs.access(idPicturePath);
      idPictureExists = true;
    } catch {
      console.log('ID picture not found for case:', caseId);
    }

    try {
      await fs.access(maniacPicturePath);
      maniacPictureExists = true;
    } catch {
      console.log('Maniac picture not found');
    }

    if (!idPictureExists || !maniacPictureExists) {
      return 'Could not find required images for meme generation';
    }

    // Read both images as base64
    const idPictureBuffer = await fs.readFile(idPicturePath);
    const maniacPictureBuffer = await fs.readFile(maniacPicturePath);

    const idPictureBase64 = idPictureBuffer.toString('base64');
    const maniacPictureBase64 = maniacPictureBuffer.toString('base64');

    // Create the prompt for Gemini
    const prompt = `Look at these two images. The first image is an ID picture of someone involved in a legal case. The second image is a "maniac" reference image. 

Create a humorous meme description that combines these images in a funny way, as if the person from the ID picture should be placed into the maniac picture scenario. Make it witty and appropriate for a legal case context. The meme should be about making the ID picture person appear in the wanted maniac picture style.

Respond with a creative, funny meme caption or description that would work well for this combination.`;

    // Make the API call to Gemini with both images
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'image/png',
                data: idPictureBase64
              }
            },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: maniacPictureBase64
              }
            }
          ]
        }
      ],
      config: {
        maxOutputTokens: 500,
        temperature: 0.8
      }
    });

    const memeDescription = response.candidates?.[0]?.content?.parts?.[0]?.text || 'Failed to generate meme description';
    return memeDescription;

  } catch (error) {
    console.error('Error generating meme with Gemini:', error);
    return 'Error generating meme with AI';
  }
}

function generateMemeFromGeminiResponse(caseData: any, geminiResponse: string): string {
  const hasCase = caseData.has_case;
  const resolution = caseData.analysis?.resolution || 'unknown';

  // Create an SVG that includes the Gemini response
  const backgroundColor = hasCase ? '#4CAF50' : '#FF9800';
  const title = hasCase ? '🎉 MEME GENERATED! 🎉' : '😅 MEME ATTEMPT 😅';

  // Split the Gemini response into lines for better display
  const responseLines = geminiResponse.split('\n').filter(line => line.trim());
  const maxLineLength = 50;
  const wrappedLines: string[] = [];

  responseLines.forEach(line => {
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
    AI-Generated Meme Description:
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
    Case Status: ${hasCase ? 'HAS CASE' : 'NO CASE'} | Resolution: ${resolution.replace('-', ' ').toUpperCase()}
  </text>
  <text x="300" y="380" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="white">
    🤖✨🎭✨🤖
  </text>
</svg>`;

  return svgContent;
}

import { NextRequest } from 'next/server';
import { POST, GET } from '../../app/api/cases/[caseId]/meme/route';
import { promises as fs } from 'fs';
import path from 'path';

// Mock the Google Generative AI
jest.mock('@google/genai', () => ({
    GoogleGenAI: jest.fn().mockImplementation(() => ({
        models: {
            generateContent: jest.fn().mockResolvedValue({
                candidates: [{
                    content: {
                        parts: [{
                            text: 'Mock meme description: This person looks like they belong on a wanted poster!'
                        }]
                    }
                }]
            })
        }
    }))
}));

// Mock fs promises
jest.mock('fs', () => ({
    promises: {
        readFile: jest.fn(),
        writeFile: jest.fn(),
        access: jest.fn()
    }
}));

const mockFs = fs as jest.Mocked<typeof fs>;

describe('/api/cases/[caseId]/meme', () => {
    const mockCaseId = 'test-case-id';
    const mockCaseData = {
        has_case: true,
        analysis: {
            resolution: 'settlement'
        }
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Set up environment variable
        process.env.GEMINI_API_KEY = 'test-api-key';
    });

    afterEach(() => {
        delete process.env.GEMINI_API_KEY;
    });

    describe('POST', () => {
        it('should return success when API key is provided', async () => {
            const request = new NextRequest('http://localhost:3000/api/cases/test-case-id/meme', {
                method: 'POST'
            });

            const params = Promise.resolve({ caseId: mockCaseId });
            const response = await POST(request, { params });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
        });

        it('should return error when API key is missing', async () => {
            delete process.env.GEMINI_API_KEY;

            const request = new NextRequest('http://localhost:3000/api/cases/test-case-id/meme', {
                method: 'POST'
            });

            const params = Promise.resolve({ caseId: mockCaseId });
            const response = await POST(request, { params });
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('GEMINI_API_KEY environment variable is required');
        });
    });

    describe('GET', () => {
        it('should return SVG meme content', async () => {
            const mockSvgContent = '<svg>Mock SVG content</svg>';
            mockFs.readFile.mockResolvedValue(mockSvgContent);

            const request = new NextRequest('http://localhost:3000/api/cases/test-case-id/meme');
            const params = Promise.resolve({ caseId: mockCaseId });
            const response = await GET(request, { params });

            expect(response.status).toBe(200);
            expect(response.headers.get('Content-Type')).toBe('image/svg+xml');

            const content = await response.text();
            expect(content).toBe(mockSvgContent);
        });

        it('should return Gemini response when type=response', async () => {
            mockFs.readFile.mockResolvedValue(JSON.stringify({
                ...mockCaseData,
                gemini_meme_response: 'Mock Gemini response'
            }));

            const request = new NextRequest('http://localhost:3000/api/cases/test-case-id/meme?type=response');
            const params = Promise.resolve({ caseId: mockCaseId });
            const response = await GET(request, { params });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.gemini_response).toBe('Mock Gemini response');
            expect(data.case_status).toBe('HAS CASE');
            expect(data.resolution).toBe('settlement');
        });

        it('should return 404 when meme not found', async () => {
            mockFs.readFile.mockRejectedValue(new Error('File not found'));

            const request = new NextRequest('http://localhost:3000/api/cases/test-case-id/meme');
            const params = Promise.resolve({ caseId: mockCaseId });
            const response = await GET(request, { params });
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.error).toBe('Meme not found');
        });
    });
});

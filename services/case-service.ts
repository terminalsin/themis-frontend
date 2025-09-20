import { Case, CaseStep } from '@/types/case';

export class CaseService {
    private static baseUrl = '/api/cases';

    static async createCase(): Promise<{ caseId: string }> {
        console.log('Making request to:', `${CaseService.baseUrl}`);

        const response = await fetch(`${CaseService.baseUrl}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`Failed to create case: ${response.status} ${errorText}`);
        }

        const result = await response.json();
        console.log('Response data:', result);
        return result;
    }

    static async uploadVideo(caseId: string, file: File): Promise<void> {
        const formData = new FormData();
        formData.append('video', file);

        const response = await fetch(`${CaseService.baseUrl}/${caseId}/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to upload video');
        }
    }

    static async getCase(caseId: string): Promise<Case> {
        const response = await fetch(`${CaseService.baseUrl}/${caseId}`);

        if (!response.ok) {
            throw new Error('Failed to get case');
        }

        return response.json();
    }

    static async updateCaseStep(caseId: string, step: CaseStep): Promise<void> {
        const response = await fetch(`${CaseService.baseUrl}/${caseId}/step`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ step }),
        });

        if (!response.ok) {
            throw new Error('Failed to update case step');
        }
    }

    static async startAnalysis(caseId: string): Promise<void> {
        const response = await fetch(`${CaseService.baseUrl}/${caseId}/analyze`, {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error('Failed to start analysis');
        }
    }

    static async uploadPhoto(caseId: string, file: File, type: 'user' | 'other'): Promise<void> {
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('type', type);

        const response = await fetch(`${CaseService.baseUrl}/${caseId}/photo`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to upload photo');
        }
    }

    static async generateDocument(caseId: string): Promise<void> {
        const response = await fetch(`${CaseService.baseUrl}/${caseId}/document`, {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error('Failed to generate document');
        }
    }

    static async generateMeme(caseId: string): Promise<void> {
        const response = await fetch(`${CaseService.baseUrl}/${caseId}/meme`, {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error('Failed to generate meme');
        }
    }

    static async startProcessing(caseId: string): Promise<void> {
        const response = await fetch(`${CaseService.baseUrl}/${caseId}/process`, {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error('Failed to start processing');
        }
    }
}

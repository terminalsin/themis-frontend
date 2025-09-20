'use client';

import React from 'react';
import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';

export const DebugPanel: React.FC = () => {
    const testFileInput = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/*';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                console.log('Direct file input test - File selected:', file.name);
                alert(`File selected: ${file.name}`);
            }
        };
        input.click();
    };

    const testApiCall = async () => {
        try {
            console.log('Testing API call...');
            console.log('Current URL:', window.location.href);
            console.log('Making request to: /api/cases');

            const response = await fetch('/api/cases', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                alert(`Error: ${response.status} - ${errorText}`);
                return;
            }

            const result = await response.json();
            console.log('Success result:', result);
            alert(`Success! Case ID: ${result.caseId}`);
        } catch (error) {
            console.error('Fetch error:', error);
            alert(`Fetch error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <h3 className="text-lg font-semibold">Debug Panel</h3>
            </CardHeader>
            <CardBody className="space-y-4">
                <Button onClick={testApiCall} color="primary">
                    Test API Call
                </Button>
                <Button onClick={testFileInput} color="secondary">
                    Test File Input
                </Button>
                <div className="mt-4 text-sm text-gray-600">
                    <p>Current URL: {typeof window !== 'undefined' ? window.location.href : 'SSR'}</p>
                </div>
            </CardBody>
        </Card>
    );
};

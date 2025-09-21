'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCase } from '@/hooks/use-case';
import { Spinner } from '@heroui/spinner';

export default function CasePage() {
    const params = useParams();
    const router = useRouter();
    const caseId = params.caseId as string;
    const { data: caseData, isLoading, error } = useCase(caseId);

    // Always redirect to resolution page - it handles all loading states
    React.useEffect(() => {
        if (caseData) {
            router.push(`/case/${caseId}/resolution`);
        }
    }, [caseData, caseId, router]);

    if (isLoading) {
        return (
            <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <div className="text-center space-y-6">
                    <Spinner size="lg" />
                    <div className="space-y-2">
                        <h1 className="text-2xl font-light text-gray-900 serif-display">
                            Loading Case
                        </h1>
                        <p className="text-gray-600 serif-body">
                            Retrieving your case details...
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    if (error || !caseData) {
        return (
            <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <div className="text-center space-y-6 max-w-md">
                    <div className="text-6xl">😔</div>
                    <div className="space-y-4">
                        <h1 className="text-3xl font-light text-gray-900 serif-display">
                            Case Not Found
                        </h1>
                        <p className="text-gray-600 serif-body leading-relaxed">
                            We couldn't find the case you're looking for. It may have been deleted or the link may be incorrect.
                        </p>
                    </div>
                    <a
                        href="/"
                        className="inline-block px-6 py-3 bg-gray-900 text-white serif-body font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200"
                    >
                        Start New Case
                    </a>
                </div>
            </main>
        );
    }

    // This will only render briefly before the redirect
    return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
            <div className="text-center space-y-6">
                <Spinner size="lg" />
                <div className="space-y-2">
                    <h1 className="text-2xl font-light text-gray-900 serif-display">
                        Redirecting...
                    </h1>
                    <p className="text-gray-600 serif-body">
                        Taking you to the current step
                    </p>
                </div>
            </div>
        </main>
    );
}

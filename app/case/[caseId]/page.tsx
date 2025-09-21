'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCase } from '@/hooks/use-case';
import { CaseLoading } from '@/components/case-loading';
import { CaseError } from '@/components/case-error';

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
        return <CaseLoading />;
    }

    if (error || !caseData) {
        return <CaseError />;
    }

    // This will only render briefly before the redirect
    return (
        <CaseLoading
            title="Redirecting..."
            subtitle="Taking you to the current step"
            icon="🔄"
        />
    );
}

'use client';

import React, { useState } from 'react';
import { ProcessingStep } from './steps/processing-step';
import { AnalysisStep } from './steps/analysis-step';
import { TimelineAnalysisStep } from './steps/timeline-analysis-step';
import { ResolutionStep } from './steps/resolution-step';
import { DocumentGenerationStep } from './steps/document-generation-step';
import { CompletedStep } from './steps/completed-step';
import { Case } from '@/types/case';
import { useUploadPhoto, useGenerateDocument, useGenerateMeme } from '@/hooks/use-case';

interface CaseFlowProps {
    case: Case;
    className?: string;
}

export const CaseFlow: React.FC<CaseFlowProps> = ({ case: caseData, className = "" }) => {
    const [userPhoto, setUserPhoto] = useState<File | null>(null);
    const [otherPartyPhoto, setOtherPartyPhoto] = useState<File | null>(null);

    const uploadPhoto = useUploadPhoto();
    const generateDocument = useGenerateDocument();
    const generateMeme = useGenerateMeme();

    const handlePhotoUpload = async (file: File, type: 'user' | 'other') => {
        await uploadPhoto.mutateAsync({ caseId: caseData.id, file, type });
        if (type === 'user') setUserPhoto(file);
        else setOtherPartyPhoto(file);
    };

    const handleGenerateDocument = async () => {
        await generateDocument.mutateAsync(caseData.id);
    };

    const handleGenerateMeme = async () => {
        await generateMeme.mutateAsync(caseData.id);
    };

    const renderStepContent = () => {
        switch (caseData.step) {
            case 'processing':
                return <ProcessingStep />;

            case 'analysis':
                return <AnalysisStep />;

            case 'timeline_analysis':
                return <TimelineAnalysisStep />;

            case 'resolution':
                if (!caseData.analysis) return null;

                return (
                    <ResolutionStep
                        caseId={caseData.id}
                        analysis={caseData.analysis}
                        hasCase={caseData.has_case || false}
                        onGenerateCase={handleGenerateDocument}
                        onGenerateSobs={handleGenerateMeme}
                        isGeneratingCase={generateDocument.isPending}
                        isGeneratingSobs={generateMeme.isPending}
                    />
                );

            case 'document_generation':
                return (
                    <DocumentGenerationStep
                        onPhotoUpload={handlePhotoUpload}
                        onGenerateDocument={handleGenerateDocument}
                        userPhoto={userPhoto}
                        otherPartyPhoto={otherPartyPhoto}
                        isUploading={uploadPhoto.isPending}
                        isGenerating={generateDocument.isPending}
                    />
                );

            case 'completed':
                return (
                    <CompletedStep
                        caseId={caseData.id}
                        hasCase={caseData.has_case || false}
                        documentPath={caseData.document_path}
                        memePath={caseData.meme_path}
                        onGenerateMeme={handleGenerateMeme}
                        isGeneratingMeme={generateMeme.isPending}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <main className={`min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-12 ${className}`}>
            {renderStepContent()}
        </main>
    );
};

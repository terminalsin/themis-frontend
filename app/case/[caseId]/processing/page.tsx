'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCase } from '@/hooks/use-case';
import { LoadingVideoPlayer } from '@/components/loading-video-player';
import { CaseHeader } from '@/components/case-header';
import { CaseLoading } from '@/components/case-loading';
import { CaseError } from '@/components/case-error';

export default function ProcessingPage() {
    const params = useParams();
    const router = useRouter();
    const caseId = params.caseId as string;
    const { data: caseData, isLoading, error } = useCase(caseId);

    // Redirect to resolution page - it handles all loading states
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

    // Determine loading states based on case step
    const isVideoLoading = caseData.step === 'processing';
    const isAnalysisLoading = caseData.step === 'processed' || caseData.step === 'analysis';
    const timeline = caseData.analysis?.timeline || [];

    return (
        <div className="px-6 py-8">
            <div className="w-full max-w-6xl mx-auto space-y-8">
                {/* Title Section */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl serif-display font-light text-stone-900 italic">
                        {isVideoLoading ? 'Processing Your Video' :
                            isAnalysisLoading ? 'Analyzing Video Content' :
                                'Video Analysis Complete'}
                    </h1>
                    <p className="serif-body text-lg text-stone-600 max-w-2xl mx-auto italic">
                        {isVideoLoading ? 'Your video is being uploaded and prepared for AI analysis. This may take a few moments.' :
                            isAnalysisLoading ? 'Our AI is analyzing your video to identify key moments and determine fault.' :
                                'Analysis complete! Review the timeline and results below.'}
                    </p>
                </div>

                {/* Video Player with Loading States */}
                <LoadingVideoPlayer
                    videoSrc={`/api/cases/${caseId}/video`}
                    timeline={timeline}
                    isVideoLoading={isVideoLoading}
                    isAnalysisLoading={isAnalysisLoading}
                />

                {/* Additional Processing Info */}
                {(isVideoLoading || isAnalysisLoading) && (
                    <div className="bg-white paper-texture rounded-lg shadow-lg border border-stone-200 p-8 max-w-2xl mx-auto">
                        <div className="text-center space-y-6">
                            <div className="text-4xl">🤖</div>
                            <div className="space-y-4">
                                <h3 className="serif-display text-xl font-medium text-stone-900">
                                    AI Processing in Progress
                                </h3>
                                <p className="serif-body text-stone-600 leading-relaxed">
                                    {isVideoLoading ?
                                        'Our advanced AI is preparing your video for detailed analysis. This includes optimizing the video quality and extracting key frames.' :
                                        'The AI is now analyzing every frame to identify critical moments, track vehicle movements, and determine fault based on traffic laws and physics.'
                                    }
                                </p>
                            </div>

                            {/* Fun Fact */}
                            <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
                                <div className="serif-body text-stone-700">
                                    <span className="font-semibold">💡 Did you know?</span> Our AI can analyze over 1000 frames per second to identify critical moments in your video.
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

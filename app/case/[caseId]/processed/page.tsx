'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCase } from '@/hooks/use-case';
import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { CaseHeader } from '@/components/case-header';
import { CaseLoading } from '@/components/case-loading';
import { CaseError } from '@/components/case-error';

export default function ProcessedPage() {
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

    const handleContinueToAnalysis = async () => {
        try {
            const response = await fetch(`/api/cases/${caseId}/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                // The API will update the case step, and useCase hook will refetch
                // The useEffect above will redirect to the new step
            } else {
                console.error('Failed to start analysis');
            }
        } catch (error) {
            console.error('Error starting analysis:', error);
        }
    };

    if (isLoading) {
        return <CaseLoading />;
    }

    if (error || !caseData) {
        return <CaseError />;
    }

    const processingStats = caseData.processing_summary as any;
    const collisionCount = (processingStats?.total_collision_events as number) || 0;
    const hasCollisions = collisionCount > 0;

    return (
        <div className="px-6 py-8">
            <div className="w-full max-w-4xl mx-auto">
                <div className="elegant-card">
                    <div className="text-center py-16 px-8 space-y-10">
                        {/* Success Icon */}
                        <div className="flex justify-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                                <div className="text-4xl">✅</div>
                            </div>
                        </div>

                        {/* Title and Description */}
                        <div className="space-y-6">
                            <h2 className="text-3xl serif-display text-stone-900 italic">
                                Video Processing Complete
                            </h2>
                            <p className="serif-body text-lg text-stone-600 max-w-2xl mx-auto italic">
                                Your video has been successfully processed with AI-powered vehicle tracking and collision detection.
                            </p>
                        </div>

                        {/* Processing Results */}
                        {processingStats && (
                            <div className="bg-gray-50 rounded-2xl p-8 max-w-2xl mx-auto">
                                <h3 className="serif-display text-xl text-stone-800 mb-6 italic">Processing Results</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                                    <div className="space-y-2">
                                        <div className="text-2xl font-bold text-gray-900">
                                            {processingStats.total_frames || 'N/A'}
                                        </div>
                                        <div className="serif-body text-sm text-gray-600">Total Frames</div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-2xl font-bold text-gray-900">
                                            {processingStats.processing_time || 'N/A'}
                                        </div>
                                        <div className="serif-body text-sm text-gray-600">Processing Time</div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-2xl font-bold text-gray-900">
                                            {processingStats.unique_vehicles_detected || 0}
                                        </div>
                                        <div className="serif-body text-sm text-gray-600">Vehicles Detected</div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className={`text-2xl font-bold ${hasCollisions ? 'text-red-600' : 'text-green-600'}`}>
                                            {collisionCount}
                                        </div>
                                        <div className="serif-body text-sm text-gray-600">Collision Events</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Collision Alert */}
                        {hasCollisions && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-2xl mx-auto">
                                <div className="serif-body text-red-800">
                                    <span className="font-semibold">⚠️ Collisions Detected!</span>
                                    {` ${collisionCount} collision event${collisionCount > 1 ? 's' : ''} found in your video. Review the processed video for details.`}
                                </div>
                            </div>
                        )}

                        {/* Video Preview */}
                        <div className="bg-white rounded-2xl p-6 max-w-2xl mx-auto">
                            <h3 className="serif-display text-lg text-stone-800 mb-4 italic">Processed Video</h3>
                            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                                <video
                                    controls
                                    className="w-full h-full rounded-lg"
                                    src={`/api/cases/${caseId}/processed-video`}
                                    onLoadStart={() => console.log('Video loading started...')}
                                    onLoadedData={() => console.log('Video data loaded')}
                                    onError={(e) => console.error('Video load error:', e)}
                                    preload="metadata"
                                >
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                            <p className="serif-body text-sm text-gray-600">
                                This video includes AI annotations showing vehicle tracking and collision detection results.
                            </p>
                            <div className="mt-2 text-xs text-gray-500">
                                Video source: <code>/api/cases/{caseId}/processed-video</code>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                onClick={handleContinueToAnalysis}
                                className="px-8 py-3 bg-gray-900 text-white serif-body font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200"
                            >
                                Continue to Legal Analysis
                            </Button>
                            <a
                                href={`/api/cases/${caseId}/processed-video`}
                                download={`processed_video_${caseId}.mp4`}
                                className="px-8 py-3 border border-gray-300 text-gray-700 serif-body font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200 text-center"
                            >
                                Download Processed Video
                            </a>
                        </div>

                        {/* Processing Info */}
                        <div className="bg-gray-100 border border-gray-200 rounded-2xl p-6 max-w-2xl mx-auto">
                            <div className="serif-body text-gray-700">
                                <span className="font-semibold">🔍 What happened?</span> Your video was analyzed using advanced AI to detect vehicles, track their movements, and identify potential collision events. The processed video includes visual annotations to highlight key moments.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

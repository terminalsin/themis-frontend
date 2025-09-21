'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCase, useGenerateDocument, useGenerateMeme } from '@/hooks/use-case';
import { Spinner } from '@heroui/spinner';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { VideoPlayer } from '@/components/video-player';
import { Logo } from '@/components/logo';

export default function ResolutionPage() {
    const params = useParams();
    const router = useRouter();
    const caseId = params.caseId as string;
    const { data: caseData, isLoading, error } = useCase(caseId);


    const generateDocument = useGenerateDocument();
    const generateMeme = useGenerateMeme();

    // Always stay on resolution page - handle all loading states here
    // No redirect needed - this page now handles all case states

    // Determine loading states based on case data
    const hasOriginalVideo = caseData?.video_path;
    const hasProcessedVideo = caseData?.processed_video_path;

    // Show video loader spinner until processed video is ready
    // If we have original video but no processed video, show spinner
    const isVideoLoading = Boolean(hasOriginalVideo && !hasProcessedVideo);
    const isTimelineLoading = !caseData?.analysis?.timeline || caseData.analysis.timeline.length === 0;
    const isAnalysisComplete = caseData?.analysis && !isTimelineLoading;

    // Determine video source - prefer processed video, fallback to original
    const getVideoSrc = () => {
        if (caseData?.processed_video_path) {
            return `/api/cases/${caseId}/processed-video`;
        } else if (caseData?.video_path && !isVideoLoading) {
            // Only show original video if we're not waiting for processed video
            return `/api/cases/${caseId}/video`;
        }
        return '';
    };

    // Determine if we're showing processed video or original
    const isShowingProcessedVideo = caseData?.processed_video_path ? true : false;

    const handleGenerateDocument = async () => {
        try {
            // Start document generation in the background
            generateDocument.mutateAsync(caseId).catch(error => {
                console.error('Document generation failed:', error);
            });

            // Immediately redirect to document generation page
            router.push(`/case/${caseId}/document-generation`);
        } catch (error) {
            console.error('Redirect to document generation failed:', error);
            alert(`Failed to redirect to document generation: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleGenerateMeme = async () => {
        try {
            // Start meme generation in the background
            generateMeme.mutateAsync(caseId).catch(error => {
                console.error('Meme generation failed:', error);
            });

            // Immediately redirect to sobs page
            router.push(`/case/${caseId}/sobs`);
        } catch (error) {
            console.error('Redirect to sobs failed:', error);
            alert(`Failed to redirect to sobs: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const getResolutionColor = (resolution: string) => {
        switch (resolution) {
            case 'other-at-fault': return 'success';
            case 'self-at-fault': return 'danger';
            case 'no-fault': return 'warning';
            default: return 'default';
        }
    };

    const getResolutionIcon = (resolution: string) => {
        switch (resolution) {
            case 'other-at-fault': return '✅';
            case 'self-at-fault': return '❌';
            case 'no-fault': return '⚖️';
            default: return '❓';
        }
    };

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

    const hasCase = caseData.has_case || false;

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-12">
            <div className="w-full max-w-6xl ">
                {/* Logo */}
                <div className="flex justify-center pb-8 translate-y-[-40px]   ">
                    <Logo className="w-128 h-32" />
                </div>
                {/* Video Player with Timeline */}
                <VideoPlayer
                    videoSrc={getVideoSrc()}
                    timeline={caseData?.analysis?.timeline || []}
                    isVideoLoading={isVideoLoading}
                    isTimelineLoading={isTimelineLoading}
                />

                {/* Analysis Results */}
                <Card className="bg-white paper-texture shadow-lg border border-stone-200 mt-8">
                    <CardHeader className="p-8 border-b border-stone-200">
                        <div className="flex items-center justify-between w-full">
                            <h2 className="serif-display text-3xl font-medium text-stone-900">
                                {isAnalysisComplete ? 'Analysis Complete' : 'AI Analysis in Progress'}
                            </h2>
                            {isAnalysisComplete ? (
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl">{getResolutionIcon(caseData.analysis!.resolution)}</span>
                                    <div className={`px-4 py-2 rounded-lg serif-body font-medium ${getResolutionColor(caseData.analysis!.resolution) === 'success' ? 'bg-stone-100 text-stone-800' :
                                        getResolutionColor(caseData.analysis!.resolution) === 'danger' ? 'bg-stone-100 text-stone-800' :
                                            'bg-stone-100 text-stone-800'
                                        }`}>
                                        {caseData.analysis!.resolution.replace('-', ' ').toUpperCase()}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-stone-200 rounded-full flex items-center justify-center animate-pulse">
                                        <span className="text-lg">🧠</span>
                                    </div>
                                    <div className="px-4 py-2 rounded-lg serif-body font-medium bg-stone-100 text-stone-600">
                                        ANALYZING...
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardHeader>

                    <CardBody className="p-8 space-y-10">
                        {isAnalysisComplete ? (
                            <>
                                {/* Resolution Details */}
                                <div className="bg-stone-50 p-6 rounded-lg border border-stone-200 pt-8">
                                    <h3 className="serif-display text-xl font-medium mb-4 text-stone-900">
                                        What Happened:
                                    </h3>
                                    <p className="serif-body text-stone-700 leading-relaxed text-lg">
                                        {caseData.analysis!.resolution_details}
                                    </p>
                                </div>

                                {/* Party Analysis */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {caseData.analysis!.parties.map((party, index) => (
                                        <div
                                            key={index}
                                            className={`p-6 rounded-lg border-2 ${party.at_fault
                                                ? 'border-red-200 bg-red-50'
                                                : 'border-green-200 bg-green-50'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-lg font-semibold capitalize text-gray-900">
                                                    {party.party === 'self' ? 'You' : 'Other Party'}
                                                </h4>
                                                <Chip
                                                    color={party.at_fault ? 'danger' : 'success'}
                                                    variant="flat"
                                                    size="sm"
                                                    className="text-black"
                                                >
                                                    {party.at_fault ? 'At Fault' : 'Not At Fault'}
                                                </Chip>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {party.party === 'self'
                                                    ? (party.at_fault
                                                        ? 'You were determined to be responsible for this incident.'
                                                        : 'You were not at fault in this incident.')
                                                    : (party.at_fault
                                                        ? 'The other party was responsible for this incident.'
                                                        : 'The other party was not at fault in this incident.')
                                                }
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Case Assessment */}
                                <div className={`p-8 rounded-xl border-2 ${hasCase
                                    ? 'border-green-300 bg-gradient-to-r from-green-50 to-emerald-50'
                                    : 'border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50'
                                    }`}>
                                    <div className="text-center space-y-6">
                                        <div className="text-6xl mb-4">
                                            {hasCase ? '🎉' : '😔'}
                                        </div>

                                        <div>
                                            <h3 className="text-2xl font-bold mb-2 text-gray-900">
                                                {hasCase ? 'You Have a Case!' : 'No Legal Case'}
                                            </h3>
                                            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                                                {hasCase
                                                    ? 'Based on our analysis, you have strong grounds for a legal case. The evidence shows the other party was at fault.'
                                                    : 'Unfortunately, the analysis shows you do not have grounds for a legal case. The evidence indicates you were at fault or it was a no-fault situation.'
                                                }
                                            </p>
                                        </div>

                                        {/* Action Button */}
                                        <div className="pt-4">
                                            {hasCase ? (
                                                <Button
                                                    type="button"
                                                    size="lg"
                                                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-12 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                                                    onClick={handleGenerateDocument}
                                                    isLoading={generateDocument.isPending}
                                                >
                                                    {generateDocument.isPending ? 'Preparing...' : 'Generate My Case 📄'}
                                                </Button>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    size="lg"
                                                    className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold px-12 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                                                    onClick={handleGenerateMeme}
                                                    isLoading={generateMeme.isPending}
                                                >
                                                    {generateMeme.isPending ? 'Creating...' : 'Generate Sobs 😭'}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Loading State for Analysis */
                            <div className="space-y-8">
                                {/* Loading message */}
                                <div className="text-center space-y-6">
                                    <div className="relative">
                                        <div className="w-20 h-20 bg-stone-200 rounded-full flex items-center justify-center animate-pulse mx-auto">
                                            <span className="text-3xl">🧠</span>
                                        </div>
                                        <div className="absolute inset-0 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin"></div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="serif-display text-2xl font-medium text-stone-900">
                                            AI Analysis in Progress
                                        </h3>
                                        <p className="serif-body text-stone-600 max-w-2xl mx-auto leading-relaxed">
                                            Our advanced AI is analyzing your video to determine fault, identify key moments, and assess your legal case. This comprehensive analysis considers traffic laws, vehicle dynamics, and collision physics.
                                        </p>
                                    </div>
                                </div>

                                {/* Loading skeleton for analysis sections */}
                                <div className="space-y-6">
                                    {/* Resolution details skeleton */}
                                    <div className="bg-stone-50 p-6 rounded-lg border border-stone-200 animate-pulse">
                                        <div className="h-6 bg-stone-200 rounded w-48 mb-4"></div>
                                        <div className="space-y-2">
                                            <div className="h-4 bg-stone-200 rounded w-full"></div>
                                            <div className="h-4 bg-stone-200 rounded w-5/6"></div>
                                            <div className="h-4 bg-stone-200 rounded w-4/6"></div>
                                        </div>
                                    </div>

                                    {/* Party analysis skeleton */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {[1, 2].map((i) => (
                                            <div key={i} className="bg-stone-50 p-6 rounded-lg border border-stone-200 animate-pulse">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="h-5 bg-stone-200 rounded w-20"></div>
                                                    <div className="h-6 bg-stone-200 rounded w-16"></div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="h-3 bg-stone-200 rounded w-full"></div>
                                                    <div className="h-3 bg-stone-200 rounded w-3/4"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Case assessment skeleton */}
                                    <div className="bg-stone-50 p-8 rounded-xl border border-stone-200 animate-pulse">
                                        <div className="text-center space-y-6">
                                            <div className="w-16 h-16 bg-stone-200 rounded-full mx-auto"></div>
                                            <div className="space-y-3">
                                                <div className="h-8 bg-stone-200 rounded w-64 mx-auto"></div>
                                                <div className="h-4 bg-stone-200 rounded w-96 mx-auto"></div>
                                                <div className="h-4 bg-stone-200 rounded w-80 mx-auto"></div>
                                            </div>
                                            <div className="h-12 bg-stone-200 rounded w-48 mx-auto"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>
        </main>
    );
}

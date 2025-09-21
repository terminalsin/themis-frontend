'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCase, useGenerateDocument, useGenerateMeme } from '@/hooks/use-case';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { VideoPlayer } from '@/components/video-player';
import { CaseHeader } from '@/components/case-header';
import { CaseLoading } from '@/components/case-loading';
import { CaseError } from '@/components/case-error';

export default function ResolutionPage() {
    const params = useParams();
    const router = useRouter();
    const caseId = params.caseId as string;
    const { data: caseData, isLoading, error } = useCase(caseId);

    // Demo spinner states for artificial delays
    const [demoVideoLoading, setDemoVideoLoading] = useState(false);
    const [demoTimelineLoading, setDemoTimelineLoading] = useState(false);
    const [demoAnalysisLoading, setDemoAnalysisLoading] = useState(false);

    const generateDocument = useGenerateDocument();
    const generateMeme = useGenerateMeme();

    // Handle demo video loading delay
    useEffect(() => {
        if (caseData?.demo_video_delay && caseData.demo_video_delay > 0) {
            setDemoVideoLoading(true);
            const timer = setTimeout(() => {
                setDemoVideoLoading(false);
            }, caseData.demo_video_delay * 1000);

            return () => clearTimeout(timer);
        }
    }, [caseData?.demo_video_delay]);

    // Handle demo timeline loading delay
    useEffect(() => {
        if (caseData?.demo_timeline_delay && caseData.demo_timeline_delay > 0) {
            setDemoTimelineLoading(true);
            const timer = setTimeout(() => {
                setDemoTimelineLoading(false);
            }, caseData.demo_timeline_delay * 1000);

            return () => clearTimeout(timer);
        }
    }, [caseData?.demo_timeline_delay]);

    // Handle demo analysis loading delay
    useEffect(() => {
        if (caseData?.demo_analysis_delay && caseData.demo_analysis_delay > 0) {
            setDemoAnalysisLoading(true);
            const timer = setTimeout(() => {
                setDemoAnalysisLoading(false);
            }, caseData.demo_analysis_delay * 1000);

            return () => clearTimeout(timer);
        }
    }, [caseData?.demo_analysis_delay]);

    // Legacy support for old demo_spinner_delay (applies to analysis)
    useEffect(() => {
        if (caseData?.demo_spinner_delay && caseData.demo_spinner_delay > 0 && !caseData.demo_analysis_delay) {
            setDemoAnalysisLoading(true);
            const timer = setTimeout(() => {
                setDemoAnalysisLoading(false);
            }, caseData.demo_spinner_delay * 1000);

            return () => clearTimeout(timer);
        }
    }, [caseData?.demo_spinner_delay, caseData?.demo_analysis_delay]);

    // Always stay on resolution page - handle all loading states here
    // No redirect needed - this page now handles all case states

    // Determine loading states based on case data
    const hasOriginalVideo = caseData?.video_path;
    const hasProcessedVideo = caseData?.processed_video_path;

    // Show video loader spinner until processed video is ready or during demo delay
    const isVideoLoading = Boolean(hasOriginalVideo && !hasProcessedVideo) || demoVideoLoading;

    // Show timeline loading until timeline is ready or during demo delay
    const isTimelineLoading = (!caseData?.analysis?.timeline || caseData.analysis.timeline.length === 0) || demoTimelineLoading;

    // Analysis is complete when we have analysis data and no demo delays are active
    const isAnalysisComplete = caseData?.analysis && !isTimelineLoading && !demoAnalysisLoading;

    // Determine video source - prefer processed video, fallback to original
    const getVideoSrc = () => {
        // During demo video loading, don't provide a source (show loading spinner)
        if (demoVideoLoading) {
            return '';
        }

        // Prefer processed video if available
        if (caseData?.processed_video_path) {
            return `/api/cases/${caseId}/processed-video`;
        }

        // Fallback to original video
        if (caseData?.video_path) {
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
        return <CaseLoading />;
    }

    if (error || !caseData) {
        return <CaseError />;
    }

    const hasCase = caseData.has_case || false;

    return (
        <div className="px-6 py-8 relative">
            <div className="w-full max-w-6xl mx-auto">
                {/* Video Player with Timeline */}
                <VideoPlayer
                    videoSrc={getVideoSrc()}
                    timeline={caseData?.analysis?.timeline || []}
                    isVideoLoading={isVideoLoading}
                    isTimelineLoading={isTimelineLoading}
                />

                {/* Analysis Results */}
                <Card className="bg-gradient-to-br from-slate-50 to-gray-100 shadow-2xl border-2 border-slate-300 mt-8 backdrop-blur-sm">
                    <CardHeader className="p-8 border-b-2 border-slate-300 bg-gradient-to-r from-slate-100 to-gray-200">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center shadow-lg">
                                    <span className="text-white text-xl font-bold">⚖️</span>
                                </div>
                                <div>
                                    <h2 className="serif-display text-3xl font-bold text-slate-900 tracking-tight">
                                        {isAnalysisComplete ? 'Legal Analysis Report' : 'Legal Analysis in Progress'}
                                    </h2>
                                    <p className="text-slate-600 font-medium mt-1">
                                        {isAnalysisComplete ? 'Comprehensive Case Assessment' : 'AI-Powered Legal Review'}
                                    </p>
                                </div>
                            </div>
                            {isAnalysisComplete ? (
                                <div className="flex items-center space-x-4">
                                    <div className="text-center">
                                        <div className="text-3xl mb-1">{getResolutionIcon(caseData.analysis!.resolution)}</div>
                                        <div className={`px-6 py-3 rounded-lg serif-body font-bold text-sm tracking-wider shadow-lg border-2 ${getResolutionColor(caseData.analysis!.resolution) === 'success'
                                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                            getResolutionColor(caseData.analysis!.resolution) === 'danger'
                                                ? 'bg-red-50 text-red-800 border-red-200' :
                                                'bg-amber-50 text-amber-800 border-amber-200'
                                            }`}>
                                            {caseData.analysis!.resolution.replace('-', ' ').toUpperCase()}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center animate-pulse shadow-lg">
                                        <span className="text-white text-lg">⚖️</span>
                                    </div>
                                    <div className="px-6 py-3 rounded-lg serif-body font-bold bg-slate-200 text-slate-700 tracking-wider shadow-lg">
                                        ANALYZING EVIDENCE...
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardHeader>

                    <CardBody className="p-8 space-y-10">
                        {isAnalysisComplete ? (
                            <>
                                {/* Resolution Details */}
                                <div className="bg-gradient-to-r from-slate-100 to-gray-100 p-8 rounded-xl border-2 border-slate-300 shadow-lg">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center shadow-md flex-shrink-0 mt-1">
                                            <span className="text-white text-lg font-bold">📋</span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="serif-display text-2xl font-bold mb-6 text-slate-900 tracking-tight">
                                                Incident Analysis & Findings
                                            </h3>
                                            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-inner">
                                                <p className="serif-body text-slate-800 leading-relaxed text-lg font-medium">
                                                    {caseData.analysis!.resolution_details}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Party Analysis */}
                                <div className="bg-gradient-to-r from-slate-100 to-gray-100 p-8 rounded-xl border-2 border-slate-300 shadow-lg">
                                    <div className="flex items-center space-x-4 mb-8">
                                        <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center shadow-md">
                                            <span className="text-white text-lg font-bold">👥</span>
                                        </div>
                                        <h3 className="serif-display text-2xl font-bold text-slate-900 tracking-tight">
                                            Liability Assessment
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {caseData.analysis!.parties.map((party, index) => (
                                            <div
                                                key={index}
                                                className={`relative p-8 rounded-xl border-2 shadow-lg bg-gradient-to-br ${party.at_fault
                                                    ? 'from-slate-50 to-gray-50 border-red-300'
                                                    : 'from-slate-50 to-gray-50 border-emerald-300'
                                                    }`}
                                            >
                                                {/* Status indicator */}
                                                <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${party.at_fault ? 'bg-red-500' : 'bg-emerald-500'
                                                    }`}>
                                                    <span className="text-white text-lg font-bold">
                                                        {party.at_fault ? '✗' : '✓'}
                                                    </span>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-xl font-bold text-slate-900 tracking-tight">
                                                            {party.party === 'self' ? 'Plaintiff (You)' : 'Defendant (Other Party)'}
                                                        </h4>
                                                    </div>

                                                    <div className={`px-4 py-3 rounded-lg font-bold text-sm tracking-wider text-center shadow-inner ${party.at_fault
                                                        ? 'bg-red-100 text-red-800 border border-red-200'
                                                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                        }`}>
                                                        {party.at_fault ? 'LIABLE FOR DAMAGES' : 'NOT LIABLE'}
                                                    </div>

                                                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-inner">
                                                        <p className="text-slate-700 font-medium leading-relaxed">
                                                            {party.party === 'self'
                                                                ? (party.at_fault
                                                                    ? 'Legal analysis indicates you bear responsibility for the incident based on traffic laws and evidence presented.'
                                                                    : 'Evidence supports that you acted within legal bounds and are not liable for damages in this incident.')
                                                                : (party.at_fault
                                                                    ? 'The opposing party has been determined liable based on violation of traffic laws and duty of care.'
                                                                    : 'The opposing party\'s actions were within legal parameters and do not constitute negligence.')
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Case Assessment */}
                                <div className={`relative p-10 rounded-xl border-3 shadow-2xl bg-gradient-to-br ${hasCase
                                    ? 'from-slate-100 via-gray-50 to-slate-100 border-emerald-400'
                                    : 'from-slate-100 via-gray-50 to-slate-100 border-red-400'
                                    }`}>
                                    {/* Legal seal/badge */}
                                    <div className={`absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full flex items-center justify-center shadow-xl border-4 ${hasCase
                                        ? 'bg-emerald-600 border-emerald-400'
                                        : 'bg-red-600 border-red-400'
                                        }`}>
                                        <span className="text-white text-2xl font-bold">⚖️</span>
                                    </div>

                                    <div className="text-center space-y-8 pt-6">
                                        <div className="space-y-4">
                                            <h3 className="serif-display text-3xl font-bold text-slate-900 tracking-tight">
                                                {hasCase ? 'VIABLE LEGAL CLAIM IDENTIFIED' : 'INSUFFICIENT GROUNDS FOR CLAIM'}
                                            </h3>
                                            <div className={`inline-block px-6 py-3 rounded-lg font-bold text-sm tracking-widest shadow-lg border-2 ${hasCase
                                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                                : 'bg-red-100 text-red-800 border-red-300'
                                                }`}>
                                                {hasCase ? 'PROCEED WITH LEGAL ACTION' : 'CASE DISMISSED'}
                                            </div>
                                        </div>

                                        <div className="bg-white p-0 rounded-lg border-2 border-slate-200 shadow-inner max-w-4xl mx-auto">
                                            {hasCase ? (
                                                <div className="">
                                                    <div className="relative bg-black rounded-lg overflow-hidden shadow-lg">
                                                        <video
                                                            autoPlay
                                                            loop
                                                            muted
                                                            playsInline
                                                            className="w-full h-auto max-h-128 object-cover"
                                                        >
                                                            <source src="/accepted.mp4" type="video/mp4" />
                                                            Your browser does not support the video tag.
                                                        </video>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="">
                                                    <div className="relative bg-black rounded-lg overflow-hidden shadow-lg">
                                                        <video
                                                            autoPlay
                                                            loop
                                                            muted
                                                            playsInline
                                                            className="w-full h-auto max-h-128 object-cover"
                                                        >
                                                            <source src="/denied.mp4" type="video/mp4" />
                                                            Your browser does not support the video tag.
                                                        </video>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Button - Only show for successful cases */}
                                        {hasCase && (
                                            <div className="pt-6">
                                                <Button
                                                    type="button"
                                                    size="lg"
                                                    className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white font-bold px-16 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-emerald-400 tracking-wider"
                                                    onClick={handleGenerateDocument}
                                                    isLoading={generateDocument.isPending}
                                                >
                                                    {generateDocument.isPending ? 'PREPARING DOCUMENTATION...' : 'GENERATE LEGAL DOCUMENTS ⚖️'}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Loading State for Analysis */
                            <div className="space-y-8">
                                {/* Loading message */}
                                <div className="text-center space-y-8 p-8">
                                    <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                                        <div className="absolute inset-0 bg-slate-700 rounded-full animate-pulse"></div>
                                        <svg className="w-16 h-16 animate-spin text-white relative z-10" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="serif-display text-3xl font-bold text-slate-900 tracking-tight">
                                            Legal Analysis in Progress
                                        </h3>
                                        <div className="bg-white p-6 rounded-lg border-2 border-slate-200 shadow-inner max-w-3xl mx-auto">
                                            <p className="serif-body text-slate-700 leading-relaxed font-medium text-lg">
                                                Our AI legal expert is conducting a comprehensive analysis of your incident, examining evidence against established traffic laws, precedent cases, and liability standards. This thorough review includes assessment of duty of care, breach of conduct, and damages evaluation.
                                            </p>
                                        </div>
                                        <div className="flex justify-center space-x-4">
                                            <div className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold text-sm tracking-wider">
                                                EVIDENCE REVIEW
                                            </div>
                                            <div className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold text-sm tracking-wider">
                                                LIABILITY ASSESSMENT
                                            </div>
                                            <div className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold text-sm tracking-wider">
                                                LEGAL PRECEDENT ANALYSIS
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Loading skeleton for analysis sections */}
                                <div className="space-y-8">
                                    {/* Resolution details skeleton */}
                                    <div className="bg-gradient-to-r from-slate-100 to-gray-100 p-8 rounded-xl border-2 border-slate-300 shadow-lg animate-pulse">
                                        <div className="flex items-start space-x-4">
                                            <div className="w-10 h-10 bg-slate-300 rounded-lg flex-shrink-0"></div>
                                            <div className="flex-1">
                                                <div className="h-8 bg-slate-300 rounded w-64 mb-6"></div>
                                                <div className="bg-white p-6 rounded-lg border border-slate-200">
                                                    <div className="space-y-3">
                                                        <div className="h-4 bg-slate-200 rounded w-full"></div>
                                                        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                                                        <div className="h-4 bg-slate-200 rounded w-4/6"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Party analysis skeleton */}
                                    <div className="bg-gradient-to-r from-slate-100 to-gray-100 p-8 rounded-xl border-2 border-slate-300 shadow-lg animate-pulse">
                                        <div className="flex items-center space-x-4 mb-8">
                                            <div className="w-10 h-10 bg-slate-300 rounded-lg"></div>
                                            <div className="h-8 bg-slate-300 rounded w-48"></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {[1, 2].map((i) => (
                                                <div key={i} className="bg-gradient-to-br from-slate-50 to-gray-50 p-8 rounded-xl border-2 border-slate-200 shadow-lg">
                                                    <div className="space-y-4">
                                                        <div className="h-6 bg-slate-300 rounded w-32"></div>
                                                        <div className="h-8 bg-slate-200 rounded w-full"></div>
                                                        <div className="bg-white p-4 rounded-lg border border-slate-200">
                                                            <div className="space-y-2">
                                                                <div className="h-3 bg-slate-200 rounded w-full"></div>
                                                                <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Case assessment skeleton */}
                                    <div className="relative p-10 rounded-xl border-3 border-slate-300 shadow-2xl bg-gradient-to-br from-slate-100 via-gray-50 to-slate-100 animate-pulse">
                                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-slate-400 rounded-full"></div>
                                        <div className="text-center space-y-8 pt-6">
                                            <div className="space-y-4">
                                                <div className="h-10 bg-slate-300 rounded w-96 mx-auto"></div>
                                                <div className="h-8 bg-slate-200 rounded w-64 mx-auto"></div>
                                            </div>
                                            <div className="bg-white p-8 rounded-lg border-2 border-slate-200 shadow-inner max-w-4xl mx-auto">
                                                <div className="h-6 bg-slate-300 rounded w-80 mx-auto mb-4"></div>
                                                <div className="space-y-3">
                                                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                                                    <div className="h-4 bg-slate-200 rounded w-5/6 mx-auto"></div>
                                                    <div className="h-4 bg-slate-200 rounded w-4/6 mx-auto"></div>
                                                </div>
                                            </div>
                                            <div className="h-16 bg-slate-300 rounded w-80 mx-auto"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Floating Consolation Cloud - Only show when analysis is complete and no case */}
                {isAnalysisComplete && !hasCase && (
                    <div className="fixed bottom-8 right-8 z-50">
                        {/* Cloud shape container */}
                        <div className="relative group">
                            {/* Cloud background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-gray-100 to-slate-300 rounded-full transform scale-110 opacity-80 group-hover:opacity-100 transition-all duration-300 shadow-2xl"></div>
                            <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-slate-200 to-gray-200 rounded-full opacity-70"></div>
                            <div className="absolute -top-1 -right-3 w-6 h-6 bg-gradient-to-br from-slate-200 to-gray-200 rounded-full opacity-60"></div>
                            <div className="absolute -bottom-1 -left-3 w-7 h-7 bg-gradient-to-br from-slate-200 to-gray-200 rounded-full opacity-65"></div>
                            <div className="absolute -bottom-2 -right-1 w-5 h-5 bg-gradient-to-br from-slate-200 to-gray-200 rounded-full opacity-50"></div>

                            {/* Main cloud body */}
                            <div className="relative bg-gradient-to-br from-white via-slate-50 to-gray-100 rounded-2xl p-6 shadow-2xl border-2 border-slate-200 transform hover:scale-105 transition-all duration-300 animate-bounce-slow">
                                {/* Sad face */}
                                <div className="text-center mb-4">
                                    <div className="text-4xl mb-2 animate-pulse">☁️</div>
                                    <div className="text-2xl">😔</div>
                                </div>

                                {/* Consolation text */}
                                <div className="text-center mb-4">
                                    <p className="text-slate-700 font-medium text-sm leading-tight">
                                        Need some<br />
                                        <span className="font-bold">comfort?</span>
                                    </p>
                                </div>

                                {/* Button */}
                                <Button
                                    type="button"
                                    size="sm"
                                    className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-bold px-4 py-2 text-xs shadow-lg hover:shadow-xl transition-all duration-300 w-full"
                                    onClick={handleGenerateMeme}
                                    isLoading={generateMeme.isPending}
                                >
                                    {generateMeme.isPending ? 'Creating...' : 'Get Sobs 😭'}
                                </Button>
                            </div>

                            {/* Floating animation keyframes */}
                            <style jsx>{`
                                @keyframes bounce-slow {
                                    0%, 100% { transform: translateY(0px) rotate(-1deg); }
                                    50% { transform: translateY(-10px) rotate(1deg); }
                                }
                                .animate-bounce-slow {
                                    animation: bounce-slow 3s ease-in-out infinite;
                                }
                            `}</style>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCase, useGenerateMeme } from '@/hooks/use-case';
import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Skeleton } from '@heroui/skeleton';
import { Progress } from '@heroui/progress';
import { CaseHeader } from '@/components/case-header';
import { CaseLoading } from '@/components/case-loading';
import { CaseError } from '@/components/case-error';
import confetti from 'canvas-confetti';

export default function CompletedPage() {
    const params = useParams();
    const router = useRouter();
    const caseId = params.caseId as string;
    const { data: caseData, isLoading, error } = useCase(caseId);
    const [documents, setDocuments] = useState<any[]>([]);

    // Demo skeleton loading states
    const isDemo = caseId === 'demo1' || caseId === 'demo2';
    const [showSkeleton, setShowSkeleton] = useState(isDemo);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingStage, setLoadingStage] = useState('Analyzing case data...');
    const [loadedComponents, setLoadedComponents] = useState({
        caseInfo: false,
        documents: false,
        celebration: false
    });

    const loadingStages = [
        'Initializing analysis...',
        'Processing video evidence...',
        'Analyzing incident details...',
        'Generating case summary...',
        'Preparing documents...',
        'Finalizing report...',
        'Complete!'
    ];

    const generateMeme = useGenerateMeme();

    // Confetti animation
    const triggerConfetti = () => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min;
        }

        const interval: NodeJS.Timeout = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            // Left side
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });

            // Right side
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);
    };

    const handleGenerateMeme = async () => {
        try {
            // Start meme generation in the background
            generateMeme.mutateAsync(caseId).catch(error => {
                console.error('Meme generation failed:', error);
            });

            // Immediately redirect to sobs page
            router.push(`/case/${caseId}/victory`);
        } catch (error) {
            console.error('Redirect to sobs failed:', error);
            alert(`Failed to redirect to sobs: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };


    const fetchDocuments = async () => {
        try {
            const response = await fetch(`/api/cases/${caseId}/documents`);
            if (response.ok) {
                const data = await response.json();
                setDocuments(data.documents || []);
            }
        } catch (error) {
            console.error('Failed to fetch documents:', error);
        }
    };

    // Skeleton loading effect for demo cases
    useEffect(() => {
        if (isDemo && showSkeleton) {
            let currentStage = 0;
            let currentProgress = 0;

            // Progress animation
            const progressInterval = setInterval(() => {
                currentProgress += Math.random() * 15 + 5; // Random progress increments
                if (currentProgress > 100) currentProgress = 100;
                setLoadingProgress(currentProgress);

                // Update loading stage
                const stageIndex = Math.floor((currentProgress / 100) * (loadingStages.length - 1));
                if (stageIndex !== currentStage && stageIndex < loadingStages.length) {
                    currentStage = stageIndex;
                    setLoadingStage(loadingStages[stageIndex]);
                }

                if (currentProgress >= 100) {
                    clearInterval(progressInterval);
                    setLoadingStage('Complete!');
                }
            }, 300);

            // Load components one by one with delays
            const timer1 = setTimeout(() => {
                setLoadedComponents(prev => ({ ...prev, caseInfo: true }));
            }, 2000);

            const timer2 = setTimeout(() => {
                setLoadedComponents(prev => ({ ...prev, documents: true }));
            }, 4000);

            const timer3 = setTimeout(() => {
                setLoadedComponents(prev => ({ ...prev, celebration: true }));
                setShowSkeleton(false);
                // Trigger confetti when loading completes
                setTimeout(() => {
                    triggerConfetti();
                }, 500);
            }, 6000);

            return () => {
                clearInterval(progressInterval);
                clearTimeout(timer1);
                clearTimeout(timer2);
                clearTimeout(timer3);
            };
        }
    }, [isDemo, showSkeleton]);

    React.useEffect(() => {
        if (caseData) {
            fetchDocuments();
        }
    }, [caseData]);

    if (isLoading) {
        return <CaseLoading />;
    }

    if (error || !caseData) {
        return <CaseError />;
    }

    const hasCase = caseData.has_case || false;

    return (
        <div className="px-6 py-8">
            {/* Loading Overlay for Demo */}
            {isDemo && showSkeleton && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl border border-stone-200 max-w-md w-full mx-4">
                        <div className="text-center space-y-6">
                            <div className="text-4xl mb-4">⚖️</div>
                            <h2 className="serif-display text-2xl font-medium text-stone-900">
                                Processing Your Case
                            </h2>
                            <div className="space-y-3">
                                <Progress
                                    value={loadingProgress}
                                    className="w-full"
                                    color="success"
                                    size="lg"
                                />
                                <p className="serif-body text-stone-600 text-sm">
                                    {loadingStage}
                                </p>
                                <p className="serif-body text-stone-500 text-xs">
                                    {Math.round(loadingProgress)}% Complete
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full max-w-6xl mx-auto">

                {/* Case Information Card */}
                {isDemo && showSkeleton && !loadedComponents.caseInfo ? (
                    <Card className="bg-white paper-texture shadow-lg border border-stone-200 mb-8 animate-pulse">
                        <CardHeader className="p-8 border-b border-stone-200">
                            <div className="flex items-center justify-between w-full">
                                <div className="space-y-2">
                                    <Skeleton className="h-8 w-64 rounded-lg" />
                                    <Skeleton className="h-4 w-32 rounded-lg" />
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <Skeleton className="h-10 w-32 rounded-lg" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardBody className="p-8 space-y-8">
                            <div className="bg-stone-50 p-6 rounded-lg border border-stone-200">
                                <Skeleton className="h-6 w-48 mb-4 rounded-lg" />
                                <div className="space-y-3">
                                    <Skeleton className="h-4 w-full rounded-lg" />
                                    <Skeleton className="h-4 w-5/6 rounded-lg" />
                                    <Skeleton className="h-4 w-4/5 rounded-lg" />
                                    <Skeleton className="h-4 w-3/4 rounded-lg" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                ) : (
                    <Card className="bg-white paper-texture shadow-lg border border-stone-200 mb-8">
                        <CardHeader className="p-8 border-b border-stone-200">
                            <div className="flex items-center justify-between w-full">
                                <h2 className="serif-display text-3xl font-medium text-stone-900">
                                    {hasCase ? 'Your Legal Case' : 'Case Review'}
                                </h2>
                                <div className="flex items-center space-x-3">
                                    <Button
                                        size="lg"
                                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold serif-body flex items-center justify-center"
                                        onClick={handleGenerateMeme}
                                        isLoading={generateMeme.isPending}
                                    >
                                        {generateMeme.isPending ? 'Creating...' : 'Celebrate 🎉'}
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>

                        <CardBody className="p-8 space-y-8">
                            {/* Resolution Details */}
                            {caseData.analysis?.resolution_details && (
                                <div className="bg-stone-50 p-6 rounded-lg border border-stone-200">
                                    <h3 className="serif-display text-xl font-medium mb-4 text-stone-900">
                                        Incident Summary:
                                    </h3>
                                    <p className="serif-body text-stone-700 leading-relaxed text-lg">
                                        {caseData.analysis.resolution_details}
                                    </p>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                )}

                {/* Legal Documents Section */}
                {isDemo && showSkeleton && !loadedComponents.documents ? (
                    <Card className="bg-white paper-texture shadow-lg border border-stone-200 mb-8 animate-pulse">
                        <CardHeader className="p-8 border-b border-stone-200">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-6 w-6 rounded-full" />
                                <Skeleton className="h-6 w-48 rounded-lg" />
                            </div>
                        </CardHeader>
                        <CardBody className="p-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {[1, 2, 3, 4].map((index) => (
                                    <div key={index} className="animate-pulse">
                                        {/* Paper Document Skeleton */}
                                        <div className="relative bg-white border border-stone-200 shadow-[0_4px_12px_rgba(0,0,0,0.15)] rounded-none aspect-[3/4]">
                                            {/* Paper Texture Background */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-white via-stone-50/30 to-stone-100/20"></div>

                                            {/* Paper Fold Effect */}
                                            <div className="absolute top-0 right-0 w-8 h-8 bg-stone-200 border-l border-b border-stone-300 transform rotate-45 translate-x-4 -translate-y-4 shadow-sm"></div>
                                            <div className="absolute top-0 right-0 w-6 h-6 bg-stone-100 border-l border-b border-stone-250 transform rotate-45 translate-x-3 -translate-y-3"></div>

                                            {/* Paper Holes */}
                                            <div className="absolute left-2 top-8 w-1.5 h-1.5 bg-stone-100 rounded-full border border-stone-200"></div>
                                            <div className="absolute left-2 top-16 w-1.5 h-1.5 bg-stone-100 rounded-full border border-stone-200"></div>
                                            <div className="absolute left-2 top-24 w-1.5 h-1.5 bg-stone-100 rounded-full border border-stone-200"></div>

                                            {/* Document Header Skeleton */}
                                            <div className="relative p-4 border-b border-stone-200/50">
                                                <div className="text-center mb-3">
                                                    <Skeleton className="h-4 w-3/4 mx-auto mb-2 rounded" />
                                                    <div className="flex justify-center gap-2 mb-2">
                                                        <Skeleton className="h-3 w-16 rounded" />
                                                        <Skeleton className="h-3 w-20 rounded" />
                                                    </div>
                                                    <div className="flex justify-center gap-1">
                                                        <Skeleton className="h-4 w-8 rounded" />
                                                        <Skeleton className="h-4 w-12 rounded" />
                                                        <Skeleton className="h-4 w-10 rounded" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Document Content Skeleton */}
                                            <div className="relative p-4 bg-white flex-1 overflow-hidden">
                                                {/* Lined Paper Background */}
                                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-transparent"
                                                    style={{
                                                        backgroundImage: `repeating-linear-gradient(
                                                             transparent,
                                                             transparent 18px,
                                                             #e5e7eb 18px,
                                                             #e5e7eb 19px
                                                         )`
                                                    }}>
                                                </div>

                                                {/* Red Margin Line */}
                                                <div className="absolute left-8 top-0 bottom-0 w-px bg-red-300"></div>

                                                <div className="relative z-10 pl-6 space-y-4">
                                                    <Skeleton className="h-0.5 w-full rounded" />
                                                    <Skeleton className="h-0.5 w-5/6 rounded" />
                                                    <Skeleton className="h-0.5 w-4/5 rounded" />
                                                    <Skeleton className="h-0.5 w-full rounded" />
                                                    <Skeleton className="h-0.5 w-3/4 rounded" />
                                                    <Skeleton className="h-0.5 w-5/6 rounded" />
                                                    <Skeleton className="h-0.5 w-2/3 rounded" />
                                                </div>
                                            </div>

                                            {/* Document Footer Skeleton */}
                                            <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-white/90 backdrop-blur-sm border-t border-stone-100">
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <div className="space-y-0.5">
                                                            <Skeleton className="h-3 w-20 rounded" />
                                                            <Skeleton className="h-3 w-24 rounded" />
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Skeleton className="w-3 h-3 rounded" />
                                                            <Skeleton className="h-3 w-16 rounded" />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex gap-2">
                                                            <Skeleton className="h-2 w-16 rounded" />
                                                            <Skeleton className="h-2 w-20 rounded" />
                                                        </div>
                                                        <Skeleton className="h-2 w-12 rounded" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                ) : (
                    <Card className="bg-white paper-texture shadow-lg border border-stone-200 mb-8">
                        <CardHeader className="p-8 border-b border-stone-200">
                            <div className="flex items-center justify-between">
                                <h2 className="serif-display text-2xl font-medium text-stone-900">
                                    Generated Documents
                                </h2>
                                {documents.length > 0 && (
                                    <Button
                                        className="bg-stone-900 text-white serif-body hover:bg-stone-800 transition-colors duration-200 flex items-center justify-center gap-2"
                                        onClick={() => {
                                            documents.forEach(doc => {
                                                const link = document.createElement('a');
                                                link.href = doc.path;
                                                link.download = doc.name;
                                                link.target = '_blank';
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            });
                                        }}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Download All
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardBody className="p-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {documents.length > 0 ? (
                                    documents.map((doc, index) => (
                                        <div key={index} className="group cursor-pointer" onClick={() => window.open(doc.path, '_blank')}>
                                            {/* Paper Document Container */}
                                            <div className="relative bg-white border border-stone-200 shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.25)] transition-all duration-300 transform hover:-translate-y-2 hover:rotate-1 rounded-none aspect-[3/4]">
                                                {/* Paper Texture Background */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-white via-stone-50/30 to-stone-100/20"></div>

                                                {/* Paper Fold Effect - Top Right Corner */}
                                                <div className="absolute top-0 right-0 w-8 h-8 bg-stone-200 border-l border-b border-stone-300 transform rotate-45 translate-x-4 -translate-y-4 shadow-sm"></div>
                                                <div className="absolute top-0 right-0 w-6 h-6 bg-stone-100 border-l border-b border-stone-250 transform rotate-45 translate-x-3 -translate-y-3"></div>

                                                {/* Paper Holes - Left Side */}
                                                <div className="absolute left-2 top-8 w-1.5 h-1.5 bg-stone-100 rounded-full border border-stone-200"></div>
                                                <div className="absolute left-2 top-16 w-1.5 h-1.5 bg-stone-100 rounded-full border border-stone-200"></div>
                                                <div className="absolute left-2 top-24 w-1.5 h-1.5 bg-stone-100 rounded-full border border-stone-200"></div>

                                                {/* Document Header */}
                                                <div className="relative p-4 border-b border-stone-200/50">
                                                    <div className="text-center mb-3">
                                                        <h3 className="serif-body text-sm font-bold text-stone-900 mb-1 leading-tight">
                                                            {doc.name}
                                                        </h3>
                                                        <div className="flex justify-center gap-1 text-xs mb-2">
                                                            {doc.pageCount && (
                                                                <span className="text-stone-600">
                                                                    {doc.pageCount} pages
                                                                </span>
                                                            )}
                                                            {doc.author && doc.pageCount && (
                                                                <span className="text-stone-400">•</span>
                                                            )}
                                                            {doc.author && (
                                                                <span className="text-stone-600">
                                                                    {doc.author}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Legal Metadata Badges */}
                                                        <div className="flex flex-wrap justify-center gap-1 text-xs">
                                                            {doc.state && (
                                                                <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                                                                    {doc.state}
                                                                </span>
                                                            )}
                                                            {doc.documentType && (
                                                                <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded border border-green-200">
                                                                    {doc.documentType}
                                                                </span>
                                                            )}
                                                            {doc.urgencyLevel && (
                                                                <span className={`px-1.5 py-0.5 rounded border text-xs ${doc.urgencyLevel === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                    doc.urgencyLevel === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                                        doc.urgencyLevel === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                                            'bg-gray-50 text-gray-700 border-gray-200'
                                                                    }`}>
                                                                    {doc.urgencyLevel}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Document Content Preview */}
                                                <div className="relative p-4 bg-white flex-1 overflow-hidden">
                                                    {/* Lined Paper Background */}
                                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-transparent"
                                                        style={{
                                                            backgroundImage: `repeating-linear-gradient(
                                                                 transparent,
                                                                 transparent 18px,
                                                                 #e5e7eb 18px,
                                                                 #e5e7eb 19px
                                                             )`
                                                        }}>
                                                    </div>

                                                    {/* Red Margin Line */}
                                                    <div className="absolute left-8 top-0 bottom-0 w-px bg-red-300"></div>

                                                    <div className="relative z-10 pl-6">
                                                        {doc.description ? (
                                                            <p className="serif-body text-xs text-stone-800 leading-5 mb-2">
                                                                {doc.description.length > 120 ? doc.description.substring(0, 120) + '...' : doc.description}
                                                            </p>
                                                        ) : (
                                                            <div className="space-y-4">
                                                                <div className="h-0.5 bg-stone-300 w-full"></div>
                                                                <div className="h-0.5 bg-stone-300 w-5/6"></div>
                                                                <div className="h-0.5 bg-stone-300 w-4/5"></div>
                                                                <div className="h-0.5 bg-stone-300 w-full"></div>
                                                                <div className="h-0.5 bg-stone-300 w-3/4"></div>
                                                                <div className="h-0.5 bg-stone-300 w-5/6"></div>
                                                                <div className="h-0.5 bg-stone-300 w-2/3"></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Document Footer */}
                                                <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-white/90 backdrop-blur-sm border-t border-stone-100">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center justify-between">
                                                            <div className="text-xs text-stone-500 space-y-0.5">
                                                                {doc.creationDate && (
                                                                    <div>
                                                                        {new Date(doc.creationDate).toLocaleDateString()}
                                                                    </div>
                                                                )}
                                                                {doc.caseNumber && (
                                                                    <div className="font-mono">
                                                                        {doc.caseNumber}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-1 text-stone-600 group-hover:text-blue-600 transition-colors">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                                <span className="text-xs font-medium">Download</span>
                                                            </div>
                                                        </div>

                                                        {/* Additional Legal Info */}
                                                        <div className="flex items-center justify-between text-xs text-stone-400">
                                                            <div className="flex gap-2">
                                                                {doc.statuteOfLimitations && (
                                                                    <span>SOL: {doc.statuteOfLimitations}</span>
                                                                )}
                                                                {doc.filingRequired && (
                                                                    <span className="text-orange-600">• Filing Req.</span>
                                                                )}
                                                            </div>
                                                            <div>
                                                                {doc.documentSize && (
                                                                    <span>{doc.documentSize}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Hover Overlay */}
                                                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-sm"></div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-12">
                                        <div className="w-16 h-20 mx-auto mb-4 bg-stone-100 border-2 border-stone-300 rounded-sm flex items-center justify-center">
                                            <svg className="w-8 h-10 text-stone-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <p className="serif-body text-stone-600 text-lg">
                                            Documents are being generated
                                        </p>
                                        <p className="serif-body text-stone-500 text-sm mt-1">
                                            Please check back shortly
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardBody>
                    </Card>
                )}

                {/* Celebration Section */}
                {isDemo && showSkeleton && !loadedComponents.celebration ? (
                    <Card className="bg-white paper-texture shadow-lg border border-stone-200 mb-8 animate-pulse">
                        <CardBody className="p-8">
                            <div className="text-center space-y-6">
                                <Skeleton className="h-8 w-8 mx-auto rounded-full" />
                                <Skeleton className="h-6 w-64 mx-auto rounded-lg" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-80 mx-auto rounded-lg" />
                                    <Skeleton className="h-4 w-72 mx-auto rounded-lg" />
                                </div>
                                <Skeleton className="h-12 w-48 mx-auto rounded-lg" />
                            </div>
                        </CardBody>
                    </Card>
                ) : (
                    <Card className="bg-white paper-texture shadow-lg border border-stone-200 mb-8">
                        <CardBody className="p-8">
                            <div className="text-center space-y-6">
                                <h2 className="serif-display text-2xl font-medium text-stone-900">
                                    {hasCase ? 'Case Complete!' : 'Analysis Complete'}
                                </h2>
                                <p className="serif-body text-stone-600">
                                    {hasCase
                                        ? 'Your case has been successfully analyzed and documents have been generated.'
                                        : 'Your case analysis is complete. Review the details above.'
                                    }
                                </p>
                            </div>
                        </CardBody>
                    </Card>
                )}

            </div>
        </div>
    );
}

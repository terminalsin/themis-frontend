'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCase, useGenerateMeme } from '@/hooks/use-case';
import { Spinner } from '@heroui/spinner';
import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Logo } from '@/components/logo';

export default function CompletedPage() {
    const params = useParams();
    const router = useRouter();
    const caseId = params.caseId as string;
    const { data: caseData, isLoading, error } = useCase(caseId);
    const [victoryMemes, setVictoryMemes] = useState<string[]>([]);
    const [documents, setDocuments] = useState<any[]>([]);

    const generateMeme = useGenerateMeme();

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

    const fetchVictoryMemes = async () => {
        try {
            const response = await fetch(`/api/cases/${caseId}/victory-memes`);
            if (response.ok) {
                const memes = await response.json();
                setVictoryMemes(memes);
            }
        } catch (error) {
            console.error('Failed to fetch victory memes:', error);
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

    React.useEffect(() => {
        if (caseData) {
            fetchVictoryMemes();
            fetchDocuments();
        }
    }, [caseData]);

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
            <div className="w-full max-w-6xl">
                {/* Logo */}
                <div className="flex justify-center pb-8 translate-y-[-40px]">
                    <Logo className="w-128 h-32" />
                </div>

                {/* Case Information Card */}
                <Card className="bg-white paper-texture shadow-lg border border-stone-200 mb-8">
                    <CardHeader className="p-8 border-b border-stone-200">
                        <div className="flex items-center justify-between w-full">
                            <h2 className="serif-display text-3xl font-medium text-stone-900">
                                {hasCase ? 'Your Legal Case' : 'Case Review'}
                            </h2>
                            <div className="flex items-center space-x-3">
                                <span className="text-2xl">{hasCase ? '🎉' : '😔'}</span>
                                <Chip
                                    color={hasCase ? 'success' : 'warning'}
                                    variant="flat"
                                    size="lg"
                                    className="text-black font-semibold"
                                >
                                    {hasCase ? 'VIABLE CASE' : 'NO GROUNDS'}
                                </Chip>
                            </div>
                        </div>
                    </CardHeader>

                    <CardBody className="p-8 space-y-8">
                        {/* Case Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-stone-50 p-6 rounded-lg border border-stone-200">
                                <h3 className="serif-display text-lg font-medium mb-2 text-stone-900">
                                    Case ID
                                </h3>
                                <p className="serif-body text-stone-700 font-mono text-sm">
                                    {caseId}
                                </p>
                            </div>

                            {caseData.analysis && (
                                <>
                                    <div className="bg-stone-50 p-6 rounded-lg border border-stone-200">
                                        <h3 className="serif-display text-lg font-medium mb-2 text-stone-900">
                                            Resolution
                                        </h3>
                                        <p className="serif-body text-stone-700 capitalize">
                                            {caseData.analysis.resolution.replace('-', ' ')}
                                        </p>
                                    </div>

                                    <div className="bg-stone-50 p-6 rounded-lg border border-stone-200">
                                        <h3 className="serif-display text-lg font-medium mb-2 text-stone-900">
                                            Confidence
                                        </h3>
                                        <p className="serif-body text-stone-700">
                                            {caseData.processing_summary?.confidence_score
                                                ? `${Math.round((caseData.processing_summary.confidence_score as number) * 100)}%`
                                                : 'High'
                                            }
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

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

                {/* Legal Documents Section */}
                <Card className="bg-white paper-texture shadow-lg border border-stone-200 mb-8">
                    <CardHeader className="p-8 border-b border-stone-200">
                        <h2 className="serif-display text-2xl font-medium text-stone-900">
                            Generated Documents
                        </h2>
                    </CardHeader>
                    <CardBody className="p-8">
                        <div className="grid grid-cols-1 gap-6">
                            {documents.length > 0 ? (
                                documents.map((doc, index) => (
                                    <div key={index} className="border border-stone-200 p-6 hover:shadow-lg transition-shadow duration-300 rounded-lg">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <h3 className="serif-body text-lg font-medium text-stone-900">
                                                        {doc.name}
                                                    </h3>
                                                    {doc.author && (
                                                        <span className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded">
                                                            by {doc.author}
                                                        </span>
                                                    )}
                                                </div>

                                                {doc.description && (
                                                    <p className="serif-body text-sm text-stone-600 mb-3">
                                                        {doc.description}
                                                    </p>
                                                )}

                                                <div className="flex flex-wrap gap-4 text-xs text-stone-500">
                                                    {doc.creationDate && (
                                                        <span>
                                                            Created: {new Date(doc.creationDate).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                    {doc.creator && doc.creator !== doc.author && (
                                                        <span>
                                                            Generated by: {doc.creator}
                                                        </span>
                                                    )}
                                                    {doc.keywords && doc.keywords.length > 0 && (
                                                        <span>
                                                            Tags: {doc.keywords.slice(0, 3).join(', ')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                as="a"
                                                href={doc.path}
                                                target="_blank"
                                                className="bg-stone-900 text-white serif-body hover:bg-stone-800 transition-colors duration-200 ml-4"
                                            >
                                                Download
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <p className="serif-body text-stone-600">
                                        Documents are being generated. Please check back shortly.
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardBody>
                </Card>

                {/* Celebration Section */}
                <Card className="bg-white paper-texture shadow-lg border border-stone-200 mb-8">
                    <CardBody className="p-8">
                        <div className="text-center space-y-6">
                            <h2 className="serif-display text-2xl font-medium text-stone-900">
                                {hasCase ? 'Celebrate Your Win' : 'Share Your Experience'}
                            </h2>

                            <Button
                                type="button"
                                size="lg"
                                className={`serif-body px-12 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300 ${hasCase
                                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold'
                                    : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold'
                                    }`}
                                onClick={handleGenerateMeme}
                                isLoading={generateMeme.isPending}
                            >
                                {generateMeme.isPending
                                    ? 'Creating...'
                                    : hasCase
                                        ? 'Celebrate Victory 🎉'
                                        : 'Generate Sobs 😭'
                                }
                            </Button>
                        </div>
                    </CardBody>
                </Card>

                {/* Victory Memes Display */}
                {victoryMemes.length > 0 && (
                    <Card className="bg-white paper-texture shadow-lg border border-stone-200">
                        <CardHeader className="p-8 border-b border-stone-200">
                            <h2 className="serif-display text-2xl font-medium text-stone-900">
                                {hasCase ? 'Victory Memes' : 'Consolation Memes'}
                            </h2>
                        </CardHeader>
                        <CardBody className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {victoryMemes.map((meme, index) => (
                                    <div key={index} className="text-center">
                                        <div className="border border-stone-200 p-4 inline-block rounded-lg">
                                            <img
                                                src={`/api/cases/${caseId}/victory-memes/${meme}`}
                                                alt={`${hasCase ? 'Victory' : 'Consolation'} meme ${index + 1}`}
                                                className="max-w-full h-auto"
                                                style={{ maxHeight: '300px' }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                )}
            </div>
        </main>
    );
}

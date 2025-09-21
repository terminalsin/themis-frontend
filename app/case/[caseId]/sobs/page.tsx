'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCase } from '@/hooks/use-case';
import { Button } from '@heroui/button';
import { Spinner } from '@heroui/spinner';
import { Logo } from '@/components/logo';

interface MemeData {
    filename: string;
    url: string;
}

export default function SobsPage() {
    const params = useParams();
    const router = useRouter();
    const caseId = params.caseId as string;
    const { data: caseData } = useCase(caseId);

    const [currentMeme, setCurrentMeme] = useState<MemeData | null>(null);
    const [availableMemes, setAvailableMemes] = useState<MemeData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch available memes on component mount
    useEffect(() => {
        fetchRandomMeme();
    }, [caseId]);

    const fetchRandomMeme = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`/api/cases/${caseId}/memes`);

            if (!response.ok) {
                throw new Error('Failed to fetch memes');
            }

            const data = await response.json();

            if (data.memes && data.memes.length > 0) {
                setAvailableMemes(data.memes);
                // Pick a random meme
                const randomIndex = Math.floor(Math.random() * data.memes.length);
                setCurrentMeme(data.memes[randomIndex]);
            } else {
                setError('No memes found for this case');
            }
        } catch (err) {
            console.error('Error fetching memes:', err);
            setError(err instanceof Error ? err.message : 'Failed to load memes');
        } finally {
            setIsLoading(false);
        }
    };

    const getNextRandomMeme = () => {
        if (availableMemes.length > 1) {
            // Filter out current meme to avoid showing the same one
            const otherMemes = availableMemes.filter(meme => meme.filename !== currentMeme?.filename);
            const randomIndex = Math.floor(Math.random() * otherMemes.length);
            setCurrentMeme(otherMemes[randomIndex]);
        } else if (availableMemes.length === 1) {
            // If only one meme, just refresh it
            setCurrentMeme(availableMemes[0]);
        }
    };

    const handleBackToCase = () => {
        router.push(`/case/${caseId}/resolution`);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-between mb-8">
                        <Logo />
                        <Button
                            variant="ghost"
                            onClick={handleBackToCase}
                            className="text-stone-600 hover:text-stone-900"
                        >
                            ← Back to Case
                        </Button>
                    </div>

                    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                        <div className="relative">
                            <div className="w-20 h-20 bg-stone-200 rounded-full flex items-center justify-center animate-pulse">
                                <span className="text-3xl">😭</span>
                            </div>
                            <div className="absolute inset-0 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin"></div>
                        </div>
                        <div className="text-center space-y-2">
                            <h2 className="serif-display text-2xl font-medium text-stone-900">
                                Loading Your Sobs...
                            </h2>
                            <p className="serif-body text-stone-600">
                                Preparing the perfect meme for your situation
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-between mb-8">
                        <Logo />
                        <Button
                            variant="ghost"
                            onClick={handleBackToCase}
                            className="text-stone-600 hover:text-stone-900"
                        >
                            ← Back to Case
                        </Button>
                    </div>

                    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                        <div className="text-center space-y-4">
                            <div className="text-6xl">😞</div>
                            <h2 className="serif-display text-2xl font-medium text-stone-900">
                                No Sobs Available
                            </h2>
                            <p className="serif-body text-stone-600 max-w-md">
                                {error}
                            </p>
                            <Button
                                onClick={fetchRandomMeme}
                                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                            >
                                Try Again
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Logo />
                    <Button
                        variant="ghost"
                        onClick={handleBackToCase}
                        className="text-stone-600 hover:text-stone-900"
                    >
                        ← Back to Case
                    </Button>
                </div>

                {/* Main Content */}
                <div className="max-w-4xl mx-auto">
                    {/* Title Section */}
                    <div className="text-center mb-12 space-y-4">
                        <div className="text-6xl mb-4">😭</div>
                        <h1 className="serif-display text-4xl font-bold text-stone-900">
                            Your Sobs
                        </h1>
                        <p className="serif-body text-xl text-stone-600 max-w-2xl mx-auto">
                            Sometimes life gives you lemons, sometimes it gives you a car accident.
                            Here's a meme to help you cope with the situation.
                        </p>
                        {caseData?.analysis?.resolution && (
                            <div className="mt-6">
                                <p className="serif-body text-lg text-stone-700">
                                    <span className="font-semibold">Case Result:</span> {caseData.analysis.resolution}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Meme Display */}
                    {currentMeme && (
                        <div className="text-center space-y-8 mb-8">
                            <div className="relative inline-block">
                                <img
                                    src={currentMeme.url}
                                    alt="Sobs meme"
                                    className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
                                    style={{ objectFit: 'contain' }}
                                />
                            </div>

                            <p className="serif-body text-stone-600 italic text-lg">
                                "{currentMeme.filename.replace(/\.(png|jpg|jpeg)$/i, '').replace(/_/g, ' ')}"
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                {availableMemes.length > 1 && (
                                    <Button
                                        onClick={getNextRandomMeme}
                                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3"
                                    >
                                        Another Sob 😢
                                    </Button>
                                )}

                                <Button
                                    onClick={handleBackToCase}
                                    variant="bordered"
                                    className="border-stone-300 text-stone-700 hover:bg-stone-50 font-semibold px-8 py-3"
                                >
                                    Back to Reality
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Footer Info */}
                    <div className="text-center text-stone-500 text-sm">
                        <p>
                            Meme {availableMemes.findIndex(m => m.filename === currentMeme?.filename) + 1} of {availableMemes.length} available
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

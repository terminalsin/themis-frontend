'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCase } from '@/hooks/use-case';
import { Button } from '@heroui/button';
import { CaseHeader } from '@/components/case-header';
import { CaseLoading } from '@/components/case-loading';

interface VictoryMemeData {
    filename: string;
    url: string;
}

export default function VictoryPage() {
    const params = useParams();
    const router = useRouter();
    const caseId = params.caseId as string;
    const { data: caseData } = useCase(caseId);

    const [currentMeme, setCurrentMeme] = useState<VictoryMemeData | null>(null);
    const [availableMemes, setAvailableMemes] = useState<VictoryMemeData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch available victory memes on component mount
    useEffect(() => {
        fetchRandomVictoryMeme();
    }, [caseId]);

    const fetchRandomVictoryMeme = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`/api/cases/${caseId}/victory-memes`);

            if (!response.ok) {
                throw new Error('Failed to fetch victory memes');
            }

            const filenames = await response.json();

            if (filenames && filenames.length > 0) {
                // Convert filenames to meme data with URLs
                const memeData: VictoryMemeData[] = filenames.map((filename: string) => ({
                    filename,
                    url: `/api/cases/${caseId}/victory-memes/${filename}`
                }));

                setAvailableMemes(memeData);
                // Pick a random meme
                const randomIndex = Math.floor(Math.random() * memeData.length);
                setCurrentMeme(memeData[randomIndex]);
            } else {
                setError('No victory memes found for this case');
            }
        } catch (err) {
            console.error('Error fetching victory memes:', err);
            setError(err instanceof Error ? err.message : 'Failed to load victory memes');
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
            <div className="px-4 py-8">
                <div className="container mx-auto">
                    <CaseHeader
                        showBackButton={true}
                        backUrl={`/case/${caseId}/resolution`}
                    />
                    <CaseLoading
                        title="Loading Your Victory..."
                        subtitle="Preparing the perfect celebration for your success"
                        icon="🎉"
                    />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="px-4 py-8">
                <div className="container mx-auto">
                    <CaseHeader
                        showBackButton={true}
                        backUrl={`/case/${caseId}/resolution`}
                    />
                    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                        <div className="text-center space-y-4">
                            <div className="text-6xl">😔</div>
                            <h2 className="serif-display text-2xl font-medium text-stone-900 italic">
                                No Victory Memes Available
                            </h2>
                            <p className="serif-body text-stone-600 max-w-md italic">
                                {error}
                            </p>
                            <Button
                                onClick={fetchRandomVictoryMeme}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white serif-body"
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
        <div className="px-4 py-8">
            <div className="container mx-auto">
                {/* Header */}
                <CaseHeader
                    showBackButton={true}
                    backUrl={`/case/${caseId}/resolution`}
                />

                {/* Main Content */}
                <div className="max-w-4xl mx-auto">
                    {/* Title Section */}
                    <div className="text-center mb-12 space-y-4">
                        <div className="text-6xl mb-4">🎉</div>
                        <h1 className="serif-display text-4xl font-bold text-stone-900 italic">
                            Victory Celebration!
                        </h1>
                        <p className="serif-body text-xl text-stone-600 max-w-2xl mx-auto italic">
                            Sometimes justice prevails! Here's a celebratory meme to commemorate
                            your successful case resolution.
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
                                    alt="Victory celebration meme"
                                    className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
                                    style={{ objectFit: 'contain' }}
                                />
                            </div>

                            <p className="serif-body text-stone-600 italic text-lg">
                                "{currentMeme.filename.replace(/\.(png|jpg|jpeg|svg)$/i, '').replace(/_/g, ' ')}"
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                {availableMemes.length > 1 && (
                                    <Button
                                        onClick={getNextRandomMeme}
                                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-8 py-3"
                                    >
                                        Another Victory! 🏆
                                    </Button>
                                )}

                                <Button
                                    onClick={handleBackToCase}
                                    variant="bordered"
                                    className="border-stone-300 text-stone-700 hover:bg-stone-50 font-semibold px-8 py-3"
                                >
                                    Back to Case
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Footer Info */}
                    <div className="text-center text-stone-500 text-sm">
                        <p>
                            Victory meme {availableMemes.findIndex(m => m.filename === currentMeme?.filename) + 1} of {availableMemes.length} available
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCase } from '@/hooks/use-case';
import { Card, CardBody } from '@heroui/card';
import { CaseHeader } from '@/components/case-header';
import { CaseLoading } from '@/components/case-loading';
import { CaseError } from '@/components/case-error';

export default function TimelineAnalysisPage() {
    const params = useParams();
    const router = useRouter();
    const caseId = params.caseId as string;
    const { data: caseData, isLoading, error } = useCase(caseId);

    const [currentPhase, setCurrentPhase] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const phases = [
        {
            name: "Mapping temporal sequences",
            description: "Creating precise timeline of events"
        },
        {
            name: "Analyzing cause and effect",
            description: "Identifying causal relationships"
        },
        {
            name: "Calculating reaction times",
            description: "Measuring response delays"
        },
        {
            name: "Determining fault sequence",
            description: "Establishing legal responsibility"
        }
    ];

    // Redirect to resolution page - it handles all loading states
    React.useEffect(() => {
        if (caseData) {
            router.push(`/case/${caseId}/resolution`);
        }
    }, [caseData, caseId, router]);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev + 1.2;
                if (newProgress >= 100) {
                    return 100;
                }

                const phaseIndex = Math.floor((newProgress / 100) * phases.length);
                const newPhaseIndex = Math.min(phaseIndex, phases.length - 1);

                if (newPhaseIndex !== currentPhase) {
                    setIsTransitioning(true);
                    setTimeout(() => {
                        setCurrentPhase(newPhaseIndex);
                        setIsTransitioning(false);
                    }, 300);
                }

                return newProgress;
            });
        }, 180);

        return () => clearInterval(interval);
    }, [phases.length, currentPhase]);

    if (isLoading) {
        return <CaseLoading />;
    }

    if (error || !caseData) {
        return <CaseError />;
    }

    return (
        <div className="px-6 py-8">
            <div className="w-full max-w-2xl mx-auto">
                <Card className="bg-stone-50 border-stone-200 shadow-lg">
                    <CardBody className="text-center py-16 px-12">
                        {/* Elegant Header */}
                        <div className="mb-12">
                            <div className="relative mb-8">
                                <div className="w-20 h-20 mx-auto bg-stone-800 rounded-full flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-stone-700 to-stone-900 opacity-90"></div>
                                    <div className="relative text-2xl text-stone-100">⚖</div>
                                    {/* Subtle pulse animation */}
                                    <div className="absolute inset-0 rounded-full border border-stone-600 animate-pulse opacity-40"></div>
                                </div>
                            </div>

                            <h1 className="serif-display text-4xl italic text-stone-800 mb-4 tracking-wide">
                                Timeline Analysis
                            </h1>
                            <p className="serif-body text-lg text-stone-600 italic leading-relaxed max-w-md mx-auto">
                                Constructing a chronological narrative of events and establishing causal relationships
                            </p>
                        </div>

                        {/* Elegant Progress Indicator */}
                        <div className="mb-12">
                            <div className="relative w-64 h-1 bg-gray-300 mx-auto rounded-full overflow-hidden">
                                <div
                                    className="absolute left-0 top-0 h-full bg-gray-700 transition-all duration-500 ease-out rounded-full"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <div className="mt-3 serif-body text-sm text-gray-500 italic">
                                {Math.round(progress)}% complete
                            </div>
                        </div>

                        {/* Current Phase with Blur Transition */}
                        <div className="mb-12 relative min-h-[120px] flex items-center justify-center">
                            <div className={`transition-all duration-500 ease-in-out ${isTransitioning ? 'opacity-0 blur-sm scale-95' : 'opacity-100 blur-0 scale-100'
                                }`}>
                                <div className="bg-white border border-gray-300 rounded-lg p-8 shadow-sm max-w-md mx-auto">
                                    <div className="mb-4">
                                        <div className="w-2 h-2 bg-gray-700 rounded-full mx-auto mb-4 animate-pulse"></div>
                                    </div>
                                    <h3 className="serif-display text-xl italic text-gray-800 mb-3 leading-relaxed">
                                        {phases[currentPhase]?.name}
                                    </h3>
                                    <p className="serif-body text-gray-600 italic text-sm leading-relaxed">
                                        {phases[currentPhase]?.description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Minimalist Phase Indicators */}
                        <div className="mb-12">
                            <div className="flex items-center justify-center space-x-6">
                                {phases.map((_, index) => (
                                    <div key={index} className="flex flex-col items-center">
                                        <div className={`w-3 h-3 rounded-full transition-all duration-500 ${index <= currentPhase
                                            ? 'bg-gray-700 shadow-sm'
                                            : 'bg-gray-300'
                                            }`}></div>
                                        <div className="mt-2 serif-body text-xs text-gray-500 italic">
                                            {index + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Subtle Analysis Metrics */}
                        <div className="grid grid-cols-3 gap-6 max-w-sm mx-auto mb-8">
                            <div className="text-center">
                                <div className="serif-display text-2xl text-gray-800 mb-1">5</div>
                                <div className="serif-body text-xs text-gray-500 italic">Events</div>
                            </div>
                            <div className="text-center">
                                <div className="serif-display text-2xl text-gray-800 mb-1">2.3s</div>
                                <div className="serif-body text-xs text-gray-500 italic">Window</div>
                            </div>
                            <div className="text-center">
                                <div className="serif-display text-2xl text-gray-800 mb-1">98%</div>
                                <div className="serif-body text-xs text-gray-500 italic">Certainty</div>
                            </div>
                        </div>

                        {/* Elegant Note */}
                        <div className="border-t border-gray-300 pt-6">
                            <p className="serif-body text-sm text-gray-600 italic leading-relaxed max-w-lg mx-auto">
                                Employing temporal correlation algorithms to establish precise causality chains
                                and determine legal responsibility through chronological analysis.
                            </p>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody } from '@heroui/card';
import { Spinner } from '@heroui/spinner';
import { Progress } from '@heroui/progress';

interface TimelineAnalysisStepProps {
    className?: string;
}

export const TimelineAnalysisStep: React.FC<TimelineAnalysisStepProps> = ({ className = "" }) => {
    const [currentPhase, setCurrentPhase] = useState(0);
    const [progress, setProgress] = useState(0);

    const phases = [
        {
            name: "Mapping temporal sequences",
            icon: "⏰",
            description: "Creating precise timeline of events"
        },
        {
            name: "Analyzing cause and effect",
            icon: "🔗",
            description: "Identifying causal relationships"
        },
        {
            name: "Calculating reaction times",
            icon: "⚡",
            description: "Measuring response delays"
        },
        {
            name: "Determining fault sequence",
            icon: "⚖️",
            description: "Establishing legal responsibility"
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev + 1.5;
                if (newProgress >= 100) {
                    return 100;
                }

                const phaseIndex = Math.floor((newProgress / 100) * phases.length);
                setCurrentPhase(Math.min(phaseIndex, phases.length - 1));

                return newProgress;
            });
        }, 150);

        return () => clearInterval(interval);
    }, [phases.length]);

    return (
        <Card className={`w-full max-w-2xl ${className}`}>
            <CardBody className="text-center py-12 space-y-8">
                {/* Timeline Animation */}
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                            <span className="text-3xl">📊</span>
                        </div>
                        {/* Animated rings */}
                        <div className="absolute inset-0 w-24 h-24 border-4 border-green-300 rounded-full animate-ping opacity-30"></div>
                        <div className="absolute inset-2 w-20 h-20 border-2 border-teal-300 rounded-full animate-ping opacity-50" style={{ animationDelay: '0.5s' }}></div>
                    </div>
                </div>

                {/* Title and Description */}
                <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-gray-900">
                        Building Timeline Analysis
                    </h2>
                    <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
                        Creating a detailed timeline of events and analyzing the sequence of actions that led to the incident.
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-4">
                    <Progress
                        value={progress}
                        className="max-w-md mx-auto"
                        color="success"
                        size="lg"
                    />
                    <div className="text-sm text-gray-500">
                        {Math.round(progress)}% Complete
                    </div>
                </div>

                {/* Current Phase */}
                <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-6 max-w-lg mx-auto">
                    <div className="flex items-center justify-center space-x-3 mb-3">
                        <span className="text-3xl animate-pulse">
                            {phases[currentPhase]?.icon}
                        </span>
                        <Spinner size="sm" color="success" />
                    </div>
                    <div className="text-base font-semibold text-gray-800 mb-2">
                        {phases[currentPhase]?.name}
                    </div>
                    <div className="text-sm text-gray-600">
                        {phases[currentPhase]?.description}
                    </div>
                </div>

                {/* Timeline Visualization */}
                <div className="max-w-lg mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-700">Timeline Progress</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        {[0, 1, 2, 3, 4].map((step) => (
                            <div key={step} className="flex-1 flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step <= currentPhase
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    {step + 1}
                                </div>
                                {step < 4 && (
                                    <div className={`flex-1 h-1 mx-2 ${step < currentPhase ? 'bg-green-500' : 'bg-gray-200'
                                        }`}></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Analysis Metrics */}
                <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                    <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-green-600">5</div>
                        <div className="text-xs text-gray-600">Key Events</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-blue-600">2.3s</div>
                        <div className="text-xs text-gray-600">Critical Window</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-purple-600">98%</div>
                        <div className="text-xs text-gray-600">Confidence</div>
                    </div>
                </div>

                {/* Technical Note */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md mx-auto">
                    <div className="text-sm text-amber-800">
                        <span className="font-semibold">⚡ Advanced Analysis:</span> Using temporal correlation algorithms to establish precise causality chains and legal fault determination.
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

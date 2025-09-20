'use client';

import React from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { VideoPlayer } from '../video-player';
import { VideoAnalysis } from '@/types/case';

interface ResolutionStepProps {
    caseId: string;
    analysis: VideoAnalysis;
    hasCase: boolean;
    onGenerateCase: () => void;
    onGenerateSobs: () => void;
    isGeneratingCase?: boolean;
    isGeneratingSobs?: boolean;
    className?: string;
}

export const ResolutionStep: React.FC<ResolutionStepProps> = ({
    caseId,
    analysis,
    hasCase,
    onGenerateCase,
    onGenerateSobs,
    isGeneratingCase = false,
    isGeneratingSobs = false,
    className = ""
}) => {
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

    return (
        <div className={`w-full max-w-6xl space-y-12 ${className}`}>
            {/* Video Player with Timeline */}
            <VideoPlayer
                videoSrc={`/api/cases/${caseId}/video`}
                timeline={analysis.timeline}
            />

            {/* Analysis Results */}
            <Card className="bg-white paper-texture shadow-lg border border-stone-200">
                <CardHeader className="p-8 border-b border-stone-200">
                    <div className="flex items-center justify-between w-full">
                        <h2 className="serif-display text-3xl font-medium text-stone-900">Analysis Complete</h2>
                        <div className="flex items-center space-x-3">
                            <span className="text-2xl">{getResolutionIcon(analysis.resolution)}</span>
                            <div className={`px-4 py-2 rounded-lg serif-body font-medium ${getResolutionColor(analysis.resolution) === 'success' ? 'bg-stone-100 text-stone-800' :
                                getResolutionColor(analysis.resolution) === 'danger' ? 'bg-stone-100 text-stone-800' :
                                    'bg-stone-100 text-stone-800'
                                }`}>
                                {analysis.resolution.replace('-', ' ').toUpperCase()}
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardBody className="p-8 space-y-10">
                    {/* Resolution Details */}
                    <div className="bg-stone-50 p-6 rounded-lg border border-stone-200">
                        <h3 className="serif-display text-xl font-medium mb-4 text-stone-900">
                            What Happened:
                        </h3>
                        <p className="serif-body text-stone-700 leading-relaxed text-lg">
                            {analysis.resolution_details}
                        </p>
                    </div>

                    {/* Party Analysis */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {analysis.parties.map((party, index) => (
                            <div
                                key={index}
                                className={`p-6 rounded-lg border-2 ${party.at_fault
                                    ? 'border-red-200 bg-red-50'
                                    : 'border-green-200 bg-green-50'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-lg font-semibold capitalize">
                                        {party.party === 'self' ? 'You' : 'Other Party'}
                                    </h4>
                                    <Chip
                                        color={party.at_fault ? 'danger' : 'success'}
                                        variant="flat"
                                        size="sm"
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
                                <h3 className="text-2xl font-bold mb-2">
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
                                        onClick={onGenerateCase}
                                        isLoading={isGeneratingCase}
                                    >
                                        {isGeneratingCase ? 'Preparing...' : 'Generate My Case 📄'}
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        size="lg"
                                        className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold px-12 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                                        onClick={onGenerateSobs}
                                        isLoading={isGeneratingSobs}
                                    >
                                        {isGeneratingSobs ? 'Creating...' : 'Generate Sobs 😭'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                </CardBody>
            </Card>
        </div>
    );
};

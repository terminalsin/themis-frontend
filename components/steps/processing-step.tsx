'use client';

import React from 'react';
import { Card, CardBody } from '@heroui/card';
import { Spinner } from '@heroui/spinner';
import { Progress } from '@heroui/progress';

interface ProcessingStepProps {
    className?: string;
}

export const ProcessingStep: React.FC<ProcessingStepProps> = ({ className = "" }) => {
    return (
        <div className={`elegant-card w-full max-w-2xl ${className}`}>
            <div className="text-center py-16 px-8 space-y-10">
                {/* Main Spinner */}
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="elegant-spinner w-16 h-16"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-6 h-6 bg-gray-100 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>

                {/* Title and Description */}
                <div className="space-y-6">
                    <h2 className="text-3xl serif-heading text-gray-900">
                        Processing Your Video
                    </h2>
                    <p className="serif-body text-lg text-gray-600 max-w-md mx-auto">
                        Your video is being uploaded and prepared for AI analysis. This may take a few moments.
                    </p>
                </div>

                {/* Progress Indicator */}
                <div className="space-y-4">
                    <div className="elegant-progress h-2 max-w-md mx-auto">
                        <div className="elegant-progress-bar w-2/3"></div>
                    </div>
                    <div className="serif-body text-sm text-gray-500">
                        Uploading and optimizing video...
                    </div>
                </div>

                {/* Processing Steps */}
                <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
                    <h3 className="serif-heading text-lg text-gray-800 mb-6">Processing Steps</h3>
                    <div className="space-y-4 text-left">
                        <div className="flex items-center space-x-4">
                            <div className="w-3 h-3 bg-gray-900 rounded-full"></div>
                            <span className="serif-body text-gray-700">Video uploaded successfully</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse"></div>
                            <span className="serif-body text-gray-700">Optimizing for analysis</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                            <span className="serif-body text-gray-400">Preparing AI models</span>
                        </div>
                    </div>
                </div>

                {/* Fun Fact */}
                <div className="bg-gray-100 border border-gray-200 rounded-2xl p-6 max-w-md mx-auto">
                    <div className="serif-body text-gray-700">
                        <span className="font-semibold">💡 Did you know?</span> Our AI can analyze over 1000 frames per second to identify critical moments in your video.
                    </div>
                </div>
            </div>
        </div>
    );
};

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody } from '@heroui/card';
import { Spinner } from '@heroui/spinner';
import { Progress } from '@heroui/progress';

interface AnalysisStepProps {
    className?: string;
}

export const AnalysisStep: React.FC<AnalysisStepProps> = ({ className = "" }) => {
    const [currentTask, setCurrentTask] = useState(0);
    const [progress, setProgress] = useState(0);

    const tasks = [
        { name: "Extracting video frames", icon: "🎬" },
        { name: "Detecting objects and vehicles", icon: "🚗" },
        { name: "Analyzing movement patterns", icon: "📊" },
        { name: "Identifying critical moments", icon: "⚡" },
        { name: "Processing collision data", icon: "💥" }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev + 2;
                if (newProgress >= 100) {
                    return 100;
                }

                // Update current task based on progress
                const taskIndex = Math.floor((newProgress / 100) * tasks.length);
                setCurrentTask(Math.min(taskIndex, tasks.length - 1));

                return newProgress;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [tasks.length]);

    return (
        <Card className={`elegant-card w-full max-w-2xl ${className}`}>
            <CardBody className="text-center py-16 px-8 space-y-10">
                {/* AI Brain Animation */}
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center animate-pulse">
                            <span className="text-2xl">🧠</span>
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-600 rounded-full animate-bounce">
                            <span className="text-xs">✨</span>
                        </div>
                    </div>
                </div>

                {/* Title and Description */}
                <div className="space-y-6">
                    <h2 className="text-3xl serif-heading text-gray-900">
                        AI Analysis in Progress
                    </h2>
                    <p className="serif-body text-lg text-gray-600 max-w-md mx-auto">
                        Our advanced AI is analyzing your video frame by frame to understand exactly what happened.
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-4">
                    <Progress
                        value={progress}
                        className="max-w-md mx-auto"
                        color="secondary"
                        size="lg"
                    />
                    <div className="text-sm text-gray-500">
                        {progress}% Complete
                    </div>
                </div>

                {/* Current Task */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 max-w-md mx-auto">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                        <span className="text-2xl animate-bounce">
                            {tasks[currentTask]?.icon}
                        </span>
                        <Spinner size="sm" />
                    </div>
                    <div className="text-sm font-medium text-gray-800">
                        {tasks[currentTask]?.name}
                    </div>
                </div>

                {/* Analysis Features */}
                <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                        <div className="text-2xl mb-2">🎯</div>
                        <div className="text-xs font-medium text-gray-700">Object Detection</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                        <div className="text-2xl mb-2">📐</div>
                        <div className="text-xs font-medium text-gray-700">Trajectory Analysis</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                        <div className="text-2xl mb-2">⏱️</div>
                        <div className="text-xs font-medium text-gray-700">Timing Analysis</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                        <div className="text-2xl mb-2">⚖️</div>
                        <div className="text-xs font-medium text-gray-700">Fault Assessment</div>
                    </div>
                </div>

                {/* Technical Info */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-md mx-auto">
                    <div className="text-xs text-gray-600">
                        <span className="font-semibold">🔬 Technical:</span> Using computer vision and machine learning to analyze vehicle dynamics, collision physics, and traffic law compliance.
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

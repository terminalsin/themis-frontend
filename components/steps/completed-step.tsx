'use client';

import React from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';

interface CompletedStepProps {
    caseId: string;
    hasCase: boolean;
    documentPath?: string;
    memePath?: string;
    onGenerateMeme: () => void;
    isGeneratingMeme?: boolean;
    className?: string;
}

export const CompletedStep: React.FC<CompletedStepProps> = ({
    caseId,
    hasCase,
    documentPath,
    memePath,
    onGenerateMeme,
    isGeneratingMeme = false,
    className = ""
}) => {
    return (
        <div className={`w-full max-w-3xl space-y-8 ${className}`}>
            <Card>
                <CardHeader className="text-center pb-4">
                    <div className="space-y-4">
                        <div className="text-6xl animate-bounce">
                            {hasCase ? '🎉' : '😭'}
                        </div>
                        <h2 className="text-4xl font-bold text-gray-900">
                            {hasCase ? 'Case Complete!' : 'Analysis Complete!'}
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            {hasCase
                                ? 'Your legal case has been successfully generated and is ready for download.'
                                : 'Your analysis is complete. Time for some consolation therapy!'
                            }
                        </p>
                    </div>
                </CardHeader>

                <CardBody className="space-y-8">
                    {/* Success/Completion Message */}
                    <div className={`p-8 rounded-xl border-2 ${hasCase
                        ? 'border-green-300 bg-gradient-to-r from-green-50 to-emerald-50'
                        : 'border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50'
                        }`}>
                        <div className="text-center space-y-4">
                            <h3 className="text-2xl font-bold">
                                {hasCase ? '✅ Legal Case Generated' : '🤗 Consolation Package Ready'}
                            </h3>
                            <p className="text-lg text-gray-700">
                                {hasCase
                                    ? 'Your comprehensive legal case document has been created with all the evidence and analysis needed for your claim.'
                                    : 'While you may not have a legal case, we\'ve prepared something to cheer you up!'
                                }
                            </p>
                        </div>
                    </div>

                    {/* Document Download Section */}
                    {hasCase && documentPath && (
                        <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <span className="text-2xl">📄</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Legal Case Document</h3>
                                        <p className="text-sm text-gray-600">Complete case analysis and recommendations</p>
                                    </div>
                                </div>
                                <Button
                                    as="a"
                                    href={`/api/cases/${caseId}/document`}
                                    target="_blank"
                                    size="lg"
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    <div className="flex items-center space-x-2">
                                        <span>Download Case</span>
                                        <span className="text-lg">⬇️</span>
                                    </div>
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Celebration/Meme Section */}
                    <div className="text-center space-y-6">
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                {hasCase ? '🎊 Time to Celebrate!' : '😢 Need Some Cheering Up?'}
                            </h3>
                            <p className="text-gray-700 mb-6">
                                {hasCase
                                    ? 'You\'ve got a solid case! Let\'s create a victory meme to commemorate this moment.'
                                    : 'Sometimes life gives you lemons. Let\'s make a funny meme out of this situation!'
                                }
                            </p>

                            <Button
                                type="button"
                                size="lg"
                                className={`font-semibold px-12 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300 ${hasCase
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                                    : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white'
                                    }`}
                                onClick={onGenerateMeme}
                                isLoading={isGeneratingMeme}
                            >
                                {isGeneratingMeme ? (
                                    <div className="flex items-center space-x-2">
                                        <span>Creating Meme...</span>
                                        <span className="animate-spin">🎨</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <span>{hasCase ? 'Celebrate' : 'Generate Sobs'}</span>
                                        <span className="text-xl">{hasCase ? '🎉' : '😭'}</span>
                                    </div>
                                )}
                            </Button>
                        </div>

                        {/* Meme Display */}
                        {memePath && (
                            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    {hasCase ? '🏆 Victory Meme!' : '🤡 Consolation Meme!'}
                                </h3>
                                <div className="flex justify-center">
                                    <img
                                        src={`/api/cases/${caseId}/meme`}
                                        alt={hasCase ? "Victory celebration meme" : "Consolation meme"}
                                        className="max-w-full h-auto rounded-lg shadow-lg border border-gray-200"
                                        style={{ maxHeight: '400px' }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Next Steps */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <h3 className="font-semibold text-gray-800 mb-4">
                            {hasCase ? '⚖️ Next Steps:' : '🔄 What\'s Next:'}
                        </h3>
                        <div className="space-y-3 text-sm text-gray-700">
                            {hasCase ? (
                                <>
                                    <div className="flex items-center space-x-3">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                        <span>Review your case document thoroughly</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                        <span>Consult with a qualified attorney</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                        <span>Gather any additional evidence if needed</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                        <span>Consider filing your claim promptly</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center space-x-3">
                                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                        <span>Learn from this experience for future driving</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                        <span>Consider defensive driving courses</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                        <span>Review your insurance coverage</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                        <span>Stay safe on the roads!</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center text-sm text-gray-500 border-t border-gray-200 pt-6">
                        <p>
                            This analysis was generated by Themis AI Legal Analysis System.
                            {hasCase && ' For legal advice, please consult with a qualified attorney.'}
                        </p>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

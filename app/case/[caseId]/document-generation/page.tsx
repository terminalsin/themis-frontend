'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCase, useUploadPhoto, useGenerateDocument } from '@/hooks/use-case';
import { Spinner } from '@heroui/spinner';
import { PhotoUpload } from '@/components/photo-upload';

export default function DocumentGenerationPage() {
    const params = useParams();
    const router = useRouter();
    const caseId = params.caseId as string;
    const { data: caseData, isLoading, error } = useCase(caseId);

    const [userPhoto, setUserPhoto] = useState<File | null>(null);
    const [otherPartyPhoto, setOtherPartyPhoto] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const uploadPhoto = useUploadPhoto();
    const generateDocument = useGenerateDocument();

    const handlePhotoUpload = async (file: File, type: 'user' | 'other') => {
        await uploadPhoto.mutateAsync({ caseId, file, type });
        if (type === 'user') setUserPhoto(file);
        else setOtherPartyPhoto(file);
    };

    const canGenerate = userPhoto && otherPartyPhoto && !uploadPhoto.isPending;

    // Auto-redirect to completed page when both photos are uploaded
    useEffect(() => {
        if (canGenerate && !isProcessing) {
            setIsProcessing(true);
            // Generate document and redirect
            setTimeout(async () => {
                try {
                    await generateDocument.mutateAsync(caseId);
                    router.push(`/case/${caseId}/completed`);
                } catch (error) {
                    console.error('Failed to generate document:', error);
                    setIsProcessing(false);
                }
            }, 1000);
        }
    }, [canGenerate, isProcessing, generateDocument, caseId, router]);

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

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-12">
            <div className="elegant-card w-full max-w-4xl">
                <div className="text-center py-16 px-8 space-y-12">
                    {/* Title */}
                    <div className="space-y-4">
                        <h1 className="text-4xl serif-heading text-gray-900">
                            Document Generation
                        </h1>
                        <p className="serif-body text-lg text-gray-600 max-w-md mx-auto">
                            Upload identification photos to complete your case
                        </p>
                    </div>

                    {/* Photo Upload Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-3xl mx-auto">
                        {/* User Photo */}
                        <div className="space-y-6">
                            <div className="text-center">
                                <h3 className="serif-heading text-xl text-gray-800 mb-2">Your Photo</h3>
                                {userPhoto && (
                                    <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center mx-auto">
                                        <span className="text-white text-xs">✓</span>
                                    </div>
                                )}
                            </div>
                            <PhotoUpload
                                onFileSelect={(file) => handlePhotoUpload(file, 'user')}
                                selectedFile={userPhoto}
                                placeholder="Upload your photo"
                                className="h-64 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                            />
                        </div>

                        {/* Other Party Photo */}
                        <div className="space-y-6">
                            <div className="text-center">
                                <h3 className="serif-heading text-xl text-gray-800 mb-2">Other Party Photo</h3>
                                {otherPartyPhoto && (
                                    <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center mx-auto">
                                        <span className="text-white text-xs">✓</span>
                                    </div>
                                )}
                            </div>
                            <PhotoUpload
                                onFileSelect={(file) => handlePhotoUpload(file, 'other')}
                                selectedFile={otherPartyPhoto}
                                placeholder="Upload other party photo"
                                className="h-64 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div className="max-w-md mx-auto">
                        {uploadPhoto.isPending && (
                            <div className="text-center space-y-3">
                                <div className="elegant-spinner w-6 h-6 mx-auto"></div>
                                <p className="serif-body text-gray-600">Uploading...</p>
                            </div>
                        )}

                        {isProcessing && (
                            <div className="text-center space-y-3">
                                <div className="elegant-spinner w-6 h-6 mx-auto"></div>
                                <p className="serif-body text-gray-600">Generating document...</p>
                            </div>
                        )}

                        {!canGenerate && !uploadPhoto.isPending && !isProcessing && (
                            <div className="text-center space-y-4">
                                <div className="flex items-center justify-center space-x-8">
                                    <div className={`flex items-center space-x-2 serif-body ${userPhoto ? 'text-gray-900' : 'text-gray-400'}`}>
                                        <span>{userPhoto ? '●' : '○'}</span>
                                        <span>Your Photo</span>
                                    </div>
                                    <div className={`flex items-center space-x-2 serif-body ${otherPartyPhoto ? 'text-gray-900' : 'text-gray-400'}`}>
                                        <span>{otherPartyPhoto ? '●' : '○'}</span>
                                        <span>Other Party</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

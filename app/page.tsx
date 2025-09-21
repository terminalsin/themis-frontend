'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from "@/components/logo";
import { UploadButton } from "@/components/upload-button";
import { Button } from "@heroui/button";
import { DebugPanel } from "@/components/debug-panel";
import { useCreateCase, useUploadVideo, useStartAnalysis } from "@/hooks/use-case";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();

  const createCase = useCreateCase();
  const uploadVideo = useUploadVideo();
  const startAnalysis = useStartAnalysis();

  const handleFileSelect = (file: File) => {
    console.log('handleFileSelect called with file:', file);
    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });
    setSelectedFile(file);
    console.log('File state updated');
  };

  const handleStartCase = async () => {
    if (!selectedFile) return;

    // Check if this is a demo video and redirect accordingly
    if (selectedFile.name === 'demo1.MOV') {
      console.log('Demo1 video detected, redirecting to demo1 case');
      router.push('/case/demo1');
      return;
    }

    if (selectedFile.name === 'demo2.MOV') {
      console.log('Demo2 video detected, redirecting to demo2 case');
      router.push('/case/demo2');
      return;
    }

    try {
      console.log('Creating case...');
      const result = await createCase.mutateAsync();
      console.log('Case created:', result);

      if (!result?.caseId) {
        throw new Error('No case ID returned from server');
      }

      const newCaseId = result.caseId;

      console.log('Uploading video for case:', newCaseId);
      await uploadVideo.mutateAsync({ caseId: newCaseId, file: selectedFile });

      console.log('Starting analysis for case:', newCaseId);
      await startAnalysis.mutateAsync(newCaseId);

      // Redirect to case page
      console.log('Redirecting to case page:', `/case/${newCaseId}`);
      router.push(`/case/${newCaseId}`);
    } catch (error) {
      console.error('Failed to start case:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };


  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="max-w-3xl w-full flex flex-col items-center ">

        {/* Logo */}
        <div className="transform hover:scale-[1.02] transition-transform duration-500">
          <Logo className="drop-shadow-sm" />
        </div>



        {/* Upload Button */}
        <div className="transform hover:scale-[1.02] transition-all duration-300">
          <UploadButton
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            className="drop-shadow-sm"
          />
        </div>

        {/* Start Case Button */}
        {selectedFile && (
          <div className="mt-8">
            <button
              onClick={handleStartCase}
              disabled={createCase.isPending || uploadVideo.isPending || startAnalysis.isPending}
              className="text-black elegant-button-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {(createCase.isPending || uploadVideo.isPending || startAnalysis.isPending) ? (
                <div className="flex items-center space-x-3">
                  <div className="elegant-spinner w-5 h-5"></div>
                  <span>Starting Case...</span>
                </div>
              ) : (
                'Start Case'
              )}
            </button>
          </div>
        )}

        {/* Headline */}
        <div className="text-center space-y-8 mt-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl serif-display text-gray-900 leading-tight">
            Accidents with an <em className="italic text-gray-700">easy solution</em>
          </h1>

          {/* Decorative line */}
          <div className="flex justify-center">
            <div className="w-16 h-px bg-gray-300"></div>
          </div>

        </div>
        {/* Subtle footer ornament */}
        <div className="mt-8 opacity-30">
          <svg width="60" height="20" viewBox="0 0 60 20" fill="none">
            <path
              d="M5 10 Q15 5, 25 10 T45 10 Q50 12, 55 10"
              stroke="rgba(0,0,0,0.2)"
              strokeWidth="0.5"
              fill="none"
            />
          </svg>
        </div>

      </div>
    </main>
  );
}

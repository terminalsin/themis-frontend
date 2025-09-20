'use client';

import React, { useState } from 'react';
import { Logo } from "@/components/logo";
import { UploadButton } from "@/components/upload-button";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    console.log('Selected file:', file.name);
    // Here you would typically handle the file upload
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

        {/* Headline */}
        <div className="text-center space-y-6 mt-16">
          <h2 className="text-5xl md:text-6xl lg:text-7xl serif-display text-gray-900 font-light leading-tight tracking-tight">
            Accidents with an <span className="italic">easy solution</span>
          </h2>

          {/* Decorative line */}
          <div className="flex justify-center mt-8">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
          </div>
        </div>

        {/* Subtle footer ornament */}
        <div className="mt-16 opacity-30">
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

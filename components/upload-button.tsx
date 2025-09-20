'use client';

import React, { useRef } from 'react';
import { Button } from '@heroui/button';

interface UploadButtonProps {
    onFileSelect?: (file: File) => void;
    className?: string;
    selectedFile?: File | null;
}

export const UploadButton: React.FC<UploadButtonProps> = ({
    onFileSelect,
    className = "",
    selectedFile
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && onFileSelect) {
            onFileSelect(file);
        }
    };

    return (
        <div className={`relative ${className}`}>
            <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
                aria-label="Upload video file"
            />

            <div
                onClick={handleButtonClick}
                className="relative w-96 h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer transition-all duration-300 hover:shadow-lg group overflow-hidden"
            >
                {/* Video placeholder background pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="w-full h-full" style={{
                        backgroundImage: `repeating-linear-gradient(
                            45deg,
                            transparent,
                            transparent 10px,
                            rgba(0,0,0,0.1) 10px,
                            rgba(0,0,0,0.1) 20px
                        )`
                    }}></div>
                </div>

                {/* Main content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-5 py-6">
                    {selectedFile ? (
                        // Selected file state
                        <>
                            {/* File icon */}
                            <div className="relative">
                                <div className="w-18 h-18 bg-green-50 rounded-full shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform duration-500 border border-green-100">
                                    <svg
                                        className="w-9 h-9 text-green-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                            </div>

                            {/* File info */}
                            <div className="text-center space-y-2 px-6">
                                <p className="text-lg font-light text-gray-800 serif-display tracking-wide">
                                    Video Selected
                                </p>
                                <p className="text-sm text-gray-600 serif-body font-medium truncate max-w-72">
                                    {selectedFile.name}
                                </p>
                                <p className="text-xs text-gray-400 serif-body font-light tracking-wide">
                                    {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                                </p>
                            </div>

                            {/* Decorative line */}
                            <div className="flex justify-center">
                                <div className="w-12 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                            </div>

                            {/* Change file button */}
                            <div className="text-xs text-gray-500 serif-body font-light tracking-wide hover:text-gray-700 transition-colors duration-300">
                                Click to change video
                            </div>
                        </>
                    ) : (
                        // Default upload state
                        <>
                            {/* Play button icon */}
                            <div className="relative mb-2">
                                <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform duration-500 border border-gray-100">
                                    <svg
                                        className="w-10 h-10 text-gray-600 ml-1"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                                {/* Subtle pulse animation */}
                                <div className="absolute inset-0 w-20 h-20 bg-white rounded-full animate-ping opacity-10"></div>
                            </div>

                            {/* Upload text */}
                            <div className="text-center space-y-3">
                                <p className="text-xl font-light text-gray-700 serif-display tracking-wide leading-relaxed">
                                    Drop your video here
                                </p>
                                <p className="text-base text-gray-500 serif-body font-light tracking-wide">
                                    or click to browse
                                </p>
                            </div>

                            {/* Decorative line */}
                            <div className="flex justify-center">
                                <div className="w-16 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                            </div>

                            {/* File format indicators */}
                            <div className="flex space-x-3 text-sm text-gray-400 serif-body font-light tracking-wider">
                                <span className="px-3 py-1.5 bg-gray-50 rounded-sm border border-gray-200">MP4</span>
                                <span className="px-3 py-1.5 bg-gray-50 rounded-sm border border-gray-200">MOV</span>
                                <span className="px-3 py-1.5 bg-gray-50 rounded-sm border border-gray-200">AVI</span>
                            </div>
                        </>
                    )}
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
            </div>
        </div>
    );
};

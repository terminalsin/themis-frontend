'use client';

import React, { useRef } from 'react';

interface PhotoUploadProps {
    onFileSelect?: (file: File) => void;
    selectedFile?: File | null;
    placeholder?: string;
    className?: string;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
    onFileSelect,
    selectedFile,
    placeholder = "Upload photo",
    className = ""
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
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                aria-label="Upload photo"
            />

            <div
                onClick={handleButtonClick}
                className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer transition-all duration-300 hover:shadow-lg group overflow-hidden"
            >
                {selectedFile ? (
                    // Preview selected image
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <img
                            src={URL.createObjectURL(selectedFile)}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 hover:bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                            <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium">
                                Click to change
                            </div>
                        </div>
                    </div>
                ) : (
                    // Default upload state
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                            <svg
                                className="w-6 h-6 text-gray-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                                />
                            </svg>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-700">{placeholder}</p>
                            <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 10MB</p>
                        </div>
                    </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
            </div>
        </div>
    );
};

'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@heroui/button';
import { Slider } from '@heroui/slider';
import { Spinner } from '@heroui/spinner';
import { TimelineItem } from '@/types/case';

interface LoadingVideoPlayerProps {
    videoSrc: string;
    timeline?: TimelineItem[];
    isVideoLoading?: boolean;
    isAnalysisLoading?: boolean;
    className?: string;
}

export const LoadingVideoPlayer: React.FC<LoadingVideoPlayerProps> = ({
    videoSrc,
    timeline = [],
    isVideoLoading = false,
    isAnalysisLoading = false,
    className = ""
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const timelineContainerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentAnnotation, setCurrentAnnotation] = useState<TimelineItem | null>(null);
    const [currentAnnotationIndex, setCurrentAnnotationIndex] = useState<number>(-1);

    const timeToSeconds = (timeStr: string): number => {
        const [minutes, seconds] = timeStr.split(':').map(Number);
        return minutes * 60 + seconds;
    };

    const secondsToTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        const video = videoRef.current;
        if (!video || isVideoLoading) return;

        const updateTime = () => setCurrentTime(video.currentTime);
        const updateDuration = () => setDuration(video.duration);

        video.addEventListener('timeupdate', updateTime);
        video.addEventListener('loadedmetadata', updateDuration);

        return () => {
            video.removeEventListener('timeupdate', updateTime);
            video.removeEventListener('loadedmetadata', updateDuration);
        };
    }, [isVideoLoading]);

    useEffect(() => {
        if (isAnalysisLoading || timeline.length === 0) return;

        // Find current annotation based on video time
        const currentIndex = timeline.findIndex((item, index) => {
            const itemTime = timeToSeconds(item.timestamp);
            const nextItem = timeline[index + 1];
            const nextTime = nextItem ? timeToSeconds(nextItem.timestamp) : duration;

            return currentTime >= itemTime && currentTime < nextTime;
        });

        const current = currentIndex >= 0 ? timeline[currentIndex] : null;

        if (current !== currentAnnotation) {
            setCurrentAnnotation(current);
            setCurrentAnnotationIndex(currentIndex);
        }
    }, [currentTime, timeline, duration, currentAnnotation, isAnalysisLoading]);

    // Auto-scroll timeline container when annotation changes
    useEffect(() => {
        if (currentAnnotationIndex >= 0 && timelineContainerRef.current && !isAnalysisLoading) {
            const container = timelineContainerRef.current;
            const activeButton = container.children[currentAnnotationIndex] as HTMLElement;

            if (activeButton) {
                const containerHeight = container.clientHeight;
                const buttonTop = activeButton.offsetTop;
                const buttonHeight = activeButton.offsetHeight;
                const scrollTop = buttonTop - (containerHeight / 2) + (buttonHeight / 2);

                container.scrollTo({
                    top: Math.max(0, scrollTop),
                    behavior: 'smooth'
                });
            }
        }
    }, [currentAnnotationIndex, isAnalysisLoading]);

    const togglePlay = () => {
        const video = videoRef.current;
        if (!video || isVideoLoading) return;

        if (isPlaying) {
            video.pause();
        } else {
            video.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (value: number | number[]) => {
        const video = videoRef.current;
        if (!video || isVideoLoading) return;

        const seekTime = Array.isArray(value) ? value[0] : value;
        video.currentTime = seekTime;
        setCurrentTime(seekTime);
    };

    const jumpToTimestamp = (timestamp: string) => {
        const video = videoRef.current;
        if (!video || isVideoLoading) return;

        const seekTime = timeToSeconds(timestamp);
        video.currentTime = seekTime;
        setCurrentTime(seekTime);
    };

    const renderTimelineContent = () => {
        if (isAnalysisLoading) {
            return (
                <div className="p-6 space-y-6">
                    <div className="text-center space-y-4">
                        <Spinner size="lg" />
                        <div className="space-y-2">
                            <h4 className="serif-display text-lg font-medium text-stone-900">
                                Analyzing Video
                            </h4>
                            <p className="serif-body text-sm text-stone-600">
                                AI is processing your video to identify key moments...
                            </p>
                        </div>
                    </div>

                    {/* Processing Steps */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <div className="w-3 h-3 bg-stone-900 rounded-full"></div>
                            <span className="serif-body text-stone-700">Video uploaded successfully</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="w-3 h-3 bg-stone-900 rounded-full"></div>
                            <span className="serif-body text-stone-700">Video processing completed</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="w-3 h-3 bg-stone-400 rounded-full animate-pulse"></div>
                            <span className="serif-body text-stone-700">Analyzing timeline events</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="w-3 h-3 bg-stone-200 rounded-full"></div>
                            <span className="serif-body text-stone-400">Determining fault analysis</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="elegant-progress h-2">
                            <div className="elegant-progress-bar w-3/4"></div>
                        </div>
                        <div className="serif-body text-xs text-stone-500 text-center">
                            Processing timeline analysis...
                        </div>
                    </div>
                </div>
            );
        }

        if (timeline.length === 0) {
            return (
                <div className="p-6 text-center space-y-4">
                    <div className="text-4xl">🎬</div>
                    <div className="space-y-2">
                        <h4 className="serif-display text-lg font-medium text-stone-900">
                            Ready for Analysis
                        </h4>
                        <p className="serif-body text-sm text-stone-600">
                            Timeline analysis will appear here once processing is complete.
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <div
                ref={timelineContainerRef}
                className="p-4 space-y-2 overflow-y-scroll elegant-scrollbar"
                style={{ height: 'calc(100% - 120px)' }}
            >
                {timeline.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => jumpToTimestamp(item.timestamp)}
                        className={`relative w-full text-left p-4 rounded-lg transition-all duration-500 ease-in-out transform hover:scale-[1.02] hover:shadow-md ${currentAnnotation === item
                            ? 'bg-stone-900 text-white shadow-lg scale-[1.02] ring-2 ring-stone-300 ring-opacity-50'
                            : 'bg-stone-50 text-stone-800 hover:bg-stone-100 border border-stone-200'
                            }`}
                        style={{
                            transform: currentAnnotation === item ? 'scale(1.02)' : 'scale(1)',
                            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    >
                        <div className={`serif-body text-sm font-medium mb-2 transition-colors duration-300 ${currentAnnotation === item ? 'text-stone-300' : 'text-stone-600'
                            }`}>
                            {item.timestamp}
                        </div>
                        <div className={`serif-body text-sm leading-relaxed transition-colors duration-300 ${currentAnnotation === item ? 'text-white' : 'text-stone-700'
                            }`}>
                            {item.description}
                        </div>

                        {/* Animated indicator for active item */}
                        {currentAnnotation === item && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-stone-300 rounded-r-full animate-pulse"></div>
                        )}

                        {/* Progress indicator */}
                        <div className={`absolute bottom-0 left-0 h-0.5 bg-stone-800 transition-all duration-300 ${currentAnnotation === item ? 'w-full' : 'w-0'
                            }`}></div>
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className={`flex gap-8 items-start h-[600px] overflow-hidden ${className}`}>
            {/* Video Section */}
            <div className="flex-1 bg-stone-50 rounded-lg overflow-hidden shadow-lg border border-stone-200 flex flex-col">
                {/* Video Element */}
                <div className="relative bg-black flex-1 overflow-hidden">
                    {isVideoLoading ? (
                        <div className="w-full h-full flex items-center justify-center bg-stone-900">
                            <div className="text-center space-y-6">
                                <Spinner size="lg" color="white" />
                                <div className="space-y-2">
                                    <h3 className="text-xl font-medium text-white serif-display">
                                        Processing Video
                                    </h3>
                                    <p className="text-stone-300 serif-body">
                                        Preparing your video for analysis...
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <video
                            ref={videoRef}
                            src={videoSrc}
                            className="w-full h-full object-contain"
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                        />
                    )}
                </div>

                {/* Controls */}
                <div className="bg-stone-100 p-6 space-y-4 border-t border-stone-200 flex-shrink-0">
                    {/* Progress Bar */}
                    <div className="space-y-3">
                        <Slider
                            aria-label="Video progress"
                            value={[currentTime]}
                            onChange={handleSeek}
                            maxValue={duration}
                            step={0.1}
                            className="w-full"
                            isDisabled={isVideoLoading}
                            classNames={{
                                track: "bg-stone-300",
                                filler: "bg-stone-800",
                                thumb: "bg-stone-900 border-2 border-white shadow-lg"
                            }}
                        />
                        <div className="flex justify-between serif-body text-xs text-stone-600">
                            <span>{secondsToTime(currentTime)}</span>
                            <span>{secondsToTime(duration)}</span>
                        </div>
                    </div>

                    {/* Play/Pause Button */}
                    <div className="flex justify-center">
                        <Button
                            onClick={togglePlay}
                            className="bg-stone-900 hover:bg-stone-800 text-white transition-all duration-200 ease-in-out transform hover:scale-105 shadow-lg"
                            size="lg"
                            isDisabled={isVideoLoading}
                        >
                            {isPlaying ? (
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Timeline Section */}
            <div className="w-80 bg-white paper-texture rounded-lg shadow-lg border border-stone-200 overflow-hidden flex flex-col h-full">
                <div className="bg-stone-50 px-6 py-4 border-b border-stone-200 flex-shrink-0">
                    <h3 className="serif-display text-lg font-medium text-stone-900">
                        {isAnalysisLoading ? 'Analyzing Timeline' : 'Timeline Analysis'}
                    </h3>
                    <p className="serif-body text-sm text-stone-600 mt-1">
                        {isAnalysisLoading ? 'Processing key moments...' : 'Key moments in the incident'}
                    </p>
                </div>

                {renderTimelineContent()}

                {/* Elegant bottom border */}
                <div className="h-2 bg-gradient-to-r from-stone-100 via-stone-200 to-stone-100"></div>
            </div>
        </div>
    );
};

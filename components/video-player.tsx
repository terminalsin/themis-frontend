'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@heroui/button';
import { Slider } from '@heroui/slider';
import { TimelineItem } from '@/types/case';

interface VideoPlayerProps {
    videoSrc: string;
    timeline: TimelineItem[];
    className?: string;
    isVideoLoading?: boolean;
    isTimelineLoading?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
    videoSrc,
    timeline,
    className = "",
    isVideoLoading = false,
    isTimelineLoading = false
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
        if (!video) return;

        const updateTime = () => setCurrentTime(video.currentTime);
        const updateDuration = () => setDuration(video.duration);
        const handleLoadStart = () => console.log('Video load started');
        const handleLoadedData = () => console.log('Video data loaded');
        const handleCanPlay = () => console.log('Video can play');
        const handleError = (e: Event) => {
            console.error('Video error:', e);
            const target = e.target as HTMLVideoElement;
            if (target.error) {
                console.error('Video error details:', {
                    code: target.error.code,
                    message: target.error.message,
                    src: target.src,
                    networkState: target.networkState,
                    readyState: target.readyState
                });
            }
        };

        video.addEventListener('timeupdate', updateTime);
        video.addEventListener('loadedmetadata', updateDuration);
        video.addEventListener('loadstart', handleLoadStart);
        video.addEventListener('loadeddata', handleLoadedData);
        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('error', handleError);

        return () => {
            video.removeEventListener('timeupdate', updateTime);
            video.removeEventListener('loadedmetadata', updateDuration);
            video.removeEventListener('loadstart', handleLoadStart);
            video.removeEventListener('loadeddata', handleLoadedData);
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('error', handleError);
        };
    }, [videoSrc]);

    // Debug logging
    useEffect(() => {
        console.log('VideoPlayer props:', {
            videoSrc,
            isVideoLoading,
            isTimelineLoading,
            timelineLength: timeline.length
        });
    }, [videoSrc, isVideoLoading, isTimelineLoading, timeline.length]);

    useEffect(() => {
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
    }, [currentTime, timeline, duration, currentAnnotation]);

    // Auto-scroll timeline container when annotation changes
    useEffect(() => {
        if (currentAnnotationIndex >= 0 && timelineContainerRef.current) {
            const container = timelineContainerRef.current;
            const activeButton = container.children[currentAnnotationIndex] as HTMLElement;

            if (activeButton) {
                // Calculate the position to scroll to center the active button
                const containerHeight = container.clientHeight;
                const buttonTop = activeButton.offsetTop;
                const buttonHeight = activeButton.offsetHeight;

                // Center the active button in the container
                const scrollTop = buttonTop - (containerHeight / 2) + (buttonHeight / 2);

                // Smooth scroll within the container
                container.scrollTo({
                    top: Math.max(0, scrollTop),
                    behavior: 'smooth'
                });
            }
        }
    }, [currentAnnotationIndex]);

    const togglePlay = () => {
        const video = videoRef.current;
        if (!video || isVideoLoading || !videoSrc) return;

        if (isPlaying) {
            video.pause();
        } else {
            video.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (value: number | number[]) => {
        const video = videoRef.current;
        if (!video || isVideoLoading || !videoSrc) return;

        const seekTime = Array.isArray(value) ? value[0] : value;
        video.currentTime = seekTime;
        setCurrentTime(seekTime);
    };

    const jumpToTimestamp = (timestamp: string) => {
        const video = videoRef.current;
        if (!video || isVideoLoading || !videoSrc) return;

        const seekTime = timeToSeconds(timestamp);
        video.currentTime = seekTime;
        setCurrentTime(seekTime);
    };

    return (
        <div className={`flex gap-8 items-start h-[600px] overflow-hidden ${className}`}>
            {/* Video Section */}
            <div className="flex-1 bg-stone-50 rounded-lg overflow-hidden shadow-lg border border-stone-200 flex flex-col">
                {/* Video Element */}
                <div className="relative bg-black flex-1 overflow-hidden">
                    {isVideoLoading ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-stone-900 to-stone-800">
                            <div className="text-center space-y-8">
                                {/* Animated Processing Icon */}
                                <div className="relative">
                                    <div className="w-20 h-20 bg-stone-700 rounded-full flex items-center justify-center animate-pulse">
                                        <span className="text-3xl">🎬</span>
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-stone-600 rounded-full animate-bounce">
                                        <span className="text-xs">✨</span>
                                    </div>
                                    {/* Rotating ring */}
                                    <div className="absolute inset-0 border-2 border-stone-500 border-t-stone-300 rounded-full animate-spin"></div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="serif-display text-xl text-stone-100 font-medium">
                                        Processing Your Video
                                    </h3>
                                    <p className="serif-body text-stone-300 max-w-md mx-auto leading-relaxed">
                                        Our AI is analyzing your video frame by frame to identify key moments and track vehicle movements.
                                    </p>
                                </div>

                                {/* Animated progress dots */}
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        </div>
                    ) : videoSrc ? (
                        <video
                            key={videoSrc}
                            ref={videoRef}
                            src={videoSrc}
                            className="w-full h-full object-contain"
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            controls={false}
                            preload="metadata"
                            crossOrigin="anonymous"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-stone-900 to-stone-800">
                            <div className="text-center space-y-8">
                                <div className="text-6xl">📹</div>
                                <div className="space-y-4">
                                    <h3 className="serif-display text-xl text-stone-100 font-medium">
                                        Video Not Available
                                    </h3>
                                    <p className="serif-body text-stone-300 max-w-md mx-auto leading-relaxed">
                                        The processed video is not yet available. Please wait for processing to complete.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className={`bg-stone-100 p-6 space-y-4 border-t border-stone-200 flex-shrink-0 ${isVideoLoading || !videoSrc ? 'opacity-50' : ''}`}>
                    {/* Progress Bar */}
                    <div className="space-y-3">
                        <Slider
                            aria-label="Video progress"
                            value={[currentTime]}
                            onChange={handleSeek}
                            maxValue={duration}
                            step={0.1}
                            className="w-full"
                            isDisabled={isVideoLoading || !videoSrc}
                            classNames={{
                                track: "bg-stone-300",
                                filler: "bg-stone-800",
                                thumb: "bg-stone-900 border-2 border-white shadow-lg"
                            }}
                        />
                        <div className="flex justify-between serif-body text-xs text-stone-600">
                            <span>{isVideoLoading || !videoSrc ? '--:--' : secondsToTime(currentTime)}</span>
                            <span>{isVideoLoading || !videoSrc ? '--:--' : secondsToTime(duration)}</span>
                        </div>
                    </div>

                    {/* Play/Pause Button */}
                    <div className="flex justify-center">
                        <Button
                            onClick={togglePlay}
                            isDisabled={isVideoLoading || !videoSrc}
                            className="bg-stone-900 hover:bg-stone-800 text-white transition-all duration-200 ease-in-out transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            size="lg"
                        >
                            {isVideoLoading || !videoSrc ? (
                                <svg className="w-6 h-6 animate-spin" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2v4m0 12v4m10-10h-4M6 12H2m15.364-6.364l-2.828 2.828M9.464 14.536l-2.828 2.828m9.9-2.828l-2.828-2.828M9.464 9.464L6.636 6.636" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            ) : isPlaying ? (
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
                        Timeline Analysis
                    </h3>
                    <p className="serif-body text-sm text-stone-600 mt-1">
                        Key moments in the incident
                    </p>
                </div>

                <div
                    ref={timelineContainerRef}
                    className="p-4 space-y-2 overflow-y-scroll elegant-scrollbar"
                    style={{ height: 'calc(100% - 120px)' }}
                >
                    {isTimelineLoading ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-6">
                            <div className="relative">
                                <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center animate-pulse">
                                    <span className="text-2xl">⚖️</span>
                                </div>
                                <div className="absolute inset-0 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin"></div>
                            </div>

                            <div className="text-center space-y-3">
                                <h4 className="serif-display text-lg font-medium text-stone-800">
                                    Analyzing Timeline
                                </h4>
                                <p className="serif-body text-sm text-stone-600 max-w-xs mx-auto leading-relaxed">
                                    Our AI is identifying critical moments and building a chronological sequence of events.
                                </p>
                            </div>

                            {/* Loading skeleton items */}
                            <div className="w-full space-y-3 mt-8">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-stone-100 rounded-lg p-4 animate-pulse">
                                        <div className="h-3 bg-stone-200 rounded w-16 mb-2"></div>
                                        <div className="h-4 bg-stone-200 rounded w-full mb-1"></div>
                                        <div className="h-4 bg-stone-200 rounded w-3/4"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        timeline.map((item, index) => (
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
                        ))
                    )}
                </div>

                {/* Elegant bottom border */}
                <div className="h-2 bg-gradient-to-r from-stone-100 via-stone-200 to-stone-100"></div>
            </div>
        </div>
    );
};

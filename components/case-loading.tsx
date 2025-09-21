import { Spinner } from '@heroui/spinner';

interface CaseLoadingProps {
    title?: string;
    subtitle?: string;
    icon?: string;
}

export function CaseLoading({
    title = "Loading Case",
    subtitle = "Retrieving your case details...",
    icon = "⚖️"
}: CaseLoadingProps) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-12 min-h-[60vh]">
            <div className="text-center space-y-6">
                <div className="flex justify-center">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        {/* Icon background */}
                        <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center animate-pulse">
                            <span className="text-2xl">{icon}</span>
                        </div>
                        {/* Rotating SVG loader */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-16 h-16 animate-spin text-stone-600" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-light text-stone-900 serif-display italic">
                        {title}
                    </h1>
                    <p className="text-stone-600 serif-body italic">
                        {subtitle}
                    </p>
                </div>
            </div>
        </div>
    );
}

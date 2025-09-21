interface CaseErrorProps {
    title?: string;
    message?: string;
    icon?: string;
    actionText?: string;
    actionUrl?: string;
}

export function CaseError({
    title = "Case Not Found",
    message = "We couldn't find the case you're looking for. It may have been deleted or the link may be incorrect.",
    icon = "😔",
    actionText = "Start New Case",
    actionUrl = "/"
}: CaseErrorProps) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-12 min-h-[60vh]">
            <div className="text-center space-y-6 max-w-md">
                <div className="text-6xl">{icon}</div>
                <div className="space-y-4">
                    <h1 className="text-3xl font-light text-stone-900 serif-display italic">
                        {title}
                    </h1>
                    <p className="text-stone-600 serif-body italic leading-relaxed">
                        {message}
                    </p>
                </div>
                <a
                    href={actionUrl}
                    className="inline-block px-6 py-3 bg-stone-900 text-white serif-body font-medium rounded-lg hover:bg-stone-800 transition-colors duration-200"
                >
                    {actionText}
                </a>
            </div>
        </div>
    );
}

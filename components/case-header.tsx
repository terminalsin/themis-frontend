import { Button } from "@heroui/button";
import { useRouter } from "next/navigation";

interface CaseHeaderProps {
    showBackButton?: boolean;
    backUrl?: string;
    className?: string;
}

export function CaseHeader({
    showBackButton = false,
    backUrl = "/",
    className = ""
}: CaseHeaderProps) {
    const router = useRouter();

    const handleBack = () => {
        router.push(backUrl);
    };

    if (!showBackButton) {
        return null; // No header needed when no back button
    }

    return (
        <div className={`flex justify-end mb-8 ${className}`}>
            <Button
                variant="ghost"
                onClick={handleBack}
                className="text-stone-600 hover:text-stone-900 serif-body italic transition-all duration-300"
            >
                ← Back
            </Button>
        </div>
    );
}

"use client";
import { Link } from "@heroui/link";
import { Logo } from "@/components/logo";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
export default function CaseLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    return (
        <div className="relative flex flex-col min-h-screen bg-stone-50">
            {/* Header with Logo */}
            <header className="w-full py-8 px-6">
                <div className="max-w-6xl mx-auto flex justify-center" onClick={() => router.push("/")}>
                    <div className="transform hover:scale-[1.02] transition-transform duration-500 translate-y-[-35px]">
                        <Logo className="h-16 w-auto drop-shadow-sm" />
                    </div>
                </div>
            </header>

            <main className="flex-grow">
                {children}
            </main>

        </div>
    );
}

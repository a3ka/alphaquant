"use client"

import { useEffect, useState } from "react";
import config from "@/config";
import { SignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import ParticleBackground from '@/components/ParticleBackground';
import Navbar from '@/components/Navbar';

export default function SignUpPage() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        
        if (!config?.auth?.enabled) {
            router.back();
        }
    }, [router]);

    if (!isMounted) {
        return null;
    }

    return (
        <div className="h-screen w-screen bg-[#0A0B0D] bg-opacity-95 text-white overflow-hidden relative">
            <ParticleBackground>
                <div className="flex flex-col h-full">
                    <Navbar />
                    <main className="flex-grow container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8 flex items-center justify-center">
                        <div className="w-full max-w-md">
                            <SignUp 
                                appearance={{
                                    elements: {
                                        rootBox: "mx-auto",
                                        card: "bg-[#0A1929]/80 backdrop-blur-md border border-gray-800/30 rounded-lg shadow-[0_0_20px_rgba(0,122,255,0.2)]",
                                        headerTitle: "text-white",
                                        headerSubtitle: "text-gray-400",
                                        socialButtonsBlockButton: "bg-white/10 hover:bg-white/20 text-white border border-white/10",
                                        formFieldLabel: "text-gray-300",
                                        formFieldInput: "bg-white/5 border-gray-700 text-white",
                                        formButtonPrimary: "bg-gradient-to-r from-[#003366] to-[#0066CC] hover:from-[#002244] hover:to-[#004499]",
                                        footerActionLink: "text-blue-400 hover:text-blue-300"
                                    }
                                }}
                                fallbackRedirectUrl="/" 
                                signInFallbackRedirectUrl="/main" 
                            />
                        </div>
                    </main>
                </div>
            </ParticleBackground>
        </div>
    );
}
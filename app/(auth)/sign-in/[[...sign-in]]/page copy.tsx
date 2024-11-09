"use client"

import { useEffect, useState } from "react";
import PageWrapper from "@/components/wrapper/page-wrapper";
import config from "@/config";
import { SignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SignInPage() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        
        if (!config?.auth?.enabled) {
            router.back();
        }
    }, [router]);

    if (!isMounted) {
        return null; // или можно вернуть скелетон/лоадер
    }

    return (
        <PageWrapper>
            <div className="flex min-w-screen justify-center my-[5rem]">
                <SignIn 
                    appearance={{
                        elements: {
                            rootBox: "mx-auto",
                            card: "rounded-lg",
                        }
                    }}
                    fallbackRedirectUrl="/" 
                    signUpFallbackRedirectUrl="/main" 
                />
            </div>
        </PageWrapper>
    );
}
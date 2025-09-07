"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";

function EmailVerificationContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [verifying, setVerifying] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setError("No verification token provided");
            setVerifying(false);
            return;
        }

        const verifyEmail = async () => {
            try {
                await api.post("/auth/verify-email", { token });
                setSuccess(true);
            } catch (error: any) {
                setError(error.response?.data?.message || "Verification failed");
            } finally {
                setVerifying(false);
            }
        };

        verifyEmail();
    }, [searchParams]);

    if (verifying) {
        return (
            <div className="min-h-screen bg-gradient-primary">
                <Navbar />
                <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
                    <div className="glass-card w-full max-w-md text-center">
                        <div className="w-20 h-20 mx-auto mb-6 gradient-secondary rounded-3xl flex items-center justify-center shadow-lg">
                            <span className="text-3xl">⏳</span>
                        </div>
                        <h1 className="hero-title text-2xl mb-4">Verifying Email</h1>
                        <p className="hero-subtitle">Please wait while we verify your email address...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-primary">
                <Navbar />
                <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
                    <div className="glass-card w-full max-w-md text-center">
                        <div className="w-20 h-20 mx-auto mb-6 gradient-success rounded-3xl flex items-center justify-center shadow-lg">
                            <span className="text-3xl">✅</span>
                        </div>
                        <h1 className="hero-title text-3xl mb-4">Email Verified!</h1>
                        <p className="hero-subtitle mb-6">
                            Congratulations! Your email has been successfully verified. You can now sign in to your account.
                        </p>
                        <Link href="/auth/login" className="btn-primary w-full">
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-primary">
                <Navbar />
                <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
                    <div className="glass-card w-full max-w-md text-center">
                        <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-3xl flex items-center justify-center shadow-lg border border-red-500/20">
                            <span className="text-3xl">❌</span>
                        </div>
                        <h1 className="hero-title text-3xl mb-4">Verification Failed</h1>
                        <p className="hero-subtitle mb-6">
                            Sorry, we couldn't verify your email. The verification link may be invalid or expired.
                        </p>
                        <div className="space-y-3">
                            <Link href="/auth/login" className="btn-secondary w-full">
                                Try Signing In
                            </Link>
                            <Link href="/auth/register" className="btn-primary w-full">
                                Create New Account
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-primary" suppressHydrationWarning>
            <Navbar />
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
                <div className="glass-card w-full max-w-md text-center">
                    <div className="w-20 h-20 mx-auto mb-6 gradient-secondary rounded-3xl flex items-center justify-center shadow-lg">
                        <span className="text-3xl">⏳</span>
                    </div>
                    <h1 className="hero-title text-2xl mb-4">Loading...</h1>
                    <p className="hero-subtitle">Please wait...</p>
                </div>
            </div>
        </div>
    );
}

export default function EmailVerificationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-primary">
                <Navbar />
                <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
                    <div className="glass-card w-full max-w-md text-center">
                        <div className="w-20 h-20 mx-auto mb-6 gradient-secondary rounded-3xl flex items-center justify-center shadow-lg">
                            <span className="text-3xl">⏳</span>
                        </div>
                        <h1 className="hero-title text-2xl mb-4">Loading...</h1>
                        <p className="hero-subtitle">Please wait...</p>
                    </div>
                </div>
            </div>
        }>
            <EmailVerificationContent />
        </Suspense>
    );
}

"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"success" | "error">("success");

    const token = searchParams.get('token');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            setMessage("Passwords do not match");
            setMessageType("error");
            return;
        }

        if (formData.password.length < 6) {
            setMessage("Password must be at least 6 characters long");
            setMessageType("error");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            await api.post("/auth/reset-password", { 
                token, 
                newPassword: formData.password 
            });
            setMessage("Password has been reset successfully! You can now log in with your new password.");
            setMessageType("success");
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push("/auth/login");
            }, 3000);
        } catch (error: any) {
            setMessage(error.response?.data?.message || "Failed to reset password");
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-gradient-primary">
                <Navbar />
                <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
                    <div className="glass-card w-full max-w-md text-center">
                        <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-3xl flex items-center justify-center shadow-lg border border-red-500/20">
                            <span className="text-3xl">❌</span>
                        </div>
                        <h1 className="hero-title text-3xl mb-4">Invalid Reset Link</h1>
                        <p className="hero-subtitle mb-6">
                            The password reset link is invalid or has expired. Please request a new one.
                        </p>
                        <Link href="/auth/forgot-password" className="btn-primary w-full">
                            Request New Reset Link
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-primary">
                <Navbar />
                <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
                    <div className="glass-card w-full max-w-md">
                        <div className="w-20 h-20 mx-auto mb-6 gradient-secondary rounded-3xl flex items-center justify-center shadow-lg">
                            <span className="text-3xl">🔑</span>
                        </div>
                        <h1 className="hero-title text-3xl mb-2">Reset Password</h1>
                        <p className="hero-subtitle">Enter your new password below</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-primary" suppressHydrationWarning>
            <Navbar />
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
                <div className="glass-card w-full max-w-md">
                    <div className="w-20 h-20 mx-auto mb-6 gradient-secondary rounded-3xl flex items-center justify-center shadow-lg">
                        <span className="text-3xl">🔑</span>
                    </div>
                    <h1 className="hero-title text-3xl mb-2">Reset Password</h1>
                    <p className="hero-subtitle">Enter your new password below</p>

                    {message && (
                        <div className={`mb-6 p-4 backdrop-blur-md border rounded-2xl ${
                            messageType === "success" 
                                ? "bg-green-500/10 border-green-500/20" 
                                : "bg-red-500/10 border-red-500/20"
                        }`}>
                            <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    messageType === "success" ? "bg-green-500" : "bg-red-500"
                                }`}>
                                    <span className="text-white text-sm">
                                        {messageType === "success" ? "✅" : "⚠️"}
                                    </span>
                                </div>
                                <p className={`font-medium ${
                                    messageType === "success" ? "text-green-300" : "text-red-300"
                                }`}>
                                    {message}
                                </p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                New Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                required
                                className="form-input"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Enter your new password"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                required
                                className="form-input"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                placeholder="Confirm your new password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                    <span>Resetting Password...</span>
                                </div>
                            ) : (
                                "Reset Password"
                            )}
                        </button>
                    </form>

                    <div className="text-center mt-8">
                        <p className="text-gray-300">
                            Remember your password?{" "}
                            <Link 
                                href="/auth/login" 
                                className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors duration-300"
                            >
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
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
            <ResetPasswordContent />
        </Suspense>
    );
}

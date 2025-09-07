"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"success" | "error">("success");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const response = await api.post("/auth/forgot-password", { email });
            setMessage(response.data.message || "If the email exists, a reset link will be sent");
            setMessageType("success");
            setEmail("");
        } catch (error: any) {
            setMessage(error.response?.data?.message || "Failed to process request");
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-primary" suppressHydrationWarning>
            <Navbar />
            
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>
            
            <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
                <div className="glass-card w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 mx-auto mb-6 gradient-secondary rounded-3xl flex items-center justify-center shadow-lg">
                            <span className="text-3xl">🔑</span>
                        </div>
                        <h1 className="hero-title text-4xl mb-4">Reset Password</h1>
                        <p className="hero-subtitle text-lg">Enter your email to receive a password reset link</p>
                    </div>

                    {/* Message Alert */}
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

                    {/* Reset Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                required
                                className="form-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                    <span>Sending Reset Link...</span>
                                </div>
                            ) : (
                                "Send Reset Link"
                            )}
                        </button>
                    </form>

                    {/* Links */}
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

                    {/* Help Section */}
                    <div className="mt-8 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-500/20">
                        <h3 className="text-lg font-bold text-white mb-3 text-center">Need Help?</h3>
                        <div className="space-y-2 text-sm text-gray-300">
                            <p>• Check your spam folder if you don't receive the email</p>
                            <p>• Make sure you're using the email address you registered with</p>
                            <p>• Contact support if you continue having issues</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

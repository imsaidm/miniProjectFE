"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await api.post("/auth/login", formData);
            const { token } = response.data;
            
            localStorage.setItem("token", token);
            router.push("/");
        } catch (error: any) {
            setError(error.response?.data?.message || "Login failed");
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
                        <div className="w-20 h-20 mx-auto mb-6 gradient-primary rounded-3xl flex items-center justify-center shadow-lg">
                            <span className="text-3xl">🔐</span>
                        </div>
                        <h1 className="hero-title text-4xl mb-4">Welcome Back</h1>
                        <p className="hero-subtitle text-lg">Sign in to your amazing account</p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 backdrop-blur-md border border-red-500/20 rounded-2xl">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm">⚠️</span>
                                </div>
                                <p className="text-red-300 font-medium">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Login Form */}
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
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="Enter your email"
                                suppressHydrationWarning
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                required
                                className="form-input"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Enter your password"
                                suppressHydrationWarning
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            suppressHydrationWarning
                        >
                            {loading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                    <span>Signing In...</span>
                                </div>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    {/* Links */}
                    <div className="text-center mt-8 space-y-4">
                        <p className="text-gray-300">
                            Don't have an account?{" "}
                            <Link 
                                href="/auth/register" 
                                className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors duration-300"
                            >
                                Sign up here
                            </Link>
                        </p>
                        <p className="text-gray-300">
                            <Link 
                                href="/auth/forgot-password" 
                                className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors duration-300"
                            >
                                Forgot your password?
                            </Link>
                        </p>
                    </div>

                    {/* Social Login Options */}
                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-gradient-primary text-gray-300 font-medium">Or continue with</span>
                            </div>
                        </div>
                        
                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <button className="glass-button py-3 px-4 flex items-center justify-center space-x-2 hover:bg-white/20 transition-all duration-300" suppressHydrationWarning>
                                <span className="text-xl">🔍</span>
                                <span className="font-medium text-white">Google</span>
                            </button>
                            <button className="glass-button py-3 px-4 flex items-center justify-center space-x-2 hover:bg-white/20 transition-all duration-300" suppressHydrationWarning>
                                <span className="text-xl">📘</span>
                                <span className="font-medium text-white">Facebook</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

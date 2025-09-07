"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "CUSTOMER",
        referralCode: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const initialRole = searchParams.get("role");
        if (initialRole === "ORGANIZER") {
            setFormData(prev => ({ ...prev, role: "ORGANIZER" }));
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await api.post("/auth/register", formData);
            setSuccess("Registration successful! Please check your email to verify your account.");
            
            // Clear form
            setFormData({
                name: "",
                email: "",
                password: "",
                role: "CUSTOMER",
                referralCode: "",
            });
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push("/auth/login");
            }, 3000);
        } catch (error: any) {
            setError(error.response?.data?.message || "Registration failed");
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
            
            <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
                <div className="glass-card w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 mx-auto mb-6 gradient-secondary rounded-3xl flex items-center justify-center shadow-lg">
                            <span className="text-3xl">🚀</span>
                        </div>
                        <h1 className="hero-title text-4xl mb-4">Join EventHub</h1>
                        <p className="hero-subtitle text-lg">Create your amazing account</p>
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

                    {/* Success Alert */}
                    {success && (
                        <div className="mb-6 p-4 bg-green-500/10 backdrop-blur-md border border-green-500/20 rounded-2xl">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm">✅</span>
                                </div>
                                <p className="text-green-300 font-medium">{success}</p>
                            </div>
                        </div>
                    )}

                    {/* Registration Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                required
                                className="form-input"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter your full name"
                                suppressHydrationWarning
                            />
                        </div>

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
                                minLength={6}
                                className="form-input"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Enter your password (min. 6 characters)"
                                suppressHydrationWarning
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                I want to...
                            </label>
                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: "CUSTOMER" })}
                                    className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                                        formData.role === "CUSTOMER"
                                            ? "border-yellow-400 bg-yellow-400/10 backdrop-blur-md"
                                            : "border-white/20 bg-white/5 backdrop-blur-md hover:border-white/40 hover:bg-white/10"
                                    }`}
                                    suppressHydrationWarning
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            formData.role === "CUSTOMER"
                                                ? "bg-yellow-400 text-black"
                                                : "bg-white/10 text-white"
                                        }`}>
                                            <span className="text-lg">🎫</span>
                                        </div>
                                        <div>
                                            <div className={`font-semibold ${
                                                formData.role === "CUSTOMER" ? "text-yellow-400" : "text-white"
                                            }`}>
                                                Attend Amazing Events
                                            </div>
                                            <div className="text-gray-400 text-sm">
                                                Discover and join incredible events
                                            </div>
                                        </div>
                                    </div>
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: "ORGANIZER" })}
                                    className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                                        formData.role === "ORGANIZER"
                                            ? "border-purple-400 bg-purple-400/10 backdrop-blur-md"
                                            : "border-white/20 bg-white/5 backdrop-blur-md hover:border-white/40 hover:bg-white/10"
                                    }`}
                                    suppressHydrationWarning
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            formData.role === "ORGANIZER"
                                                ? "bg-purple-400 text-white"
                                                : "bg-white/10 text-white"
                                        }`}>
                                            <span className="text-lg">🎪</span>
                                        </div>
                                        <div>
                                            <div className={`font-semibold ${
                                                formData.role === "ORGANIZER" ? "text-purple-400" : "text-white"
                                            }`}>
                                                Create & Manage Events
                                            </div>
                                            <div className="text-gray-400 text-sm">
                                                Host and organize amazing events
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="referralCode" className="form-label">
                                Referral Code (Optional)
                            </label>
                            <input
                                type="text"
                                id="referralCode"
                                className="form-input"
                                value={formData.referralCode}
                                onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })}
                                placeholder="Enter referral code if you have one"
                                disabled={formData.role !== "CUSTOMER"}
                                suppressHydrationWarning
                            />
                            <p className="text-xs text-gray-400 mt-2">
                                {formData.role === "CUSTOMER" 
                                    ? "✨ Get bonus points with a referral code" 
                                    : "🎪 Organizers get special privileges"
                                }
                            </p>
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
                                    <span>Creating Account...</span>
                                </div>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    {/* Links */}
                    <div className="text-center mt-8">
                        <p className="text-gray-300">
                            Already have an account?{" "}
                            <Link 
                                href="/auth/login" 
                                className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors duration-300"
                            >
                                Sign in here
                            </Link>
                        </p>
                    </div>

                    {/* Benefits */}
                    <div className="mt-8 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20">
                        <h3 className="text-lg font-bold text-white mb-4 text-center">Why Join EventHub?</h3>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <div className="w-6 h-6 gradient-primary rounded-full flex items-center justify-center">
                                    <span className="text-xs font-bold text-black">✓</span>
                                </div>
                                <span className="text-gray-300 text-sm">Discover amazing events</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-6 h-6 gradient-primary rounded-full flex items-center justify-center">
                                    <span className="text-xs font-bold text-black">✓</span>
                                </div>
                                <span className="text-gray-300 text-sm">Earn points and rewards</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-6 h-6 gradient-primary rounded-full flex items-center justify-center">
                                    <span className="text-xs font-bold text-black">✓</span>
                                </div>
                                <span className="text-gray-300 text-sm">Connect with organizers</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RegisterForm />
        </Suspense>
    );
}

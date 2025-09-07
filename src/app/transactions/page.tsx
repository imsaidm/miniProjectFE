"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Skeleton } from "@/components/Skeleton";
import api from "@/lib/api";
import { isLoggedIn, getRoleFromToken } from "@/lib/auth";

interface Transaction {
    id: number;
    event: {
        id: number;
        title: string;
        startAt: string;
        location: string;
        bannerImage?: string;
        imageUrl?: string;
    };
    status: string;
    totalAmountIDR?: number;
    totalPayableIDR?: number;
    createdAt: string;
    items: TransactionItem[];
}

interface TransactionItem {
    id: number;
    ticketType?: {
        name: string;
        priceIDR: number;
    };
    quantity: number;
    unitPriceIDR: number;
}

export default function TransactionsPage() {
    const router = useRouter();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState("all");

    useEffect(() => {
        if (!isLoggedIn()) {
            router.push("/auth/login");
            return;
        }

        // Check if user is a CUSTOMER
        const userRole = getRoleFromToken();
        if (userRole !== 'CUSTOMER') {
            setError("Only customers can view their transactions. Please log in with a customer account.");
            setLoading(false);
            return;
        }

        const fetchTransactions = async () => {
            try {
                const response = await api.get("/transactions/my");
                setTransactions(response.data || []);
                setError(null);
            } catch (error: any) {
                console.error("Failed to fetch transactions:", error);
                if (error.response?.status === 403) {
                    setError("Access denied. Please make sure you are logged in with a customer account.");
                } else if (error.response?.status === 401) {
                    setError("Your session has expired. Please log in again.");
                    // Redirect to login after a short delay
                    setTimeout(() => router.push("/auth/login"), 2000);
                } else {
                    setError("Failed to load transactions. Please try again later.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [router]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "WAITING_PAYMENT":
                return "border-orange-500 text-orange-400 bg-orange-500/10";
            case "WAITING_ADMIN_CONFIRMATION":
                return "border-blue-500 text-blue-400 bg-blue-500/10";
            case "DONE":
                return "border-green-500 text-green-400 bg-green-500/10";
            case "REJECTED":
                return "border-red-500 text-red-400 bg-red-500/10";
            case "EXPIRED":
                return "border-gray-500 text-gray-400 bg-gray-500/10";
            case "CANCELED":
                return "border-yellow-500 text-yellow-400 bg-yellow-500/10";
            default:
                return "border-gray-500 text-gray-400 bg-gray-500/10";
        }
    };

    // Filter transactions based on active filter
    const filteredTransactions = transactions.filter(transaction => {
        if (activeFilter === "all") return true;
        return transaction.status === activeFilter;
    });

    // Get status counts for tabs
    const getStatusCount = (status: string) => {
        if (status === "all") return transactions.length;
        return transactions.filter(t => t.status === status).length;
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "WAITING_PAYMENT":
                return "⏳ Waiting for Payment";
            case "WAITING_ADMIN_CONFIRMATION":
                return "🔍 Admin Review";
            case "DONE":
                return "✅ Completed";
            case "REJECTED":
                return "❌ Rejected";
            case "CANCELED":
                return "🚫 Canceled";
            case "EXPIRED":
                return "⏰ Expired";
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-primary">
                <Navbar />
                <div className="container-section">
                    <div className="text-center mb-12">
                        <div className="h-16 bg-white/10 backdrop-blur-md rounded-2xl w-1/3 mx-auto mb-6 animate-pulse"></div>
                        <div className="h-6 bg-white/10 backdrop-blur-md rounded w-1/2 mx-auto mb-8 animate-pulse"></div>
                    </div>
                    <div className="space-y-6">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-32 bg-white/10 backdrop-blur-md rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-primary">
                <Navbar />
                <div className="container-section">
                    <div className="text-center">
                        <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                            <span className="text-6xl">⚠️</span>
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-4">Access Error</h1>
                        <p className="text-gray-300 text-xl mb-8">{error}</p>
                        <button
                            onClick={() => router.push("/auth/login")}
                            className="btn-primary"
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-primary">
            <Navbar />
            
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
                    <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
                </div>

                <div className="relative z-10 container-hero">
                    <div className="text-center mb-16">
                        <div className="hero-badge mb-8">
                            <span className="text-yellow-400 mr-3">🎫</span>
                            <span className="text-white text-lg font-medium">My Transactions</span>
                        </div>
                        
                        <h1 className="hero-title text-5xl md:text-6xl mb-6">
                            <span className="text-gradient">My Transactions</span>
                        </h1>
                        
                        <p className="hero-subtitle text-xl md:text-2xl max-w-3xl mx-auto">
                            Manage your event bookings, track payments, and access your tickets
                        </p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="mb-8">
                        <div className="flex flex-wrap justify-center gap-3">
                            {[
                                { key: "all", label: "All Transactions", icon: "📋", color: "from-blue-500 to-purple-500" },
                                { key: "WAITING_PAYMENT", label: "Pending Payment", icon: "⏰", color: "from-orange-500 to-red-500" },
                                { key: "WAITING_ADMIN_CONFIRMATION", label: "Under Review", icon: "⏳", color: "from-blue-500 to-cyan-500" },
                                { key: "DONE", label: "Confirmed", icon: "✅", color: "from-green-500 to-emerald-500" },
                                { key: "REJECTED", label: "Rejected", icon: "❌", color: "from-red-500 to-pink-500" },
                                { key: "EXPIRED", label: "Expired", icon: "⏰", color: "from-gray-500 to-slate-500" }
                            ].map((filter) => (
                                <button
                                    key={filter.key}
                                    onClick={() => setActiveFilter(filter.key)}
                                    className={`group relative px-6 py-3 rounded-2xl font-semibold transition-all duration-500 flex items-center space-x-3 ${
                                        activeFilter === filter.key
                                            ? `bg-gradient-to-r ${filter.color} text-white shadow-2xl scale-105 transform`
                                            : "bg-white/10 backdrop-blur-md text-gray-300 hover:bg-white/20 hover:text-white hover:scale-105 hover:shadow-lg"
                                    }`}
                                >
                                    <span className="text-xl group-hover:scale-110 transition-transform duration-300">{filter.icon}</span>
                                    <span className="font-medium">{filter.label}</span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                        activeFilter === filter.key
                                            ? "bg-white/20 text-white"
                                            : "bg-white/10 text-gray-400 group-hover:bg-white/20 group-hover:text-white"
                                    } transition-all duration-300`}>
                                        {getStatusCount(filter.key)}
                                    </span>
                                    {activeFilter === filter.key && (
                                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Statistics */}
            <div className="container-section mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="glass-card p-6 text-center hover:scale-105 transition-transform duration-300">
                        <div className="text-3xl mb-2">📊</div>
                        <div className="text-2xl font-bold text-white mb-1">{transactions.length}</div>
                        <div className="text-gray-400 text-sm">Total Transactions</div>
                    </div>
                    <div className="glass-card p-6 text-center hover:scale-105 transition-transform duration-300">
                        <div className="text-3xl mb-2">⏰</div>
                        <div className="text-2xl font-bold text-orange-400 mb-1">{getStatusCount("WAITING_PAYMENT")}</div>
                        <div className="text-gray-400 text-sm">Pending Payment</div>
                    </div>
                    <div className="glass-card p-6 text-center hover:scale-105 transition-transform duration-300">
                        <div className="text-3xl mb-2">✅</div>
                        <div className="text-2xl font-bold text-green-400 mb-1">{getStatusCount("DONE")}</div>
                        <div className="text-gray-400 text-sm">Confirmed Tickets</div>
                    </div>
                    <div className="glass-card p-6 text-center hover:scale-105 transition-transform duration-300">
                        <div className="text-3xl mb-2">🎫</div>
                        <div className="text-2xl font-bold text-blue-400 mb-1">
                            {transactions.reduce((sum, t) => sum + t.items.reduce((s, i) => s + i.quantity, 0), 0)}
                        </div>
                        <div className="text-gray-400 text-sm">Total Tickets</div>
                    </div>
                </div>
            </div>

            <div className="container-section">
                {filteredTransactions.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-40 h-40 mx-auto mb-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                            <span className="text-6xl">🎫</span>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">
                            {activeFilter === "all" 
                                ? "No Transactions Yet" 
                                : activeFilter === "DONE" 
                                    ? "No Completed Tickets"
                                    : activeFilter === "WAITING_PAYMENT"
                                        ? "No Pending Payments"
                                        : activeFilter === "WAITING_ADMIN_CONFIRMATION"
                                            ? "No Transactions Under Review"
                                            : activeFilter === "REJECTED"
                                                ? "No Rejected Transactions"
                                                : activeFilter === "EXPIRED"
                                                    ? "No Expired Transactions"
                                                    : "No Transactions Found"
                            }
                        </h2>
                        <p className="text-gray-300 text-xl mb-8">
                            {activeFilter === "all" 
                                ? "You haven't made any bookings yet. Start exploring amazing events!"
                                : `No ${activeFilter === "DONE" ? "completed tickets" : activeFilter === "WAITING_PAYMENT" ? "pending payments" : activeFilter === "WAITING_ADMIN_CONFIRMATION" ? "transactions under review" : activeFilter === "REJECTED" ? "rejected transactions" : activeFilter === "EXPIRED" ? "expired transactions" : "transactions"} found.`
                            }
                        </p>
                        <button
                            onClick={() => router.push("/events")}
                            className="btn-primary"
                        >
                            Browse Events
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredTransactions.map((transaction) => (
                            <div key={transaction.id} className="glass-card group hover:bg-white/10 transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]">
                                <div className="flex flex-col lg:flex-row gap-6">
                                    {/* Event Image */}
                                    <div className="relative w-full lg:w-48 h-48 rounded-2xl overflow-hidden flex-shrink-0">
                                        {transaction.event.bannerImage || transaction.event.imageUrl ? (
                                            <img
                                                src={(transaction.event.bannerImage || transaction.event.imageUrl) as string}
                                                alt={transaction.event.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                                <span className="text-4xl">🎪</span>
                                            </div>
                                        )}
                                        
                                        {/* Status Badge */}
                                        <div className="absolute top-4 right-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md ${getStatusColor(transaction.status)}`}>
                                                {getStatusText(transaction.status)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Transaction Details */}
                                    <div className="flex-1 space-y-4">
                                        {/* Transaction Status */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-lg">📋</span>
                                                <span className="text-white font-semibold">Transaction #{transaction.id}</span>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                transaction.status === "WAITING_PAYMENT" 
                                                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                                                    : transaction.status === "WAITING_ADMIN_CONFIRMATION"
                                                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                                    : transaction.status === "DONE"
                                                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                                    : transaction.status === "REJECTED"
                                                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                                    : transaction.status === "EXPIRED"
                                                    ? "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                                                    : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                            }`}>
                                                {transaction.status === "WAITING_PAYMENT" && "⏰ Waiting for Payment"}
                                                {transaction.status === "WAITING_ADMIN_CONFIRMATION" && "⏳ Admin Review"}
                                                {transaction.status === "DONE" && "✅ Confirmed"}
                                                {transaction.status === "REJECTED" && "❌ Rejected"}
                                                {transaction.status === "EXPIRED" && "⏰ Expired"}
                                                {transaction.status === "CANCELED" && "🚫 Canceled"}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors duration-300">
                                                {transaction.event.title}
                                            </h3>
                                            <div className="flex flex-wrap gap-4 text-gray-300">
                                                <div className="flex items-center">
                                                    <span className="mr-2">📍</span>
                                                    <span>{transaction.event.location}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="mr-2">📅</span>
                                                    <span>
                                                        {new Date(transaction.event.startAt).toLocaleDateString('en-US', {
                                                            weekday: 'short',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="mr-2">🕒</span>
                                                    <span>
                                                        Booked on {new Date(transaction.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Ticket Items */}
                                        <div className="space-y-3">
                                            <h4 className="text-lg font-semibold text-white">Tickets:</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {transaction.items.map((item) => (
                                                    <div key={item.id} className="p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <p className="text-white font-medium">
                                                                    {item.ticketType?.name || 'General Ticket'}
                                                                </p>
                                                                <p className="text-gray-400 text-sm">
                                                                    {item.quantity} x IDR {item.unitPriceIDR.toLocaleString('id-ID')}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-yellow-400 font-bold">
                                                                    IDR {(item.quantity * item.unitPriceIDR).toLocaleString('id-ID')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Total Amount */}
                                        <div className="flex justify-between items-center pt-4 border-t border-white/10">
                                            <div>
                                                <p className="text-gray-300">Total Amount:</p>
                                                {transaction.totalPayableIDR && transaction.totalPayableIDR !== transaction.totalAmountIDR && (
                                                    <p className="text-gray-400 text-sm line-through">
                                                        IDR {transaction.totalAmountIDR?.toLocaleString('id-ID')}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-yellow-400">
                                                    IDR {transaction.totalPayableIDR?.toLocaleString('id-ID') || transaction.totalAmountIDR?.toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-wrap gap-3 pt-4">
                                            <button
                                                onClick={() => router.push(`/transactions/${transaction.id}`)}
                                                className="btn-primary px-6 py-2"
                                            >
                                                View Details
                                            </button>
                                            {transaction.status === "WAITING_PAYMENT" && (
                                                <button
                                                    onClick={() => router.push(`/transactions/${transaction.id}/payment-proof`)}
                                                    className="btn-success px-6 py-2"
                                                >
                                                    Pay Now
                                                </button>
                                            )}
                                            {transaction.status === "DONE" && (
                                                <div className="w-full">
                                                    <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-2xl">🎫</span>
                                                                <span className="text-green-400 font-semibold">Ticket Confirmed</span>
                                                            </div>
                                                            <span className="text-green-400 text-sm font-medium">
                                                                ✓ Payment Verified
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-gray-400">Event:</span>
                                                                <span className="text-white font-medium">{transaction.event.title}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-gray-400">Date:</span>
                                                                <span className="text-white font-medium">
                                                                    {new Date(transaction.event.startAt).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-gray-400">Time:</span>
                                                                <span className="text-white font-medium">
                                                                    {new Date(transaction.event.startAt).toLocaleTimeString('en-US', {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-gray-400">Location:</span>
                                                                <span className="text-white font-medium">{transaction.event.location}</span>
                                                            </div>
                                                        </div>
                                                        <div className="mt-3 pt-3 border-t border-green-500/20">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-gray-400 text-sm">Total Tickets:</span>
                                                                <span className="text-green-400 font-bold">
                                                                    {transaction.items.reduce((sum, item) => sum + item.quantity, 0)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 mt-3">
                                                        <button
                                                            onClick={() => router.push(`/events/${transaction.event.id}`)}
                                                            className="btn-secondary px-4 py-2 text-sm"
                                                        >
                                                            📍 View Event Details
                                                        </button>
                                                        <button
                                                            onClick={() => window.print()}
                                                            className="btn-primary px-4 py-2 text-sm"
                                                        >
                                                            🖨️ Print Ticket
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {transaction.status === "REJECTED" && (
                                                <div className="w-full">
                                                    <div className="p-4 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-xl border border-red-500/20">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-2xl">❌</span>
                                                                <span className="text-red-400 font-semibold">Payment Rejected</span>
                                                            </div>
                                                            <span className="text-red-400 text-sm font-medium">
                                                                ⚠️ Contact Support
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-300 text-sm mb-3">
                                                            Your payment was not accepted. Please contact customer support for assistance.
                                                        </p>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => router.push(`/events/${transaction.event.id}`)}
                                                                className="btn-secondary px-4 py-2 text-sm"
                                                            >
                                                                📍 View Event Details
                                                            </button>
                                                            <button
                                                                onClick={() => router.push(`/events/${transaction.event.id}`)}
                                                                className="btn-primary px-4 py-2 text-sm"
                                                            >
                                                                🔄 Try Again
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {transaction.status === "EXPIRED" && (
                                                <div className="w-full">
                                                    <div className="p-4 bg-gradient-to-r from-gray-500/10 to-slate-500/10 rounded-xl border border-gray-500/20">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-2xl">⏰</span>
                                                                <span className="text-gray-400 font-semibold">Payment Expired</span>
                                                            </div>
                                                            <span className="text-gray-400 text-sm font-medium">
                                                                ⏰ Time Expired
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-300 text-sm mb-3">
                                                            Payment time has expired. You can try booking again if seats are still available.
                                                        </p>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => router.push(`/events/${transaction.event.id}`)}
                                                                className="btn-primary px-4 py-2 text-sm"
                                                            >
                                                                🔄 Book Again
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

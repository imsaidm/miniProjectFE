"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Skeleton } from "@/components/Skeleton";
import ConfirmDialog from "@/components/ConfirmDialog";
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
    subtotalIDR?: number;
    discountVoucherIDR?: number;
    discountCouponIDR?: number;
    pointsUsed?: number;
    createdAt: string;
    paymentDueAt?: string;
    items: TransactionItem[];
    paymentProof?: {
        id: number;
        imageUrl: string;
        createdAt: string;
    };
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

export default function TransactionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const transactionId = params.id as string;
    
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!isLoggedIn()) {
            router.push("/auth/login");
            return;
        }

        const fetchTransaction = async () => {
            try {
                const response = await api.get(`/transactions/${transactionId}`);
                setTransaction(response.data);
                setError(null);
            } catch (error: any) {
                console.error("Failed to fetch transaction:", error);
                if (error.response?.status === 404) {
                    setError("Transaction not found");
                } else if (error.response?.status === 403) {
                    setError("You don't have permission to view this transaction");
                } else {
                    setError("Failed to load transaction details");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchTransaction();
    }, [transactionId, router]);

    const handleCancel = async () => {
        if (!transaction) return;
        setProcessing(true);
        try {
            await api.patch(`/transactions/${transaction.id}/cancel`);
            setShowCancelDialog(false);
            // Refresh details to reflect canceled status
            const res = await api.get(`/transactions/${transaction.id}`);
            setTransaction(res.data);
        } catch (e: any) {
            alert(e?.response?.data?.message || 'Failed to cancel transaction');
        } finally {
            setProcessing(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "WAITING_PAYMENT":
                return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
            case "WAITING_ADMIN_CONFIRMATION":
                return "bg-blue-500/20 text-blue-300 border-blue-500/30";
            case "DONE":
                return "bg-green-500/20 text-green-300 border-green-500/30";
            case "REJECTED":
                return "bg-red-500/20 text-red-300 border-red-500/30";
            case "CANCELED":
                return "bg-gray-500/20 text-gray-300 border-gray-500/30";
            case "EXPIRED":
                return "bg-orange-500/20 text-orange-300 border-orange-500/30";
            default:
                return "bg-gray-500/20 text-gray-300 border-gray-500/30";
        }
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
                    <div className="max-w-4xl mx-auto">
                        <div className="space-y-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-32 bg-white/10 backdrop-blur-md rounded-2xl animate-pulse"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !transaction) {
        return (
            <div className="min-h-screen bg-gradient-primary">
                <Navbar />
                <div className="container-section">
                    <div className="text-center">
                        <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                            <span className="text-6xl">⚠️</span>
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-4">Transaction Not Found</h1>
                        <p className="text-gray-300 text-xl mb-8">{error || "The transaction you're looking for doesn't exist."}</p>
                        <button
                            onClick={() => router.push("/transactions")}
                            className="btn-primary"
                        >
                            Back to Transactions
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
                            <span className="text-white text-lg font-medium">Transaction Details</span>
                        </div>
                        
                        <h1 className="hero-title text-5xl md:text-6xl mb-6">
                            <span className="text-gradient">Order #{transaction.id}</span>
                        </h1>
                        
                        <p className="hero-subtitle text-xl md:text-2xl max-w-3xl mx-auto">
                            View your transaction details and payment status
                        </p>
                    </div>
                </div>
            </div>

            <div className="container-section">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Transaction Details */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Event Information */}
                            <div className="glass-card">
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                                    <span className="mr-3">🎪</span>
                                    Event Information
                                </h2>
                                
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Event Image */}
                                    <div className="relative w-full md:w-48 h-48 rounded-2xl overflow-hidden flex-shrink-0">
                                        {transaction.event.bannerImage || transaction.event.imageUrl ? (
                                            <img
                                                src={(transaction.event.bannerImage || transaction.event.imageUrl) as string}
                                                alt={transaction.event.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                                <span className="text-4xl">🎪</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Event Details */}
                                    <div className="flex-1 space-y-4">
                                        <h3 className="text-2xl font-bold text-white">{transaction.event.title}</h3>
                                        
                                        <div className="space-y-3">
                                            <div className="flex items-center text-gray-300">
                                                <span className="mr-3 text-xl">📍</span>
                                                <span className="font-medium">{transaction.event.location}</span>
                                            </div>
                                            <div className="flex items-center text-gray-300">
                                                <span className="mr-3 text-xl">📅</span>
                                                <span className="font-medium">
                                                    {new Date(transaction.event.startAt).toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-gray-300">
                                                <span className="mr-3 text-xl">🕒</span>
                                                <span className="font-medium">
                                                    {new Date(transaction.event.startAt).toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ticket Details */}
                            <div className="glass-card">
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                                    <span className="mr-3">🎫</span>
                                    Ticket Details
                                </h2>
                                
                                <div className="space-y-4">
                                    {transaction.items.map((item) => (
                                        <div key={item.id} className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h4 className="text-lg font-semibold text-white">
                                                        {item.ticketType?.name || 'General Ticket'}
                                                    </h4>
                                                    <p className="text-gray-400">
                                                        {item.quantity} x IDR {item.unitPriceIDR.toLocaleString('id-ID')}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-yellow-400 font-bold text-xl">
                                                        IDR {(item.quantity * item.unitPriceIDR).toLocaleString('id-ID')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Proof */}
                            {transaction.paymentProof && (
                                <div className="glass-card">
                                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                                        <span className="mr-3">📸</span>
                                        Payment Proof
                                    </h2>
                                    
                                    <div className="space-y-4">
                                        <div className="relative w-full max-w-md h-64 rounded-2xl overflow-hidden">
                                            <img
                                                src={transaction.paymentProof.imageUrl}
                                                alt="Payment Proof"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <p className="text-gray-400 text-sm">
                                            Uploaded on {new Date(transaction.paymentProof.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="glass-card sticky top-8">
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                                    <span className="mr-3">📋</span>
                                    Order Summary
                                </h2>

                                {/* Status */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-300">Status:</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(transaction.status)}`}>
                                            {getStatusText(transaction.status)}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-sm">
                                        Order placed on {new Date(transaction.createdAt).toLocaleDateString()}
                                    </p>
                                </div>

                                {/* Price Breakdown */}
                                <div className="space-y-3 border-t border-white/10 pt-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">Subtotal:</span>
                                        <span className="text-white">IDR {transaction.subtotalIDR?.toLocaleString('id-ID')}</span>
                                    </div>
                                    
                                    {transaction.discountVoucherIDR && transaction.discountVoucherIDR > 0 && (
                                        <div className="flex justify-between text-green-400">
                                            <span>Voucher Discount:</span>
                                            <span>-IDR {transaction.discountVoucherIDR.toLocaleString('id-ID')}</span>
                                        </div>
                                    )}
                                    
                                    {transaction.discountCouponIDR && transaction.discountCouponIDR > 0 && (
                                        <div className="flex justify-between text-green-400">
                                            <span>Coupon Discount:</span>
                                            <span>-IDR {transaction.discountCouponIDR.toLocaleString('id-ID')}</span>
                                        </div>
                                    )}
                                    
                                    {transaction.pointsUsed && transaction.pointsUsed > 0 && (
                                        <div className="flex justify-between text-green-400">
                                            <span>Points Used:</span>
                                            <span>-IDR {transaction.pointsUsed.toLocaleString('id-ID')}</span>
                                        </div>
                                    )}
                                    
                                    <div className="border-t border-white/10 pt-3">
                                        <div className="flex justify-between">
                                            <span className="text-xl font-bold text-white">Total:</span>
                                            <span className="text-2xl font-bold text-yellow-400">
                                                IDR {transaction.totalPayableIDR?.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-6 space-y-3">
                                    {transaction.status === "WAITING_PAYMENT" && (
                                        <button
                                            onClick={() => router.push(`/transactions/${transaction.id}/payment-proof`)}
                                            className="btn-primary w-full py-3"
                                        >
                                            Upload Payment Proof
                                        </button>
                                    )}
                                    {transaction.status === "WAITING_PAYMENT" && (
                                        <button
                                            onClick={() => setShowCancelDialog(true)}
                                            className="w-full py-3 bg-red-500/10 backdrop-blur-md border border-red-500/20 text-red-300 font-semibold rounded-2xl hover:bg-red-500/20 transition-all duration-300"
                                        >
                                            Cancel Transaction
                                        </button>
                                    )}
                                    
                                    <button
                                        onClick={() => router.push(`/events/${transaction.event.id}`)}
                                        className="btn-secondary w-full py-3"
                                    >
                                        View Event
                                    </button>
                                    
                                    <button
                                        onClick={() => router.push("/transactions")}
                                        className="w-full py-3 bg-white/5 backdrop-blur-md border border-white/10 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all duration-300"
                                    >
                                        Back to Transactions
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        {/* Cancel Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showCancelDialog}
          onClose={() => setShowCancelDialog(false)}
          onConfirm={handleCancel}
          title="Cancel Transaction"
          message="Are you sure you want to cancel this transaction? Reserved seats and any applied coupon/points will be restored."
          confirmText={processing ? "Cancelling..." : "Yes, Cancel"}
          cancelText="Keep Transaction"
          type="danger"
        />
      </div>
  );
}

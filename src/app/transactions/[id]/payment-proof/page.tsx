"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Skeleton } from "@/components/Skeleton";
import api from "@/lib/api";
import { isLoggedIn, getRoleFromToken } from "@/lib/auth";

interface Transaction {
  id: number;
  status: string;
  totalPayableIDR: number;
  totalAmountIDR?: number;
  paymentDueAt: string;
  event: {
    title: string;
  };
  paymentProof?: {
    imageUrl: string;
  };
}

export default function PaymentProofPage() {
  const params = useParams();
  const router = useRouter();
  const transactionId = params.id as string;
  
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/auth/login");
      return;
    }

    const userRole = getRoleFromToken();
    if (userRole !== 'CUSTOMER') {
      alert("Only customers can upload payment proof.");
      router.push("/auth/login");
      return;
    }

    const fetchTransaction = async () => {
      try {
        const response = await api.get(`/transactions/${transactionId}`);
        setTransaction(response.data);
        
        // Calculate countdown
        if (response.data.paymentDueAt) {
          const dueDate = new Date(response.data.paymentDueAt);
          const now = new Date();
          const timeLeft = Math.max(0, Math.floor((dueDate.getTime() - now.getTime()) / 1000));
          setCountdown(timeLeft);
        }
      } catch (error: any) {
        console.error("Failed to fetch transaction:", error);
        if (error.response?.status === 404) {
          alert("Transaction not found.");
        } else {
          alert("Failed to load transaction data.");
        }
        router.push("/transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [transactionId, router]);

  useEffect(() => {
    if (countdown <= 0) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("File size must be less than 5MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please select a file to upload");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('paymentProof', selectedFile);

      await api.post(`/transactions/${transactionId}/payment-proof`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert("Payment proof uploaded successfully!");
      router.push("/transactions");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to upload payment proof");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-12">
            <div className="h-16 bg-white/10 backdrop-blur-md rounded-2xl w-1/3 mx-auto animate-pulse"></div>
            
            {/* Transaction Info Skeleton */}
            <div className="h-40 bg-white/10 backdrop-blur-md rounded-3xl animate-pulse border border-white/10"></div>
            
            {/* Payment Timer Skeleton */}
            <div className="h-32 bg-white/10 backdrop-blur-md rounded-3xl animate-pulse border border-white/10"></div>
            
            {/* Upload Form Skeleton */}
            <div className="h-64 bg-white/10 backdrop-blur-md rounded-3xl animate-pulse border border-white/10"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
            <span className="text-6xl">❌</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Transaction Not Found</h1>
          <p className="text-gray-300 text-lg mb-8">The transaction you're looking for doesn't exist.</p>
          <button 
            onClick={() => router.push("/transactions")} 
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-semibold"
          >
            Back to My Transactions
          </button>
        </div>
      </div>
    );
  }

  // Check if payment proof already exists
  if (transaction.paymentProof) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                Payment Proof
              </span>
              <br />
              <span className="text-white">Already Submitted</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Your payment proof has been uploaded and is being reviewed by the event organizer.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center">
                <span className="text-4xl">✅</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Payment Proof Submitted</h2>
              <p className="text-gray-300 mb-6">
                Your payment proof has been uploaded and is being reviewed by the event organizer.
              </p>
              
              {transaction.paymentProof.imageUrl && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Uploaded Proof:</h3>
                  <img 
                    src={transaction.paymentProof.imageUrl} 
                    alt="Payment Proof" 
                    className="max-w-full h-auto rounded-lg border border-white/10"
                  />
                </div>
              )}
              
              <button 
                onClick={() => router.push("/transactions")} 
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-semibold"
              >
                Back to My Transactions
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if time has expired
  if (countdown === 0 && (transaction.status === 'WAITING_PAYMENT' || transaction.status === 'PENDING_PAYMENT')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
                Payment Time
              </span>
              <br />
              <span className="text-white">Expired</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              The payment deadline has passed and your transaction has been automatically cancelled.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full flex items-center justify-center">
                <span className="text-4xl">⏰</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Payment Deadline Expired</h2>
              <p className="text-gray-300 mb-6">
                The 2-hour payment window has expired. Your transaction has been automatically cancelled.
              </p>
              
              <button 
                onClick={() => router.push("/transactions")} 
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-semibold"
              >
                Back to My Transactions
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8">
              <span className="text-yellow-400 mr-3">💳</span>
              <span className="text-white text-lg font-medium">Payment Proof</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                Upload Payment
              </span>
              <br />
              <span className="text-white">Proof</span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Complete your transaction by uploading your payment proof within the time limit.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Transaction Info */}
        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 mb-8 hover:bg-white/10 transition-all duration-500">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
              📋
            </span>
            Transaction Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
                <span className="text-gray-300">Event:</span>
                <span className="font-semibold text-white">{transaction.event.title}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
                <span className="text-gray-300">Status:</span>
                <span className="font-semibold text-white">{transaction.status}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
                <span className="text-gray-300">Amount:</span>
                <span className="font-bold text-2xl text-yellow-400">
                  IDR {(transaction.totalPayableIDR || transaction.totalAmountIDR || 0).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Timer */}
        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 mb-8 text-center hover:bg-white/10 transition-all duration-500">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center justify-center">
            <span className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
              ⏰
            </span>
            Payment Timer
          </h2>
          <div className="text-6xl font-mono font-bold text-yellow-400 mb-4 drop-shadow-lg">
            {formatTime(countdown)}
          </div>
          <p className="text-gray-300 text-lg">Complete your payment within this time</p>
          
          {/* Progress Bar */}
          <div className="mt-6 w-full bg-white/10 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-400 to-red-500 rounded-full transition-all duration-1000"
              style={{ width: `${(countdown / 7200) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Upload Form */}
        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-500">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
              📤
            </span>
            Upload Payment Proof
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-white font-semibold text-lg">Payment Proof Image *</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-500 file:to-pink-500 file:text-white hover:file:from-purple-600 hover:file:to-pink-600 transition-all duration-300"
                  required
                />
              </div>
              <p className="text-sm text-gray-400 mt-2">
                Upload a screenshot or photo of your payment confirmation. Maximum file size: 5MB
              </p>
            </div>

            <div className="text-center pt-4">
              <button
                type="submit"
                disabled={uploading || !selectedFile || countdown === 0}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                {uploading ? (
                  <>
                    <div className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Uploading...
                  </>
                ) : countdown === 0 ? (
                  "Time Expired"
                ) : (
                  "Upload Payment Proof"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

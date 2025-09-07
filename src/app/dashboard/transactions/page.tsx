"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import RouteProtection from "@/components/RouteProtection";
import ConfirmDialog from "@/components/ConfirmDialog";
import api from "@/lib/api";

interface Transaction {
  id: number;
  status: 'WAITING_PAYMENT' | 'WAITING_ADMIN_CONFIRMATION' | 'DONE' | 'REJECTED' | 'EXPIRED' | 'CANCELED';
  createdAt: string;
  updatedAt: string;
  paymentDueAt: string;
  organizerDecisionBy?: string;
  subtotalIDR: number;
  discountVoucherIDR: number;
  discountCouponIDR: number;
  pointsUsed: number;
  totalPayableIDR: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  event: {
    id: number;
    title: string;
  };
  items: TransactionItem[];
  paymentProof?: {
    id: number;
    imageUrl: string;
    uploadedAt: string;
  };
}

interface TransactionItem {
  id: number;
  quantity: number;
  unitPriceIDR: number;
  ticketType: {
    id: number;
    name: string;
  };
}

function TransactionsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingTransaction, setProcessingTransaction] = useState<number | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState<{ isOpen: boolean; transactionId: number | null }>({
    isOpen: false,
    transactionId: null
  });
  const [rejectReason, setRejectReason] = useState('');
  const [showAcceptDialog, setShowAcceptDialog] = useState<{ isOpen: boolean; transactionId: number | null }>({
    isOpen: false,
    transactionId: null
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Get filter values from URL
  const filterStatus = searchParams.get('status') || '';
  const searchTerm = searchParams.get('search') || '';
  const eventIdFilter = useMemo(() => {
    const id = searchParams.get('eventId');
    const n = id ? Number(id) : NaN;
    return Number.isFinite(n) ? n : null;
  }, [searchParams]);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Function to update URL with new filter values
  const updateURL = (newFilters: { search?: string; status?: string; eventId?: number | null }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newFilters.search !== undefined) {
      if (newFilters.search) {
        params.set('search', newFilters.search);
      } else {
        params.delete('search');
      }
    }
    
    if (newFilters.status !== undefined) {
      if (newFilters.status) {
        params.set('status', newFilters.status);
      } else {
        params.delete('status');
      }
    }
    
    if (newFilters.eventId !== undefined) {
      if (newFilters.eventId) {
        params.set('eventId', String(newFilters.eventId));
      } else {
        params.delete('eventId');
      }
    }
    
    const newURL = params.toString() ? `?${params.toString()}` : window.location.pathname;
    router.replace(newURL, { scroll: false });
  };

  // Handlers for filter changes
  const handleSearchChange = (value: string) => {
    updateURL({ search: value });
  };

  const handleStatusChange = (value: string) => {
    updateURL({ status: value });
  };

  const handleClearFilters = () => {
    updateURL({ search: '', status: '', eventId: null });
  };

  useEffect(() => {
    fetchTransactions();
  }, [debouncedSearch, filterStatus, eventIdFilter]);

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (filterStatus) params.append('status', filterStatus);
      if (eventIdFilter) params.append('eventId', String(eventIdFilter));
      
      const response = await api.get(`/transactions/organizer?${params.toString()}`);
      setTransactions(response.data || []);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTransaction = async (transactionId: number) => {
    setProcessingTransaction(transactionId);
    
    try {
      await api.patch(`/transactions/${transactionId}/accept`);
      await fetchTransactions();
      alert('Transaction accepted successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to accept transaction');
    } finally {
      setProcessingTransaction(null);
    }
  };

  const confirmAcceptTransaction = async () => {
    if (!showAcceptDialog.transactionId) return;
    await handleAcceptTransaction(showAcceptDialog.transactionId);
    setShowAcceptDialog({ isOpen: false, transactionId: null });
  };

  const handleRejectTransaction = async () => {
    if (!showRejectDialog.transactionId) return;
    
    setProcessingTransaction(showRejectDialog.transactionId);
    
    try {
      await api.patch(`/transactions/${showRejectDialog.transactionId}/reject`, {
        reason: rejectReason || 'Payment proof rejected by organizer'
      });
      await fetchTransactions();
      alert('Transaction rejected successfully!');
      setShowRejectDialog({ isOpen: false, transactionId: null });
      setRejectReason('');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to reject transaction');
    } finally {
      setProcessingTransaction(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      WAITING_PAYMENT: { color: 'bg-yellow-100 text-yellow-800', text: 'Waiting Payment' },
      WAITING_ADMIN_CONFIRMATION: { color: 'bg-blue-100 text-blue-800', text: 'Pending Review' },
      DONE: { color: 'bg-green-100 text-green-800', text: 'Completed' },
      REJECTED: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
      EXPIRED: { color: 'bg-gray-100 text-gray-800', text: 'Expired' },
      CANCELED: { color: 'bg-gray-100 text-gray-800', text: 'Canceled' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.WAITING_PAYMENT;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return `IDR ${amount.toLocaleString('id-ID')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-primary">
        <Navbar />
        <div className="container-hero">
          <div className="text-center">
            <div className="h-20 bg-white/10 backdrop-blur-md rounded animate-pulse w-1/3 mx-auto mb-6"></div>
            <div className="h-6 bg-white/10 backdrop-blur-md rounded animate-pulse w-1/2 mx-auto mb-8"></div>
          </div>
        </div>
      </div>
    );
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.user.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                         transaction.event.title.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesStatus = !filterStatus || transaction.status === filterStatus;
    const matchesEvent = !eventIdFilter || transaction.event.id === eventIdFilter;
    
    return matchesSearch && matchesStatus && matchesEvent;
  });

  return (
    <RouteProtection requiredRole="ORGANIZER">
      <div className="min-h-screen bg-gradient-primary">
        <Navbar />

        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
          </div>

          <div className="relative z-10 container-hero">
            <div className="text-center mb-16">
              <div className="hero-badge mb-8">
                <span className="text-yellow-400 mr-3">💳</span>
                <span className="text-white text-lg font-medium">Transaction Management</span>
              </div>
              <h1 className="hero-title text-5xl md:text-6xl mb-6">
                <span className="text-gradient">Manage Payments</span>
              </h1>
              <p className="hero-subtitle text-xl md:text-2xl max-w-3xl mx-auto">
                Review payment proofs and accept or reject transactions with confidence
              </p>
            </div>
          </div>
        </div>

        <div className="container-section">
          {/* Filters and Search */}
          <div className="glass-card mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="form-label">Search Transactions</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by customer name or event title..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="form-input pl-10 w-full"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <label className="form-label">Filter by Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="form-select w-full"
                >
                  <option value="">All Statuses</option>
                  <option value="WAITING_PAYMENT">Waiting Payment</option>
                  <option value="WAITING_ADMIN_CONFIRMATION">Pending Review</option>
                  <option value="DONE">Completed</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="CANCELED">Canceled</option>
                </select>
              </div>
            </div>
          </div>



          {/* Results Summary */}
          <div className="text-center mb-6">
            <p className="text-gray-300 text-lg">
              {filteredTransactions.length === 0 ? "No transactions found" : 
               `Found ${filteredTransactions.length} transaction${filteredTransactions.length !== 1 ? 's' : ''} matching your criteria`}
            </p>
          </div>

          {/* Transactions List */}
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                <span className="text-6xl">📋</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">No Transactions Found</h3>
              <p className="text-gray-300 text-lg mb-6 max-w-md mx-auto">
                Try adjusting your search terms or filters to find more transactions.
              </p>
              <button 
                onClick={handleClearFilters}
                className="btn-secondary"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="glass-card">
                  {/* Transaction Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 pb-4 border-b border-white/10">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          Transaction #{transaction.id}
                        </h3>
                        {getStatusBadge(transaction.status)}
                      </div>
                      <div className="text-sm text-gray-400">
                        Created: {formatDate(transaction.createdAt)}
                        {transaction.updatedAt !== transaction.createdAt && 
                         ` • Updated: ${formatDate(transaction.updatedAt)}`}
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 text-right">
                      <div className="text-2xl font-bold text-white">
                        {formatCurrency(transaction.totalPayableIDR)}
                      </div>
                      <div className="text-sm text-gray-400">
                        Total Payable
                      </div>
                    </div>
                  </div>

                  {/* Customer and Event Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2">Customer Information</h4>
                      <div className="space-y-1 text-sm">
                        <div className="text-gray-300"><span className="font-medium">Name:</span> {transaction.user.name}</div>
                        <div className="text-gray-300"><span className="font-medium">Email:</span> {transaction.user.email}</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-white mb-2">Event Information</h4>
                      <div className="space-y-1 text-sm">
                        <div className="text-gray-300"><span className="font-medium">Event:</span> {transaction.event.title}</div>
                        <div className="text-gray-300"><span className="font-medium">Event ID:</span> #{transaction.event.id}</div>
                      </div>
                    </div>
                  </div>

                  {/* Transaction Details */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-white mb-2">Transaction Details</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-300">Subtotal:</span>
                        <div className="text-white">{formatCurrency(transaction.subtotalIDR)}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-300">Voucher Discount:</span>
                        <div className="text-white">{formatCurrency(transaction.discountVoucherIDR)}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-300">Coupon Discount:</span>
                        <div className="text-white">{formatCurrency(transaction.discountCouponIDR)}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-300">Points Used:</span>
                        <div className="text-white">{formatCurrency(transaction.pointsUsed)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Items */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-white mb-2">Ticket Items</h4>
                    <div className="space-y-2">
                      {transaction.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-3 bg-white/5 backdrop-blur-md rounded-lg border border-white/10">
                          <div>
                            <div className="font-medium text-white">{item.ticketType.name}</div>
                            <div className="text-sm text-gray-400">
                              {item.quantity} × {formatCurrency(item.unitPriceIDR)}
                            </div>
                          </div>
                          <div className="font-semibold text-white">
                            {formatCurrency(item.quantity * item.unitPriceIDR)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Proof */}
                  {transaction.paymentProof && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-white mb-2">Payment Proof</h4>
                      <div className="flex items-center gap-4">
                        <img
                          src={transaction.paymentProof.imageUrl}
                          alt="Payment Proof"
                          className="w-32 h-32 object-cover rounded-lg border border-white/20 cursor-pointer hover:opacity-90"
                          onClick={() => setPreviewUrl(transaction.paymentProof?.imageUrl || null)}
                        />
                        <div className="text-sm text-gray-400">
                          <div>Uploaded: {formatDate(transaction.paymentProof.uploadedAt)}</div>
                          {transaction.status === 'WAITING_PAYMENT' && (
                            <div className="text-yellow-400 font-medium mt-1">
                              ⏰ {getTimeRemaining(transaction.paymentDueAt)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {transaction.status === 'WAITING_ADMIN_CONFIRMATION' && (
                    <div className="flex gap-3 pt-4 border-t border-white/10">
                      <button
                        onClick={() => setShowAcceptDialog({ isOpen: true, transactionId: transaction.id })}
                        disabled={processingTransaction === transaction.id}
                        className="btn-primary flex-1"
                      >
                        {processingTransaction === transaction.id ? 'Processing...' : 'Accept Payment'}
                      </button>
                      
                      <button
                        onClick={() => setShowRejectDialog({ isOpen: true, transactionId: transaction.id })}
                        disabled={processingTransaction === transaction.id}
                        className="btn-secondary flex-1"
                      >
                        Reject Payment
                      </button>
                    </div>
                  )}

                  {transaction.status === 'WAITING_PAYMENT' && (
                    <div className="pt-4 border-t border-white/10">
                      <div className="text-center text-sm text-gray-400">
                        ⏰ Payment due: {formatDate(transaction.paymentDueAt)}
                        <br />
                        <span className="text-yellow-400 font-medium">
                          {getTimeRemaining(transaction.paymentDueAt)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reject Transaction Dialog */}
        <ConfirmDialog
          isOpen={showRejectDialog.isOpen}
          onClose={() => setShowRejectDialog({ isOpen: false, transactionId: null })}
          onConfirm={handleRejectTransaction}
          title="Reject Payment Proof"
          message="Are you sure you want to reject this payment proof? This action will cancel the transaction and restore the seats."
          confirmText="Reject Payment"
          cancelText="Cancel"
          type="warning"
        >
          <div className="space-y-4 mt-4">
            <div className="form-group">
              <label className="form-label">Rejection Reason (Optional)</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="form-input"
                rows={3}
                placeholder="Provide a reason for rejection..."
              />
            </div>
          </div>
        </ConfirmDialog>
      </div>
      {/* Accept Transaction Dialog */}
      <ConfirmDialog
        isOpen={showAcceptDialog.isOpen}
        onClose={() => setShowAcceptDialog({ isOpen: false, transactionId: null })}
        onConfirm={confirmAcceptTransaction}
        title="Accept Payment Proof"
        message="Are you sure you want to accept this payment proof? This will mark the transaction as completed and generate attendance."
        confirmText="Accept Payment"
        cancelText="Cancel"
        type="info"
      />

      {/* Image Preview Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="max-w-3xl w-full px-4" onClick={(e) => e.stopPropagation()}>
            <img src={previewUrl} alt="Payment proof preview" className="w-full h-auto rounded-xl shadow-2xl" />
            <div className="text-center mt-4">
              <button className="btn-primary" onClick={() => setPreviewUrl(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </RouteProtection>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TransactionsPageContent />
    </Suspense>
  );
}

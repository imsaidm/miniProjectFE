"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import RouteProtection from "@/components/RouteProtection";
import { Skeleton } from "@/components/Skeleton";
import ConfirmDialog from "@/components/ConfirmDialog";
import api from "@/lib/api";

interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  category: string;
  startAt: string;
  endAt: string;
  basePriceIDR: number;
  totalSeats: number;
  availableSeats: number;
  status: string;
  bannerImage?: string;
  reviews?: Review[];
  ticketTypes?: TicketType[];
}

interface TicketType {
  id: number;
  name: string;
  priceIDR: number;
  totalSeats: number;
  availableSeats: number;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
  };
}

interface AttendeeRecord {
  id: number;
  user: { id: number; name: string; email: string };
  ticketType: { id: number; name: string };
}

interface TransactionItem {
  id: number;
  quantity: number;
  unitPriceIDR: number;
  ticketType: { id: number; name: string };
}

interface EventTransaction {
  id: number;
  status: 'WAITING_PAYMENT' | 'WAITING_ADMIN_CONFIRMATION' | 'DONE' | 'REJECTED' | 'EXPIRED' | 'CANCELED';
  createdAt: string;
  updatedAt: string;
  paymentDueAt: string;
  organizerDecisionBy?: string;
  totalPayableIDR: number;
  user: { id: number; name: string; email: string };
  items: TransactionItem[];
  paymentProof?: { id: number; imageUrl: string; uploadedAt: string } | null;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = Number(params.id);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [attendees, setAttendees] = useState<AttendeeRecord[]>([]);
  const [txns, setTxns] = useState<EventTransaction[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [processingTxnId, setProcessingTxnId] = useState<number | null>(null);
  const [showAcceptDialog, setShowAcceptDialog] = useState<{ isOpen: boolean; transactionId: number | null }>({ isOpen: false, transactionId: null });
  const [showRejectDialog, setShowRejectDialog] = useState<{ isOpen: boolean; transactionId: number | null }>({ isOpen: false, transactionId: null });
  const [rejectReason, setRejectReason] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [eventRes, attendeesRes, organizerTxnsRes] = await Promise.all([
          api.get(`/events/${eventId}`),
          api.get(`/transactions/event/${eventId}/attendees`),
          api.get(`/transactions/organizer?eventId=${eventId}`)
        ]);
        setEvent(eventRes.data);
        setAttendees(attendeesRes.data || []);
        const allOrganizerTxns: any[] = organizerTxnsRes.data || [];
        setTxns(allOrganizerTxns);
      } catch (error) {
        console.error('Failed to fetch event details:', error);
      } finally {
        setLoading(false);
        setListLoading(false);
      }
    };

    fetchAll();
  }, [eventId]);

  const formatCurrency = (amount: number) => `IDR ${Number(amount || 0).toLocaleString('id-ID')}`;
  const formatDateTime = (date: string) => new Date(date).toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      WAITING_PAYMENT: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      WAITING_ADMIN_CONFIRMATION: 'bg-blue-100 text-blue-800 border-blue-200',
      DONE: 'bg-green-100 text-green-800 border-green-200',
      REJECTED: 'bg-red-100 text-red-800 border-red-200',
      EXPIRED: 'bg-gray-100 text-gray-800 border-gray-200',
      CANCELED: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    const cls = map[status] || map.WAITING_PAYMENT;
    return <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${cls}`}>{status}</span>;
  };

  const refreshLists = async () => {
    try {
      const [attendeesRes, organizerTxnsRes] = await Promise.all([
        api.get(`/transactions/event/${eventId}/attendees`),
        api.get(`/transactions/organizer?eventId=${eventId}`)
      ]);
      setAttendees(attendeesRes.data || []);
      const allOrganizerTxns: any[] = organizerTxnsRes.data || [];
      setTxns(allOrganizerTxns);
    } catch (error) {
      console.error('Failed to refresh lists:', error);
    }
  };

  const handleAccept = async () => {
    if (!showAcceptDialog.transactionId) return;
    const id = showAcceptDialog.transactionId;
    setProcessingTxnId(id);
    try {
      await api.patch(`/transactions/${id}/accept`);
      await refreshLists();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to accept transaction');
    } finally {
      setProcessingTxnId(null);
      setShowAcceptDialog({ isOpen: false, transactionId: null });
    }
  };

  const handleReject = async () => {
    if (!showRejectDialog.transactionId) return;
    const id = showRejectDialog.transactionId;
    setProcessingTxnId(id);
    try {
      await api.patch(`/transactions/${id}/reject`, { reason: rejectReason || 'Rejected by organizer' });
      await refreshLists();
      setRejectReason("");
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to reject transaction');
    } finally {
      setProcessingTxnId(null);
      setShowRejectDialog({ isOpen: false, transactionId: null });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-primary">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div className="h-8 bg-white/10 backdrop-blur-md rounded animate-pulse"></div>
            <div className="h-64 bg-white/10 backdrop-blur-md rounded animate-pulse"></div>
            <div className="h-32 bg-white/10 backdrop-blur-md rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-primary">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Event Not Found</h1>
          <button onClick={() => router.back()} className="btn-primary">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <RouteProtection requiredRole="ORGANIZER">
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
                <span className="text-yellow-400 mr-3">📅</span>
                <span className="text-white text-lg font-medium">Event Management</span>
              </div>
              
              <h1 className="hero-title text-5xl md:text-6xl mb-6">
                <span className="text-gradient">Event Details</span>
              </h1>
              
              <p className="hero-subtitle text-xl md:text-2xl max-w-3xl mx-auto">
                Manage and monitor your event performance
              </p>
            </div>
          </div>
        </div>

        <div className="container-section">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={()=>router.back()} 
                className="btn-secondary"
              >
                ← Back
              </button>
              <h1 className="text-3xl font-bold text-white">Event Details</h1>
            </div>

            <div className="glass-card mb-8">
              <div className="aspect-video bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg mb-6 flex items-center justify-center">
                {event.bannerImage ? (
                  <img
                    src={event.bannerImage}
                    alt={event.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-white text-2xl font-serif">Event Banner</span>
                )}
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-4">{event.title}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-300">
                    <span className="mr-3">📍</span>
                    <span className="font-semibold">Location:</span>
                    <span className="ml-2">{event.location}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <span className="mr-3">📅</span>
                    <span className="font-semibold">Start Date:</span>
                    <span className="ml-2">{new Date(event.startAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <span className="mr-3">⏰</span>
                    <span className="font-semibold">End Date:</span>
                    <span className="ml-2">{new Date(event.endAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-gray-300">
                    <span className="mr-3">🏷️</span>
                    <span className="font-semibold">Category:</span>
                    <span className="ml-2">{event.category}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <span className="mr-3">💰</span>
                    <span className="font-semibold">Base Price:</span>
                    <span className="ml-2 font-bold text-yellow-400">
                      {!event.basePriceIDR || event.basePriceIDR === 0 ? 'Free' : `IDR ${event.basePriceIDR.toLocaleString('id-ID')}`}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <span className="mr-3">🎫</span>
                    <span className="font-semibold">Seats:</span>
                    <span className="ml-2">{event.availableSeats} / {event.totalSeats}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-3">Description</h3>
                <p className="text-gray-300 leading-relaxed">{event.description}</p>
              </div>

              {/* Ticket Types Display */}
              {event.ticketTypes && event.ticketTypes.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-4">Available Ticket Types</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {event.ticketTypes.map((ticket) => (
                      <div key={ticket.id} className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-500/20">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-bold text-white">{ticket.name}</h4>
                          <span className="font-bold text-yellow-400">
                            {ticket.priceIDR === 0 ? 'Free' : `IDR ${ticket.priceIDR.toLocaleString('id-ID')}`}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between text-gray-300">
                            <span>Total Seats:</span>
                            <span className="font-semibold text-white">{ticket.totalSeats}</span>
                          </div>
                          <div className="flex items-center justify-between text-gray-300">
                            <span>Available:</span>
                            <span className={`font-semibold px-2 py-1 rounded-full text-xs ${
                              ticket.availableSeats > 0 
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              {ticket.availableSeats}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                  event.status === 'PUBLISHED' 
                    ? 'bg-green-100 text-green-800 border-green-200' 
                    : event.status === 'DRAFT'
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                    : 'bg-red-100 text-red-800 border-red-200'
                }`}>
                  {event.status}
                </span>
                
                <div className="space-x-3">
                  {event.status === 'DRAFT' ? (
                    <button 
                      onClick={() => router.push(`/dashboard/events/${eventId}/edit`)}
                      className="btn-primary"
                    >
                      Edit Event & Ticket Types
                    </button>
                  ) : (
                    <div className="px-4 py-2 bg-gray-500/20 text-gray-400 text-sm font-semibold rounded-xl border border-gray-500/30">
                      {event.status === 'PUBLISHED' ? 'Published - Read Only' : 'Cannot Edit'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <button 
                onClick={() => router.push(`/dashboard/events/${eventId}/attendees`)}
                className="glass-card text-center hover:bg-white/10 transition-colors cursor-pointer group"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">👥</div>
                <h3 className="text-lg font-bold text-white mb-2">Manage Attendees</h3>
                <p className="text-gray-400 text-sm">View and manage event attendees</p>
              </button>
              
              <button 
                onClick={() => router.push(`/dashboard/transactions?eventId=${eventId}`)}
                className="glass-card text-center hover:bg-white/10 transition-colors cursor-pointer group"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">💳</div>
                <h3 className="text-lg font-bold text-white mb-2">View Transactions</h3>
                <p className="text-gray-400 text-sm">Review payment confirmations</p>
              </button>
              
              <button 
                onClick={() => router.push(`/dashboard/vouchers`)}
                className="glass-card text-center hover:bg-white/10 transition-colors cursor-pointer group"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🎫</div>
                <h3 className="text-lg font-bold text-white mb-2">Manage Vouchers</h3>
                <p className="text-gray-400 text-sm">Create promotional vouchers</p>
              </button>
            </div>

            {/* Attendees */}
            <div className="glass-card mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Attendees</h2>
                <div className="text-sm text-gray-400">Total: {attendees.length}</div>
              </div>
              {listLoading ? (
                <div className="space-y-2">
                  <div className="h-6 bg-white/10 backdrop-blur-md rounded animate-pulse w-full"></div>
                  <div className="h-6 bg-white/10 backdrop-blur-md rounded animate-pulse w-5/6"></div>
                  <div className="h-6 bg-white/10 backdrop-blur-md rounded animate-pulse w-2/3"></div>
                </div>
              ) : attendees.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No attendees yet.</div>
              ) : (
                <div className="space-y-3">
                  {attendees.map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-md rounded-lg border border-white/10">
                      <div>
                        <div className="font-semibold text-white">{a.user.name}</div>
                        <div className="text-sm text-gray-400">{a.user.email}</div>
                      </div>
                      <div className="text-sm font-medium text-gray-300">{a.ticketType.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Transactions for this event */}
            <div className="glass-card mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Transactions</h2>
                <button onClick={() => router.push('/dashboard/transactions')} className="btn-secondary">All Transactions</button>
              </div>
              {listLoading ? (
                <div className="space-y-2">
                  <div className="h-6 bg-white/10 backdrop-blur-md rounded animate-pulse w-full"></div>
                  <div className="h-6 bg-white/10 backdrop-blur-md rounded animate-pulse w-5/6"></div>
                  <div className="h-6 bg-white/10 backdrop-blur-md rounded animate-pulse w-2/3"></div>
                </div>
              ) : txns.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No transactions yet.</div>
              ) : (
                <div className="space-y-6">
                  {txns.map((t) => (
                    <div key={t.id} className="p-4 bg-white/5 backdrop-blur-md rounded-lg border border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-lg font-semibold text-white">Txn #{t.id}</div>
                          {getStatusBadge(t.status)}
                        </div>
                        <div className="text-white font-semibold">{formatCurrency(t.totalPayableIDR)}</div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <div className="font-medium text-white">Customer</div>
                          <div className="text-gray-300">{t.user.name} • {t.user.email}</div>
                        </div>
                        <div>
                          <div className="font-medium text-white">Dates</div>
                          <div className="text-gray-300">Created: {formatDateTime(t.createdAt)}</div>
                          {t.updatedAt !== t.createdAt && <div className="text-gray-300">Updated: {formatDateTime(t.updatedAt)}</div>}
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="font-medium text-white mb-1">Items</div>
                        <div className="space-y-1">
                          {t.items.map(i => (
                            <div key={i.id} className="flex justify-between text-sm">
                              <div className="text-gray-300">{i.ticketType.name} × {i.quantity}</div>
                              <div className="font-medium text-white">{formatCurrency(i.quantity * i.unitPriceIDR)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {t.paymentProof && (
                        <div className="mb-3">
                          <div className="font-medium text-white mb-1">Payment Proof</div>
                          <div className="flex items-center gap-4">
                            <img
                              src={t.paymentProof.imageUrl}
                              alt="Payment Proof"
                              className="w-28 h-28 object-cover rounded-lg border border-white/20 cursor-pointer hover:opacity-90"
                              onClick={() => setPreviewUrl(t.paymentProof?.imageUrl || null)}
                            />
                            <div className="text-sm text-gray-400">Uploaded: {formatDateTime(t.paymentProof.uploadedAt)}</div>
                          </div>
                        </div>
                      )}
                      {t.status === 'WAITING_ADMIN_CONFIRMATION' && (
                        <div className="flex gap-3 pt-3">
                          <button
                            onClick={() => setShowAcceptDialog({ isOpen: true, transactionId: t.id })}
                            disabled={processingTxnId === t.id}
                            className="btn-primary"
                          >
                            {processingTxnId === t.id ? 'Processing...' : 'Accept Payment'}
                          </button>
                          <button
                            onClick={() => setShowRejectDialog({ isOpen: true, transactionId: t.id })}
                            disabled={processingTxnId === t.id}
                            className="btn-secondary"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div className="glass-card mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Event Reviews</h2>
              
              {event.reviews && event.reviews.length > 0 ? (
                <div className="space-y-4">
                  {event.reviews.map((review) => (
                    <div key={review.id} className="p-4 bg-white/5 backdrop-blur-md rounded-lg border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-white">{review.user?.name || 'Anonymous User'}</span>
                        <span className="text-gray-400 text-sm">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center mb-2">
                        <span className="text-yellow-400 mr-2">{review.rating} ⭐</span>
                      </div>
                      <p className="text-gray-300">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">⭐</div>
                  <h3 className="text-xl font-bold text-white mb-2">No Reviews Yet</h3>
                  <p className="text-gray-400">
                    Reviews will appear here after attendees leave feedback for your event.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Accept Dialog */}
      <ConfirmDialog
        isOpen={showAcceptDialog.isOpen}
        onClose={() => setShowAcceptDialog({ isOpen: false, transactionId: null })}
        onConfirm={handleAccept}
        title="Accept Payment Proof"
        message="Accept this payment and mark the transaction as DONE? Attendance will be generated."
        confirmText="Accept"
        cancelText="Cancel"
        type="info"
      />

      {/* Reject Dialog */}
      <ConfirmDialog
        isOpen={showRejectDialog.isOpen}
        onClose={() => setShowRejectDialog({ isOpen: false, transactionId: null })}
        onConfirm={handleReject}
        title="Reject Payment Proof"
        message="Reject this payment proof? Seats and benefits will be rolled back."
        confirmText="Reject"
        cancelText="Cancel"
        type="warning"
      >
        <div className="space-y-2 mt-4">
          <label className="block text-sm font-medium text-white">Reason (optional)</label>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="form-input"
            rows={3}
            placeholder="Provide a reason for rejection..."
          />
        </div>
      </ConfirmDialog>

      {/* Image Preview */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setPreviewUrl(null)}>
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

"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import RouteProtection from "@/components/RouteProtection";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Skeleton } from "@/components/Skeleton";
import api from "@/lib/api";
import { getRoleFromToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

type DiscountType = 'AMOUNT' | 'PERCENT';

interface Voucher {
  id: number;
  code: string;
  eventId: number;
  discountType: DiscountType;
  discountValue: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  usedCount: number;
}

interface EventItem { id: number; title: string }

export default function VouchersPage() {
  const router = useRouter();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventFilter, setEventFilter] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState<number | null>(null);

  const [form, setForm] = useState({
    eventId: '' as number | '' ,
    code: '',
    discountType: 'AMOUNT' as DiscountType,
    discountValue: 0,
    startsAt: '',
    endsAt: '',
    maxUses: '' as number | ''
  });

  useEffect(() => {
    const run = async () => {
      try {
        // Get only organizer's own events
        const ev = await api.get('/events/my');
        setEvents((ev.data || []).map((e: any) => ({ id: e.id, title: e.title })));
        const list = await api.get('/vouchers');
        setVouchers(list.data || []);
      } finally { 
        setLoading(false); 
      }
    };
    run();
  }, []);

  const reload = async () => {
    try {
      const params: any = {};
      if (eventFilter) params.eventId = eventFilter;
      const list = await api.get('/vouchers', { params });
      setVouchers(list.data || []);
    } catch (error) {
      console.error('Failed to reload vouchers:', error);
    }
  };

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.eventId) return alert('Select event');
    if (!form.code || !form.code.trim()) return alert('Enter voucher code');
    try {
      await api.post('/vouchers', {
        eventId: Number(form.eventId),
        code: form.code.trim(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        startsAt: form.startsAt,
        endsAt: form.endsAt,
        maxUses: form.maxUses === '' ? null : Number(form.maxUses),
      });
      setForm({ eventId: '', code: '', discountType: 'AMOUNT', discountValue: 0, startsAt: '', endsAt: '', maxUses: '' });
      await reload();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to create voucher');
    }
  };

  const onDelete = async () => {
    if (!showDeleteDialog) return;
    try { 
      await api.delete(`/vouchers/${showDeleteDialog}`); 
      await reload(); 
      setShowDeleteDialog(null);
    } catch (e: any) { 
      alert('Delete failed'); 
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
                <span className="text-yellow-400 mr-3">🎫</span>
                <span className="text-white text-lg font-medium">Voucher Management</span>
              </div>
              
              <h1 className="hero-title text-5xl md:text-6xl mb-6">
                <span className="text-gradient">Manage Vouchers</span>
              </h1>
              
              <p className="hero-subtitle text-xl md:text-2xl max-w-3xl mx-auto">
                Create and manage discount vouchers to boost your event sales
              </p>
            </div>
          </div>
        </div>

        <div className="container-section">
          <div className="max-w-6xl mx-auto">
            {/* Create Voucher Form */}
            <div className="glass-card mb-12 p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 gradient-secondary rounded-3xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">✨</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Create New Voucher</h2>
                <p className="text-gray-300">Create discount vouchers for your events to boost ticket sales</p>
              </div>

              {events.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                    <span className="text-4xl">🎪</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">No Events Available</h3>
                  <p className="text-gray-300 mb-6 max-w-md mx-auto">
                    You need to create at least one event before you can create vouchers. 
                    Vouchers can only be created for your own events.
                  </p>
                  <button 
                    onClick={() => router.push('/dashboard/create')}
                    className="btn-primary px-8 py-3 text-lg font-semibold hover:scale-105 transition-all duration-300"
                  >
                    <span className="mr-2">🚀</span>
                    Create Your First Event
                  </button>
                </div>
              ) : (
              
              <form onSubmit={onCreate} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="form-group">
                    <label className="form-label text-sm font-semibold mb-3 block flex items-center">
                      <span className="mr-2">🔑</span>
                      Voucher Code
                    </label>
                    <input
                      type="text"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl focus:ring-4 focus:ring-yellow-400/50 focus:outline-none transition-all duration-300 hover:bg-white/15 font-mono tracking-wider"
                      placeholder="e.g., EARLYBIRD50"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-2">Codes are case-insensitive; we recommend uppercase.</p>
                  </div>
                  <div className="form-group">
                    <label className="form-label text-sm font-semibold mb-3 block flex items-center">
                      <span className="mr-2">🎪</span>
                      Select Event
                    </label>
                    <div className="relative">
                      <select
                        value={form.eventId}
                        onChange={(e) => setForm({ ...form, eventId: e.target.value ? Number(e.target.value) : '' })}
                        className="w-full px-4 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl focus:ring-4 focus:ring-yellow-400/50 focus:outline-none transition-all duration-300 appearance-none cursor-pointer hover:bg-white/15"
                        required
                      >
                        <option value="" className="bg-gray-800 text-white">Choose your event...</option>
                        {events.map((event) => (
                          <option key={event.id} value={event.id} className="bg-gray-800 text-white">{event.title}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Only your own events are available</p>
                  </div>

                  <div className="form-group">
                    <label className="form-label text-sm font-semibold mb-3 block flex items-center">
                      <span className="mr-2">💰</span>
                      Discount Type
                    </label>
                    <div className="relative">
                      <select
                        value={form.discountType}
                        onChange={(e) => setForm({ ...form, discountType: e.target.value as DiscountType })}
                        className="w-full px-4 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl focus:ring-4 focus:ring-yellow-400/50 focus:outline-none transition-all duration-300 appearance-none cursor-pointer hover:bg-white/15"
                      >
                        <option value="AMOUNT" className="bg-gray-800 text-white">Fixed Amount (IDR)</option>
                        <option value="PERCENT" className="bg-gray-800 text-white">Percentage (%)</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label text-sm font-semibold mb-3 block flex items-center">
                      <span className="mr-2">💵</span>
                      Discount Value
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={form.discountValue}
                        onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                        className="w-full px-4 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl focus:ring-4 focus:ring-yellow-400/50 focus:outline-none transition-all duration-300 hover:bg-white/15"
                        placeholder={form.discountType === 'AMOUNT' ? '50000' : '10'}
                        min="0"
                        step={form.discountType === 'AMOUNT' ? '1000' : '1'}
                        required
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                        <span className="text-gray-400 text-sm">
                          {form.discountType === 'AMOUNT' ? 'IDR' : '%'}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {form.discountType === 'AMOUNT' ? 'Enter amount in IDR' : 'Enter percentage (1-100)'}
                    </p>
                  </div>

                  <div className="form-group">
                    <label className="form-label text-sm font-semibold mb-3 block flex items-center">
                      <span className="mr-2">📅</span>
                      Start Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={form.startsAt}
                      onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                      className="w-full px-4 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl focus:ring-4 focus:ring-yellow-400/50 focus:outline-none transition-all duration-300 hover:bg-white/15"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label text-sm font-semibold mb-3 block flex items-center">
                      <span className="mr-2">⏰</span>
                      End Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={form.endsAt}
                      onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                      className="w-full px-4 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl focus:ring-4 focus:ring-yellow-400/50 focus:outline-none transition-all duration-300 hover:bg-white/15"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label text-sm font-semibold mb-3 block flex items-center">
                      <span className="mr-2">🔢</span>
                      Max Uses (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={form.maxUses}
                        onChange={(e) => setForm({ ...form, maxUses: e.target.value ? Number(e.target.value) : '' })}
                        className="w-full px-4 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl focus:ring-4 focus:ring-yellow-400/50 focus:outline-none transition-all duration-300 hover:bg-white/15"
                        placeholder="Unlimited"
                        min="1"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                        <span className="text-gray-400 text-sm">times</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Leave empty for unlimited uses</p>
                  </div>
                </div>

                <div className="text-center pt-6">
                  <button 
                    type="submit" 
                    className="btn-primary px-12 py-4 text-lg font-semibold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-yellow-500/25"
                  >
                    <span className="mr-2">✨</span>
                    Create Voucher
                  </button>
                </div>
              </form>
              )}
            </div>

            {/* Filter */}
            <div className="glass-card mb-8 p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-xl">🎫</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Vouchers List</h3>
                    <p className="text-gray-300">Manage your discount vouchers</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <label className="text-white font-semibold flex items-center">
                    <span className="mr-2">🔍</span>
                    Filter by Event:
                  </label>
                  <div className="relative">
                    <select
                      value={eventFilter}
                      onChange={(e) => {
                        setEventFilter(e.target.value ? Number(e.target.value) : '');
                        reload();
                      }}
                      className="px-4 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl focus:ring-4 focus:ring-yellow-400/50 focus:outline-none transition-all duration-300 appearance-none cursor-pointer hover:bg-white/15 pr-10"
                    >
                      <option value="" className="bg-gray-800 text-white">All Events</option>
                      {events.map((event) => (
                        <option key={event.id} value={event.id} className="bg-gray-800 text-white">{event.title}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vouchers List */}
            {vouchers.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-40 h-40 mx-auto mb-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                  <span className="text-8xl">🎫</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-6">No Vouchers Yet</h3>
                <p className="text-xl text-gray-300 mb-8 max-w-md mx-auto">
                  Create your first voucher to start offering discounts and boost ticket sales!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {vouchers.map((voucher) => {
                  const event = events.find(e => e.id === voucher.eventId);
                  return (
                    <div key={voucher.id} className="glass-card group hover:bg-white/10 transition-all duration-500 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/25">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-4">
                              <div className="px-6 py-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl border border-yellow-500/30 shadow-lg">
                                <code className="text-yellow-400 font-mono font-bold text-xl">
                                  {voucher.code}
                                </code>
                              </div>
                              <span className={`px-4 py-2 rounded-2xl text-sm font-semibold border ${
                                voucher.isActive 
                                  ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                                  : 'bg-red-500/20 text-red-300 border-red-500/30'
                              }`}>
                                {voucher.isActive ? '✅ Active' : '❌ Inactive'}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-lg">🎪</span>
                                <p className="text-gray-400 text-sm font-medium">Event</p>
                              </div>
                              <p className="text-white font-bold text-lg">{event?.title || 'Unknown Event'}</p>
                            </div>
                            <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-lg">💰</span>
                                <p className="text-gray-400 text-sm font-medium">Discount</p>
                              </div>
                              <p className="text-yellow-400 font-bold text-xl">
                                {voucher.discountType === 'AMOUNT' 
                                  ? `IDR ${voucher.discountValue.toLocaleString('id-ID')}`
                                  : `${voucher.discountValue}%`
                                }
                              </p>
                            </div>
                            <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-lg">📊</span>
                                <p className="text-gray-400 text-sm font-medium">Used</p>
                              </div>
                              <p className="text-white font-bold text-lg">{voucher.usedCount} times</p>
                            </div>
                            <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-lg">⏰</span>
                                <p className="text-gray-400 text-sm font-medium">Valid Until</p>
                              </div>
                              <p className="text-white font-bold text-lg">
                                {new Date(voucher.endsAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(voucher.code);
                              // You could add a toast notification here
                            }}
                            className="btn-secondary px-6 py-3 text-sm font-semibold hover:scale-105 transition-all duration-300"
                          >
                            <span className="mr-2">📋</span>
                            Copy Code
                          </button>
                          <button
                            onClick={() => setShowDeleteDialog(voucher.id)}
                            className="px-6 py-3 bg-red-500/10 backdrop-blur-md border border-red-500/20 text-red-300 font-semibold rounded-2xl hover:bg-red-500/20 hover:scale-105 transition-all duration-300 shadow-lg"
                          >
                            <span className="mr-2">🗑️</span>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={!!showDeleteDialog}
          onClose={() => setShowDeleteDialog(null)}
          onConfirm={onDelete}
          title="Delete Voucher"
          message="Are you sure you want to delete this voucher? This action cannot be undone."
          confirmText="Delete Voucher"
          type="danger"
        />
      </div>
    </RouteProtection>
  );
}

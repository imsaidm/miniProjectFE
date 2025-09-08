"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import RouteProtection from "@/components/RouteProtection";
import api from "@/lib/api";
import { isLoggedIn, getRoleFromToken, getUserIdFromToken } from "@/lib/auth";

interface Event {
    id: number;
    title: string;
    description: string;
    startAt: string;
    endAt: string;
    location: string;
    category: string;
    basePriceIDR: number;
    availableSeats: number;
    bannerImage?: string;
    imageUrl?: string;
    ticketTypes: TicketType[];
    organizer: {
        id: number;
        name: string;
        profileImg?: string;
        rating: number;
        reviewCount: number;
    };
}

interface TicketType {
    id: number;
    name: string;
    priceIDR: number;
    availableSeats: number;
}

interface BookingItem {
    ticketTypeId: number;
    quantity: number;
}

export default function BookEventPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id as string;
    
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [bookingItems, setBookingItems] = useState<BookingItem[]>([]);
    const [voucherCode, setVoucherCode] = useState("");
    const [couponCode, setCouponCode] = useState("");
    const [voucherVerified, setVoucherVerified] = useState<null | { code: string; discountLabel: string }>(null);
    const [couponVerified, setCouponVerified] = useState<null | { code: string; discountLabel: string }>(null);
    const [verifying, setVerifying] = useState<{ voucher: boolean; coupon: boolean }>({ voucher: false, coupon: false });
    const [pointsUsed, setPointsUsed] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await api.get(`/events/${eventId}`);
                setEvent(response.data);
                
                // Initialize booking items with first available ticket type
                const availableTicketType = response.data.ticketTypes.find((tt: TicketType) => tt.availableSeats > 0);
                if (availableTicketType) {
                    setBookingItems([{
                        ticketTypeId: availableTicketType.id,
                        quantity: 1
                    }]);
                }
            } catch (error) {
                console.error("Failed to fetch event:", error);
                alert("Failed to load event details");
                router.push("/events");
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [eventId, router]);

    const updateQuantity = (ticketTypeId: number, quantity: number) => {
        if (quantity < 0) return;
        
        setBookingItems(prev => {
            const existing = prev.find(item => item.ticketTypeId === ticketTypeId);
            if (existing) {
                if (quantity === 0) {
                    return prev.filter(item => item.ticketTypeId !== ticketTypeId);
                }
                return prev.map(item => 
                    item.ticketTypeId === ticketTypeId 
                        ? { ...item, quantity }
                        : item
                );
            } else if (quantity > 0) {
                return [...prev, { ticketTypeId, quantity }];
            }
            return prev;
        });
    };

    const addTicketType = (ticketTypeId: number) => {
        const existing = bookingItems.find(item => item.ticketTypeId === ticketTypeId);
        if (existing) {
            updateQuantity(ticketTypeId, existing.quantity + 1);
        } else {
            updateQuantity(ticketTypeId, 1);
        }
    };

    const removeTicketType = (ticketTypeId: number) => {
        updateQuantity(ticketTypeId, 0);
    };

    const calculateSubtotal = () => {
        return bookingItems.reduce((total, item) => {
            const ticketType = event?.ticketTypes.find(tt => tt.id === item.ticketTypeId);
            return total + (ticketType?.priceIDR || 0) * item.quantity;
        }, 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        // Client-side preview: show points only; discounts shown as labels after verification.
        // The backend still authoritatively recalculates all discounts on submission.
        return Math.max(subtotal - pointsUsed, 0);
    };

    const verifyVoucher = async () => {
        if (!voucherCode) return alert('Masukkan kode voucher');
        setVerifying(v => ({ ...v, voucher: true }));
        try {
            const res = await api.post('/vouchers/validate', { code: voucherCode, eventId: Number(eventId) });
            const label = res.data.discountType === 'AMOUNT'
              ? `- IDR ${Number(res.data.discountValue).toLocaleString('id-ID')}`
              : `- ${res.data.discountValue}% (dari subtotal)`;
            setVoucherVerified({ code: voucherCode, discountLabel: label });
        } catch (e: any) {
            setVoucherVerified(null);
            alert(e?.response?.data?.message || 'Voucher tidak valid');
        } finally {
            setVerifying(v => ({ ...v, voucher: false }));
        }
    };

    const verifyCoupon = async () => {
        if (!couponCode) return alert('Masukkan kode coupon');
        setVerifying(v => ({ ...v, coupon: true }));
        try {
            const res = await api.post('/coupons/validate', { code: couponCode });
            const label = res.data.discountType === 'AMOUNT'
              ? `- IDR ${Number(res.data.discountValue).toLocaleString('id-ID')}`
              : `- ${res.data.discountValue}% (dari subtotal)`;
            setCouponVerified({ code: couponCode, discountLabel: label });
        } catch (e: any) {
            setCouponVerified(null);
            alert(e?.response?.data?.message || 'Coupon tidak valid');
        } finally {
            setVerifying(v => ({ ...v, coupon: false }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isLoggedIn()) {
            router.push("/auth/login");
            return;
        }

        // Check if user is the organizer of this event
        const userRole = getRoleFromToken();
        if (userRole === 'ORGANIZER') {
            const userId = getUserIdFromToken();
            if (userId && event?.organizer?.id === userId) {
                alert("You cannot book tickets for your own event!");
                return;
            }
        }

        if (bookingItems.length === 0) {
            alert("Please select at least one ticket type");
            return;
        }

        setSubmitting(true);
        try {
            const response = await api.post("/transactions", {
                eventId: parseInt(eventId),
                items: bookingItems,
                voucherCode: voucherCode || undefined,
                couponCode: couponCode || undefined,
                pointsUsed: pointsUsed || undefined
            });

            console.log("Transaction created successfully:", response.data);
            router.push(`/transactions/${response.data.id}`);
        } catch (error: any) {
            console.error("Failed to create transaction:", error);
            alert(error.response?.data?.message || "Failed to create transaction");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-primary">
                <Navbar />
                <div className="container-hero">
                    <div className="text-center mb-16">
                        <div className="hero-badge mb-8">
                            <span className="text-yellow-400 mr-3">⏳</span>
                            <span className="text-white text-lg font-medium">Loading Event...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-gradient-primary">
                <Navbar />
                <div className="container-hero">
                    <div className="text-center mb-16">
                        <div className="hero-badge mb-8">
                            <span className="text-red-400 mr-3">❌</span>
                            <span className="text-white text-lg font-medium">Event Not Found</span>
                        </div>
                        <Link href="/events" className="btn-primary">
                            Back to Events
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const availableTicketTypes = event.ticketTypes.filter(tt => tt.availableSeats > 0);
    const subtotal = calculateSubtotal();
    const total = calculateTotal();

    return (
        <RouteProtection requiredRole="CUSTOMER">
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
                                <span className="text-yellow-400 mr-3">🎫</span>
                                <span className="text-white text-lg font-medium">Book Tickets</span>
                            </div>
                            
                            <h1 className="hero-title text-5xl md:text-6xl mb-6">
                                <span className="text-gradient">{event.title}</span>
                            </h1>
                            
                            <p className="hero-subtitle text-xl md:text-2xl max-w-3xl mx-auto">
                                Select your tickets and complete your booking
                            </p>
                        </div>
                    </div>
                </div>

                <div className="container-section">
                    <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Event Info */}
                            <div className="glass-card p-8">
                                <h2 className="text-2xl font-bold text-white mb-6">Event Details</h2>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center text-gray-300">
                                        <span className="mr-3 text-xl">📅</span>
                                        <span>{new Date(event.startAt).toLocaleDateString('id-ID', { 
                                            weekday: 'long', 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}</span>
                                    </div>
                                    
                                    <div className="flex items-center text-gray-300">
                                        <span className="mr-3 text-xl">📍</span>
                                        <span>{event.location}</span>
                                    </div>
                                    
                                    <div className="flex items-center text-gray-300">
                                        <span className="mr-3 text-xl">🏷️</span>
                                        <span>{event.category}</span>
                                    </div>
                                    
                                    <div className="flex items-center text-gray-300">
                                        <span className="mr-3 text-xl">👤</span>
                                        <span>Organized by {event.organizer.name}</span>
                                    </div>
                                </div>
                                
                                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                    <p className="text-gray-300 text-sm">{event.description}</p>
                                </div>
                            </div>

                            {/* Booking Form */}
                            <div className="glass-card p-8">
                                <h2 className="text-2xl font-bold text-white mb-6">Select Tickets</h2>
                                
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Ticket Types */}
                                    <div className="space-y-4">
                                        {availableTicketTypes.map((ticketType) => {
                                            const bookingItem = bookingItems.find(item => item.ticketTypeId === ticketType.id);
                                            const quantity = bookingItem?.quantity || 0;
                                            
                                            return (
                                                <div key={ticketType.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-white">{ticketType.name}</h3>
                                                            <p className="text-gray-400 text-sm">
                                                                IDR {ticketType.priceIDR.toLocaleString('id-ID')} per ticket
                                                            </p>
                                                            <p className="text-gray-400 text-sm">
                                                                {ticketType.availableSeats} seats available
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-lg font-bold text-white">
                                                                IDR {(ticketType.priceIDR * quantity).toLocaleString('id-ID')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center space-x-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQuantity(ticketType.id, quantity - 1)}
                                                            disabled={quantity === 0}
                                                            className="w-8 h-8 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="text-white font-semibold min-w-[2rem] text-center">
                                                            {quantity}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQuantity(ticketType.id, quantity + 1)}
                                                            disabled={quantity >= ticketType.availableSeats}
                                                            className="w-8 h-8 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Discounts */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="form-label">Voucher Code (Optional)</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={voucherCode}
                                                    onChange={(e) => { setVoucherCode(e.target.value); setVoucherVerified(null); }}
                                                    className="form-input flex-1"
                                                    placeholder="Masukkan kode voucher"
                                                />
                                                <button type="button" onClick={verifyVoucher} disabled={verifying.voucher} className="btn-secondary whitespace-nowrap">
                                                    {verifying.voucher ? 'Memeriksa...' : 'Verifikasi'}
                                                </button>
                                            </div>
                                            {voucherVerified && (
                                                <div className="text-green-400 text-sm mt-1">Voucher terverifikasi {voucherVerified.discountLabel}</div>
                                            )}
                                        </div>
                                        
                                        <div>
                                            <label className="form-label">Coupon Code (Optional)</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={couponCode}
                                                    onChange={(e) => { setCouponCode(e.target.value); setCouponVerified(null); }}
                                                    className="form-input flex-1"
                                                    placeholder="Masukkan kode coupon"
                                                />
                                                <button type="button" onClick={verifyCoupon} disabled={verifying.coupon} className="btn-secondary whitespace-nowrap">
                                                    {verifying.coupon ? 'Memeriksa...' : 'Verifikasi'}
                                                </button>
                                            </div>
                                            {couponVerified && (
                                                <div className="text-green-400 text-sm mt-1">Coupon terverifikasi {couponVerified.discountLabel}</div>
                                            )}
                                        </div>
                                        
                                        <div>
                                            <label className="form-label">Use Points (Optional)</label>
                                            <input
                                                type="number"
                                                value={pointsUsed}
                                                onChange={(e) => setPointsUsed(Math.max(0, parseInt(e.target.value) || 0))}
                                                className="form-input"
                                                placeholder="0"
                                                min="0"
                                                max={subtotal}
                                            />
                                        </div>
                                    </div>

                                    {/* Order Summary */}
                                    <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                                        <h3 className="text-lg font-semibold text-white mb-3">Order Summary</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-gray-300">
                                                <span>Subtotal:</span>
                                                <span>IDR {subtotal.toLocaleString('id-ID')}</span>
                                            </div>
                                            {voucherVerified && (
                                                <div className="flex justify-between text-green-400">
                                                    <span>Voucher ({voucherVerified.code}):</span>
                                                    <span>{voucherVerified.discountLabel}</span>
                                                </div>
                                            )}
                                            {couponVerified && (
                                                <div className="flex justify-between text-green-400">
                                                    <span>Coupon ({couponVerified.code}):</span>
                                                    <span>{couponVerified.discountLabel}</span>
                                                </div>
                                            )}
                                            {pointsUsed > 0 && (
                                                <div className="flex justify-between text-gray-300">
                                                    <span>Points Used:</span>
                                                    <span>-IDR {pointsUsed.toLocaleString('id-ID')}</span>
                                                </div>
                                            )}
                                            <div className="border-t border-white/10 pt-2">
                                                <div className="flex justify-between text-white font-bold text-lg">
                                                    <span>Total:</span>
                                                    <span>IDR {total.toLocaleString('id-ID')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={submitting || bookingItems.length === 0}
                                        className="w-full py-4 text-center text-lg font-bold rounded-2xl transition-all duration-300 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? (
                                            <div className="flex items-center justify-center space-x-2">
                                                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                                <span>Processing...</span>
                                            </div>
                                        ) : (
                                            "🛒 Proceed to Payment"
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </RouteProtection>
    );
}

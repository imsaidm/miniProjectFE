// src/app/events/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Skeleton } from "@/components/Skeleton";
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

interface Review {
    id: number;
    rating: number;
    comment: string;
    createdAt: string;
    user: {
        name: string;
    };
}

export default function EventDetailPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id as string;
    
    const [event, setEvent] = useState<Event | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchEventData = async () => {
            try {
                const [eventRes, reviewsRes] = await Promise.all([
                    api.get(`/events/${eventId}`),
                    api.get(`/reviews/event/${eventId}`)
                ]);
                setEvent(eventRes.data);
                setReviews(reviewsRes.data || []);
            } catch (error) {
                console.error("Failed to fetch event data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEventData();
    }, [eventId]);

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoggedIn()) {
            router.push("/auth/login");
            return;
        }

        setSubmittingReview(true);
        try {
            const response = await api.post(`/reviews`, {
                eventId: parseInt(eventId),
                rating: newReview.rating,
                comment: newReview.comment
            });
            
            setReviews(prev => [response.data, ...prev]);
            setNewReview({ rating: 5, comment: "" });
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to submit review");
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleBookNow = () => {
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

        // Check if seats are available
        const hasAvailableSeats = event.ticketTypes.some(ticketType => ticketType.availableSeats > 0);
        if (!hasAvailableSeats) {
            alert("Sorry, this event is sold out!");
            return;
        }

        // Redirect to booking page
        router.push(`/events/${eventId}/book`);
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
                    <div className="max-w-6xl mx-auto">
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

    if (!event) {
        return (
            <div className="min-h-screen bg-gradient-primary">
                <Navbar />
                <div className="container-section">
                    <div className="text-center">
                        <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                            <span className="text-6xl">⚠️</span>
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-4">Event Not Found</h1>
                        <p className="text-gray-300 text-xl mb-8">The event you're looking for doesn't exist.</p>
                        <button
                            onClick={() => router.push("/events")}
                            className="btn-primary"
                        >
                            Browse Events
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0;

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
                            <span className="text-yellow-400 mr-3">🎪</span>
                            <span className="text-white text-lg font-medium">Event Details</span>
                        </div>
                        
                        <h1 className="hero-title text-5xl md:text-6xl mb-6">
                            <span className="text-gradient">{event.title}</span>
                        </h1>
                        
                        <p className="hero-subtitle text-xl md:text-2xl max-w-3xl mx-auto">
                            Discover all the details about this amazing event
                        </p>
                    </div>
                </div>
            </div>

            <div className="container-section">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Event Details */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Event Image */}
                            <div className="glass-card">
                                <div className="relative overflow-hidden h-96 rounded-2xl mb-6">
                                    {event.bannerImage || event.imageUrl ? (
                                        <img
                                            src={(event.bannerImage || event.imageUrl) as string}
                                            alt={event.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                            <span className="text-8xl">🎪</span>
                                        </div>
                                    )}
                                    
                                    {/* Category Badge */}
                                    <div className="absolute top-6 right-6">
                                        <span className="badge-primary">
                                            {event.category}
                                        </span>
                                    </div>
                                </div>

                                {/* Event Info */}
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex items-center text-gray-300">
                                            <span className="mr-3 text-2xl">📍</span>
                                            <div>
                                                <p className="text-sm text-gray-400">Location</p>
                                                <p className="font-semibold text-white">{event.location}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center text-gray-300">
                                            <span className="mr-3 text-2xl">📅</span>
                                            <div>
                                                <p className="text-sm text-gray-400">Date</p>
                                                <p className="font-semibold text-white">
                                                    {new Date(event.startAt).toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center text-gray-300">
                                            <span className="mr-3 text-2xl">🕒</span>
                                            <div>
                                                <p className="text-sm text-gray-400">Time</p>
                                                <p className="font-semibold text-white">
                                                    {new Date(event.startAt).toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })} - {new Date(event.endAt).toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center text-gray-300">
                                            <span className="mr-3 text-2xl">🎫</span>
                                            <div>
                                                <p className="text-sm text-gray-400">Available Seats</p>
                                                <p className="font-semibold text-white">{event.availableSeats}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-4">About This Event</h3>
                                        <p className="text-gray-300 leading-relaxed text-lg">
                                            {event.description}
                                        </p>
                                    </div>

                                    {/* Organizer Information */}
                                    <div className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20">
                                        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                                            <span className="mr-3">🎪</span>
                                            Event Organizer
                                        </h3>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-16 h-16 gradient-secondary rounded-full flex items-center justify-center">
                                                    <span className="text-2xl font-bold text-white">🎪</span>
                                                </div>
                                                <div>
                                                    <p className="text-white font-semibold text-xl">{event.organizer.name}</p>
                                                    <p className="text-gray-400">Professional Event Organizer</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center space-x-1 mb-2">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className="text-2xl">
                                                            {i < Math.floor(event.organizer.rating) ? '⭐' : '☆'}
                                                        </span>
                                                    ))}
                                                </div>
                                                <p className="text-yellow-400 font-bold text-lg">
                                                    {event.organizer.rating.toFixed(1)} ({event.organizer.reviewCount} reviews)
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Reviews Section */}
                            <div className="glass-card">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-bold text-white">Reviews</h3>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className="text-2xl">
                                                    {i < Math.floor(averageRating) ? '⭐' : '☆'}
                                                </span>
                                            ))}
                                        </div>
                                        <span className="text-white font-semibold">
                                            {averageRating.toFixed(1)} ({reviews.length} reviews)
                                        </span>
                                    </div>
                                </div>

                                {/* Review Form */}
                                <form onSubmit={handleReviewSubmit} className="mb-8 p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                                    <h4 className="text-lg font-semibold text-white mb-4">Write a Review</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="form-label">Rating</label>
                                            <select
                                                value={newReview.rating}
                                                onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                                                className="form-select"
                                            >
                                                <option value={5}>⭐⭐⭐⭐⭐ Excellent (5)</option>
                                                <option value={4}>⭐⭐⭐⭐ Very Good (4)</option>
                                                <option value={3}>⭐⭐⭐ Good (3)</option>
                                                <option value={2}>⭐⭐ Fair (2)</option>
                                                <option value={1}>⭐ Poor (1)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="form-label">Comment</label>
                                            <textarea
                                                value={newReview.comment}
                                                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                                className="form-textarea"
                                                placeholder="Share your experience..."
                                                rows={4}
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={submittingReview}
                                            className="btn-primary w-full py-3"
                                        >
                                            {submittingReview ? (
                                                <div className="flex items-center justify-center space-x-2">
                                                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                                    <span>Submitting...</span>
                                                </div>
                                            ) : (
                                                "Submit Review"
                                            )}
                                        </button>
                                    </div>
                                </form>

                                {/* Reviews List */}
                                <div className="space-y-6">
                                    {reviews.length === 0 ? (
                                        <div className="text-center py-12">
                                            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                                                <span className="text-4xl">💬</span>
                                            </div>
                                            <h4 className="text-xl font-bold text-white mb-2">No Reviews Yet</h4>
                                            <p className="text-gray-300">Be the first to share your experience!</p>
                                        </div>
                                    ) : (
                                        reviews.map((review) => (
                                            <div key={review.id} className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <h5 className="text-lg font-semibold text-white">
                                                            {review.user?.name || 'Anonymous User'}
                                                        </h5>
                                                        <div className="flex items-center mt-1">
                                                            {[...Array(5)].map((_, i) => (
                                                                <span key={i} className="text-lg">
                                                                    {i < review.rating ? '⭐' : '☆'}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <span className="text-gray-400 text-sm">
                                                        {new Date(review.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-gray-300 leading-relaxed">
                                                    {review.comment}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="glass-card sticky top-8">
                                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                                    <span className="mr-3">🎫</span>
                                    Get Tickets
                                </h3>

                                {/* Ticket Types */}
                                <div className="space-y-4 mb-6">
                                    {event.ticketTypes.map((ticketType) => (
                                        <div key={ticketType.id} className={`p-4 backdrop-blur-md rounded-2xl border transition-all duration-300 ${
                                            ticketType.availableSeats > 0 
                                                ? "bg-white/5 border-white/10 hover:bg-white/10" 
                                                : "bg-red-500/10 border-red-500/20"
                                        }`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className={`text-lg font-semibold ${
                                                    ticketType.availableSeats > 0 ? "text-white" : "text-red-300"
                                                }`}>
                                                    {ticketType.name}
                                                </h4>
                                                <span className={`font-bold text-xl ${
                                                    ticketType.availableSeats > 0 ? "text-yellow-400" : "text-red-300"
                                                }`}>
                                                    IDR {ticketType.priceIDR.toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                            <p className={`text-sm mb-3 ${
                                                ticketType.availableSeats > 0 ? "text-gray-400" : "text-red-300"
                                            }`}>
                                                {ticketType.availableSeats > 0 
                                                    ? `${ticketType.availableSeats} seats available`
                                                    : "❌ Sold Out"
                                                }
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* CTA Button */}
                                {(() => {
                                    const hasAvailableSeats = event.ticketTypes.some(ticketType => ticketType.availableSeats > 0);
                                    const userRole = getRoleFromToken();
                                    const userId = getUserIdFromToken();
                                    const isOwnEvent = userRole === 'ORGANIZER' && userId && event?.organizer?.id === userId;
                                    
                                    return (
                                        <button
                                            onClick={handleBookNow}
                                            disabled={!hasAvailableSeats || isOwnEvent}
                                            className={`w-full py-4 text-center text-lg font-bold rounded-2xl transition-all duration-300 ${
                                                hasAvailableSeats && !isOwnEvent
                                                    ? "btn-primary hover:scale-105"
                                                    : "bg-gray-500/20 text-gray-400 cursor-not-allowed border border-gray-500/30"
                                            }`}
                                        >
                                            {isOwnEvent ? "🚫 Your Event" : hasAvailableSeats ? "🛒 Book Now" : "❌ Sold Out"}
                                        </button>
                                    );
                                })()}

                                {/* Event Stats */}
                                <div className="mt-8 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20">
                                    <h4 className="text-lg font-semibold text-white mb-4">Event Stats</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-300">Category:</span>
                                            <span className="text-white font-medium">{event.category}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-300">Base Price:</span>
                                            <span className="text-yellow-400 font-bold">
                                                IDR {event.basePriceIDR.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-300">Rating:</span>
                                            <span className="text-white font-medium">
                                                {averageRating.toFixed(1)} ⭐ ({reviews.length} reviews)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

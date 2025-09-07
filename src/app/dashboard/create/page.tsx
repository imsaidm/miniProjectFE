"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import RouteProtection from "@/components/RouteProtection";
import ConfirmDialog from "@/components/ConfirmDialog";
import api from "@/lib/api";
import { getRoleFromToken } from "@/lib/auth";

interface TicketType {
    id: string;
    name: string;
    priceIDR: string;
    seats: string;
}

export default function CreateEventPage() {
    const router = useRouter();
    
    const [form, setForm] = useState({
        title: "",
        basePriceIDR: "",
        startAt: "",
        endAt: "",
        totalSeats: "",
        availableSeats: "",
        location: "",
        category: "TECH",
        description: "",
    });

    const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
        {
            id: "1",
            name: "General",
            priceIDR: "",
            seats: "",
        }
    ]);

    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setBannerFile(e.target.files?.[0] || null);
    }, []);

    const addTicketType = useCallback(() => {
        const newId = (ticketTypes.length + 1).toString();
        setTicketTypes(prev => [...prev, {
            id: newId,
            name: "",
            priceIDR: "",
            seats: "",
        }]);
    }, [ticketTypes.length]);

    const removeTicketType = useCallback((id: string) => {
        if (ticketTypes.length > 1) {
            setTicketTypes(prev => prev.filter(ticket => ticket.id !== id));
        }
    }, [ticketTypes.length]);

    const updateTicketType = useCallback((id: string, field: keyof TicketType, value: string) => {
        setTicketTypes(prev => prev.map(ticket => 
            ticket.id === id ? { ...ticket, [field]: value } : ticket
        ));
    }, []);

    const validateForm = useCallback(() => {
        if (!form.title.trim()) {
            alert("Event title is required");
            return false;
        }
        if (!form.description.trim()) {
            alert("Event description is required");
            return false;
        }
        if (!form.location.trim()) {
            alert("Event location is required");
            return false;
        }
        if (!form.startAt) {
            alert("Start date is required");
            return false;
        }
        if (!form.endAt) {
            alert("End date is required");
            return false;
        }
        if (new Date(form.startAt) >= new Date(form.endAt)) {
            alert("End date must be after start date");
            return false;
        }
        const totalSeatsNum = Number(form.totalSeats || 0);
        if (totalSeatsNum <= 0) {
            alert("Total seats must be greater than 0");
            return false;
        }

        // Validate ticket types
        let totalTicketSeats = 0;
        for (const ticket of ticketTypes) {
            if (!ticket.name.trim()) {
                alert("All ticket types must have a name");
                return false;
            }
            const ticketSeatsNum = Number(ticket.seats || 0);
            if (ticketSeatsNum < 0) {
                alert("Ticket seats cannot be negative");
                return false;
            }
            totalTicketSeats += ticketSeatsNum;
        }

        if (totalTicketSeats > totalSeatsNum) {
            alert("Total ticket seats cannot exceed total event seats");
            return false;
        }

        return true;
    }, [form, ticketTypes]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        
        if (getRoleFromToken() !== 'ORGANIZER') {
            alert('Only organizers can create events');
            return;
        }

        if (!validateForm()) {
            return;
        }

        setShowConfirmDialog(true);
    }, [validateForm]);

    const confirmCreateEvent = useCallback(async () => {
        setSubmitting(true);
        setShowConfirmDialog(false);
        
        try {
            const fd = new FormData();
            fd.append('title', form.title);
            fd.append('basePriceIDR', (form.basePriceIDR || '0'));
            fd.append('startAt', form.startAt);
            fd.append('endAt', form.endAt);
            fd.append('totalSeats', (form.totalSeats || '0'));
            fd.append('availableSeats', (form.availableSeats || form.totalSeats || '0'));
            fd.append('location', form.location);
            fd.append('category', form.category);
            fd.append('description', form.description);
            
            // Add ticket types as JSON
            const ticketTypesData = ticketTypes.map(ticket => ({
                name: ticket.name,
                priceIDR: ticket.priceIDR || '0',
                seats: ticket.seats || '0'
            }));
            fd.append('ticketTypes', JSON.stringify(ticketTypesData));
            
            if (bannerFile) {
                fd.append('bannerImage', bannerFile);
            }

            const response = await api.post('/events', fd);

            alert('Event created successfully!');
            router.push('/dashboard');
        } catch (error: any) {
            console.error('Failed to create event:', error);
            alert(error.response?.data?.message || 'Failed to create event');
        } finally {
            setSubmitting(false);
        }
    }, [form, ticketTypes, bannerFile, router]);

    const handleFormKeyDown = useCallback((e: React.KeyboardEvent<HTMLFormElement>) => {
        if (e.key === 'Enter') {
            const target = e.target as HTMLElement;
            const tag = target.tagName.toLowerCase();
            if (tag !== 'textarea') {
                e.preventDefault();
            }
        }
    }, []);

    const closeDialog = useCallback(() => {
        setShowConfirmDialog(false);
    }, []);

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
                                <span className="text-yellow-400 mr-3">✨</span>
                                <span className="text-white text-lg font-medium">Create New Event</span>
                            </div>
                            
                            <h1 className="hero-title text-5xl md:text-6xl mb-6">
                                <span className="text-gradient">Create Your Event</span>
                            </h1>
                            
                            <p className="hero-subtitle text-xl md:text-2xl max-w-3xl mx-auto">
                                Share your amazing event with the world and attract attendees
                            </p>
                        </div>
                    </div>
                </div>

                <div className="container-section">
                    <div className="max-w-5xl mx-auto">
                        <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="space-y-8">
                            {/* Basic Information */}
                            <div className="glass-card p-8">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 mx-auto mb-4 gradient-secondary rounded-3xl flex items-center justify-center shadow-lg">
                                        <span className="text-2xl">📝</span>
                                    </div>
                                    <h2 className="text-3xl font-bold text-white mb-2">Basic Information</h2>
                                    <p className="text-gray-300">Tell us about your amazing event</p>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="form-group md:col-span-2">
                                        <label className="form-label text-sm font-semibold mb-3 block flex items-center">
                                            <span className="mr-2">🎪</span>
                                            Event Title *
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={form.title}
                                            onChange={handleChange}
                                            className="w-full px-4 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl focus:ring-4 focus:ring-yellow-400/50 focus:outline-none transition-all duration-300 hover:bg-white/15"
                                            placeholder="Enter your event title"
                                            required
                                        />
                                        <p className="text-xs text-gray-400 mt-2">Make it catchy and descriptive</p>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label text-sm font-semibold mb-3 block flex items-center">
                                            <span className="mr-2">🏷️</span>
                                            Category
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="category"
                                                value={form.category}
                                                onChange={handleChange}
                                                className="w-full px-4 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl focus:ring-4 focus:ring-yellow-400/50 focus:outline-none transition-all duration-300 appearance-none cursor-pointer hover:bg-white/15"
                                            >
                                                <option value="TECH" className="bg-gray-800 text-white">Technology</option>
                                                <option value="MUSIC" className="bg-gray-800 text-white">Music</option>
                                                <option value="SPORTS" className="bg-gray-800 text-white">Sports</option>
                                                <option value="FOOD" className="bg-gray-800 text-white">Food & Drink</option>
                                                <option value="ART" className="bg-gray-800 text-white">Art & Culture</option>
                                                <option value="BUSINESS" className="bg-gray-800 text-white">Business</option>
                                                <option value="EDUCATION" className="bg-gray-800 text-white">Education</option>
                                                <option value="HEALTH" className="bg-gray-800 text-white">Health & Wellness</option>
                                                <option value="OTHER" className="bg-gray-800 text-white">Other</option>
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
                                            <span className="mr-2">📍</span>
                                            Location *
                                        </label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={form.location}
                                            onChange={handleChange}
                                            className="w-full px-4 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl focus:ring-4 focus:ring-yellow-400/50 focus:outline-none transition-all duration-300 hover:bg-white/15"
                                            placeholder="Enter event location"
                                            required
                                        />
                                        <p className="text-xs text-gray-400 mt-2">Where will your event take place?</p>
                                    </div>

                                    <div className="form-group md:col-span-2">
                                        <label className="form-label text-sm font-semibold mb-3 block flex items-center">
                                            <span className="mr-2">📄</span>
                                            Description *
                                        </label>
                                        <textarea
                                            name="description"
                                            value={form.description}
                                            onChange={handleChange}
                                            className="w-full px-4 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl focus:ring-4 focus:ring-yellow-400/50 focus:outline-none transition-all duration-300 hover:bg-white/15 resize-none"
                                            placeholder="Describe your event in detail..."
                                            rows={4}
                                            required
                                        />
                                        <p className="text-xs text-gray-400 mt-2">Help attendees understand what to expect</p>
                                    </div>
                                </div>
                            </div>

                            {/* Date & Time */}
                            <div className="glass-card p-8">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 mx-auto mb-4 gradient-primary rounded-3xl flex items-center justify-center shadow-lg">
                                        <span className="text-2xl">📅</span>
                                    </div>
                                    <h2 className="text-3xl font-bold text-white mb-2">Date & Time</h2>
                                    <p className="text-gray-300">When will your event happen?</p>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="form-group">
                                        <label className="form-label text-sm font-semibold mb-3 block flex items-center">
                                            <span className="mr-2">🚀</span>
                                            Start Date & Time *
                                        </label>
                                        <input
                                            type="datetime-local"
                                            name="startAt"
                                            value={form.startAt}
                                            onChange={handleChange}
                                            className="w-full px-4 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl focus:ring-4 focus:ring-yellow-400/50 focus:outline-none transition-all duration-300 hover:bg-white/15"
                                            required
                                        />
                                        <p className="text-xs text-gray-400 mt-2">When does your event begin?</p>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label text-sm font-semibold mb-3 block flex items-center">
                                            <span className="mr-2">🏁</span>
                                            End Date & Time *
                                        </label>
                                        <input
                                            type="datetime-local"
                                            name="endAt"
                                            value={form.endAt}
                                            onChange={handleChange}
                                            className="w-full px-4 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl focus:ring-4 focus:ring-yellow-400/50 focus:outline-none transition-all duration-300 hover:bg-white/15"
                                            required
                                        />
                                        <p className="text-xs text-gray-400 mt-2">When does your event end?</p>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing & Seats */}
                            <div className="glass-card p-8">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 mx-auto mb-4 gradient-success rounded-3xl flex items-center justify-center shadow-lg">
                                        <span className="text-2xl">💰</span>
                                    </div>
                                    <h2 className="text-3xl font-bold text-white mb-2">Event Capacity & Pricing</h2>
                                    <p className="text-gray-300">Set your event capacity and base pricing structure</p>
                                </div>
                                
                                <div className="space-y-8">
                                    {/* Event Capacity */}
                                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-6 border border-blue-500/20">
                                        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                                            <span className="mr-3">🏟️</span>
                                            Event Capacity
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="form-group">
                                                <label className="form-label text-sm font-semibold mb-3 block flex items-center">
                                                    <span className="mr-2">🎫</span>
                                                    Total Seats *
                                                </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    name="totalSeats"
                                                    value={form.totalSeats}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-4 pr-16 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl focus:ring-4 focus:ring-blue-400/50 focus:outline-none transition-all duration-300 hover:bg-white/15 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    placeholder="100"
                                                    min="1"
                                                    required
                                                />
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                                    <span className="text-gray-400 text-sm">seats</span>
                                                </div>
                                                <div className="absolute inset-y-0 right-8 flex flex-col">
                                                    <button
                                                        type="button"
                                                        onClick={() => setForm(prev => ({ ...prev, totalSeats: String(Number(prev.totalSeats || 0) + 1) }))}
                                                        className="h-1/2 flex items-center justify-center w-6 text-gray-400 hover:text-white transition-colors"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setForm(prev => ({ ...prev, totalSeats: String(Math.max(1, Number(prev.totalSeats || 0) - 1)) }))}
                                                        className="h-1/2 flex items-center justify-center w-6 text-gray-400 hover:text-white transition-colors"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                                <p className="text-xs text-gray-400 mt-2">Maximum capacity for your event</p>
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label text-sm font-semibold mb-3 block flex items-center">
                                                    <span className="mr-2">✅</span>
                                                    Available Seats
                                                </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    name="availableSeats"
                                                    value={form.availableSeats}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-4 pr-16 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl focus:ring-4 focus:ring-blue-400/50 focus:outline-none transition-all duration-300 hover:bg-white/15 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    placeholder="100"
                                                    min="0"
                                                />
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                                    <span className="text-gray-400 text-sm">seats</span>
                                                </div>
                                                <div className="absolute inset-y-0 right-8 flex flex-col">
                                                    <button
                                                        type="button"
                                                        onClick={() => setForm(prev => ({ ...prev, availableSeats: String(Number(prev.availableSeats || 0) + 1) }))}
                                                        className="h-1/2 flex items-center justify-center w-6 text-gray-400 hover:text-white transition-colors"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setForm(prev => ({ ...prev, availableSeats: String(Math.max(0, Number(prev.availableSeats || 0) - 1)) }))}
                                                        className="h-1/2 flex items-center justify-center w-6 text-gray-400 hover:text-white transition-colors"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                                <p className="text-xs text-gray-400 mt-2">Usually same as total seats initially</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Base Pricing */}
                                    <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border border-green-500/20">
                                        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                                            <span className="mr-3">💵</span>
                                            Base Pricing
                                        </h3>
                                        <div className="form-group">
                                            <label className="form-label text-sm font-semibold mb-3 block flex items-center">
                                                <span className="mr-2">💰</span>
                                                Base Price (IDR)
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    name="basePriceIDR"
                                                    value={form.basePriceIDR}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-4 pr-16 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl focus:ring-4 focus:ring-green-400/50 focus:outline-none transition-all duration-300 hover:bg-white/15 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    placeholder="0"
                                                    min="0"
                                                    step="1000"
                                                />
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                                    <span className="text-gray-400 text-sm">IDR</span>
                                                </div>
                                                <div className="absolute inset-y-0 right-8 flex flex-col">
                                                    <button
                                                        type="button"
                                                        onClick={() => setForm(prev => ({ ...prev, basePriceIDR: String(Number(prev.basePriceIDR || 0) + 1000) }))}
                                                        className="h-1/2 flex items-center justify-center w-6 text-gray-400 hover:text-white transition-colors"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setForm(prev => ({ ...prev, basePriceIDR: String(Math.max(0, Number(prev.basePriceIDR || 0) - 1000)) }))}
                                                        className="h-1/2 flex items-center justify-center w-6 text-gray-400 hover:text-white transition-colors"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-2">Set 0 for free events. This is the base price before any ticket-specific pricing.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ticket Configuration */}
                            <div className="glass-card p-8">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 mx-auto mb-4 gradient-info rounded-3xl flex items-center justify-center shadow-lg">
                                        <span className="text-2xl">🎫</span>
                                    </div>
                                    <h2 className="text-3xl font-bold text-white mb-2">Ticket Types Configuration</h2>
                                    <p className="text-gray-300">Create different ticket types with individual pricing and seat allocation</p>
                                </div>
                                
                                <div className="space-y-6">
                                    {ticketTypes.map((ticket, index) => (
                                        <div key={ticket.id} className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/20">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-bold text-white flex items-center">
                                                    <span className="mr-2">🎫</span>
                                                    Ticket Type #{index + 1}
                                                </h3>
                                                {ticketTypes.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTicketType(ticket.id)}
                                                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors duration-200"
                                                        title="Remove this ticket type"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="form-group">
                                                    <label className="form-label text-sm font-semibold mb-2 block flex items-center">
                                                        <span className="mr-2">🏷️</span>
                                                        Ticket Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={ticket.name}
                                                        onChange={(e) => updateTicketType(ticket.id, 'name', e.target.value)}
                                                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl focus:ring-4 focus:ring-purple-400/50 focus:outline-none transition-all duration-300 hover:bg-white/15"
                                                        placeholder="e.g., VIP, Early Bird, General"
                                                    />
                                                </div>

                                                <div className="form-group">
                                                    <label className="form-label text-sm font-semibold mb-2 block flex items-center">
                                                        <span className="mr-2">💵</span>
                                                        Price (IDR)
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            value={ticket.priceIDR}
                                                            onChange={(e) => updateTicketType(ticket.id, 'priceIDR', e.target.value)}
                                                            className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl focus:ring-4 focus:ring-purple-400/50 focus:outline-none transition-all duration-300 hover:bg-white/15 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                            placeholder="0"
                                                            min="0"
                                                            step="1000"
                                                        />
                                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                            <span className="text-gray-400 text-sm">IDR</span>
                                                        </div>
                                                        <div className="absolute inset-y-0 right-6 flex flex-col">
                                                            <button
                                                                type="button"
                                                                onClick={() => updateTicketType(ticket.id, 'priceIDR', String(Number(ticket.priceIDR || 0) + 1000))}
                                                                className="h-1/2 flex items-center justify-center w-5 text-gray-400 hover:text-white transition-colors"
                                                            >
                                                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => updateTicketType(ticket.id, 'priceIDR', String(Math.max(0, Number(ticket.priceIDR || 0) - 1000)))}
                                                                className="h-1/2 flex items-center justify-center w-5 text-gray-400 hover:text-white transition-colors"
                                                            >
                                                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="form-group">
                                                    <label className="form-label text-sm font-semibold mb-2 block flex items-center">
                                                        <span className="mr-2">🎫</span>
                                                        Seats
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            value={ticket.seats}
                                                            onChange={(e) => updateTicketType(ticket.id, 'seats', e.target.value)}
                                                            className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl focus:ring-4 focus:ring-purple-400/50 focus:outline-none transition-all duration-300 hover:bg-white/15 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                            placeholder="0"
                                                            min="0"
                                                        />
                                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                            <span className="text-gray-400 text-sm">seats</span>
                                                        </div>
                                                        <div className="absolute inset-y-0 right-6 flex flex-col">
                                                            <button
                                                                type="button"
                                                                onClick={() => updateTicketType(ticket.id, 'seats', String(Number(ticket.seats || 0) + 1))}
                                                                className="h-1/2 flex items-center justify-center w-5 text-gray-400 hover:text-white transition-colors"
                                                            >
                                                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => updateTicketType(ticket.id, 'seats', String(Math.max(0, Number(ticket.seats || 0) - 1)))}
                                                                className="h-1/2 flex items-center justify-center w-5 text-gray-400 hover:text-white transition-colors"
                                                            >
                                                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {/* Add Ticket Type Button */}
                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={addTicketType}
                                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Add Another Ticket Type
                                        </button>
                                        <p className="text-xs text-gray-400 mt-2">
                                            Create different pricing tiers for your event
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Banner Image */}
                            <div className="glass-card p-8">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 mx-auto mb-4 gradient-secondary rounded-3xl flex items-center justify-center shadow-lg">
                                        <span className="text-2xl">🖼️</span>
                                    </div>
                                    <h2 className="text-3xl font-bold text-white mb-2">Banner Image</h2>
                                    <p className="text-gray-300">Upload an eye-catching banner for your event</p>
                                </div>
                                
                                <div className="form-group">
                                    <label className="form-label text-sm font-semibold mb-3 block flex items-center">
                                        <span className="mr-2">📸</span>
                                        Upload Banner Image
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="w-full px-4 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl focus:ring-4 focus:ring-yellow-400/50 focus:outline-none transition-all duration-300 hover:bg-white/15 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-400 file:text-black hover:file:bg-yellow-300"
                                        />
                                    </div>
                                    <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                                        <div className="flex items-start space-x-3">
                                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-white text-sm">💡</span>
                                            </div>
                                            <div className="text-sm text-gray-300">
                                                <p className="font-semibold text-white mb-1">Image Guidelines:</p>
                                                <ul className="space-y-1 text-xs">
                                                    <li>• Recommended size: 1200x600 pixels</li>
                                                    <li>• Max file size: 5MB</li>
                                                    <li>• Supported formats: JPG, PNG, WebP</li>
                                                    <li>• High-quality images work best</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="text-center pt-8">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="group relative inline-flex items-center justify-center px-12 py-6 text-xl font-bold text-black bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl shadow-2xl hover:from-yellow-500 hover:to-orange-500 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative flex items-center space-x-3">
                                        {submitting ? (
                                            <>
                                                <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                                <span>Creating Event...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-2xl">✨</span>
                                                <span>Create Event</span>
                                            </>
                                        )}
                                    </div>
                                </button>
                                <p className="text-gray-400 text-sm mt-4">
                                    Your event will be created and ready for attendees to discover!
                                </p>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Confirmation Dialog */}
                <ConfirmDialog
                    isOpen={showConfirmDialog}
                    onClose={closeDialog}
                    onConfirm={confirmCreateEvent}
                    title="Create Event"
                    message="Are you sure you want to create this event? This action cannot be undone."
                    confirmText="Create Event"
                    type="info"
                    isLoading={submitting}
                />
            </div>
        </RouteProtection>
    );
}
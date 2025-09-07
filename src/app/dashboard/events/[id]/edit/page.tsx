"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import RouteProtection from "@/components/RouteProtection";
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
  organizer?: { id: number };
  ticketTypes?: TicketType[];
}

interface TicketType {
  id: number;
  name: string;
  priceIDR: number;
  totalSeats: number;
  availableSeats: number;
}

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = Number(params.id);
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [ownershipError, setOwnershipError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Ticket Types Management
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [newTicketType, setNewTicketType] = useState({
    name: '',
    priceIDR: 0,
    totalSeats: 0,
    availableSeats: 0
  });
  const [showDeleteTicketDialog, setShowDeleteTicketDialog] = useState<number | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    category: "TECH",
    startAt: "",
    endAt: "",
    basePriceIDR: "",
    totalSeats: "",
    availableSeats: "",
    status: "DRAFT"
  });

  // Helper function to format datetime for input field
  const formatDateTimeForInput = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      
      // Format as YYYY-MM-DDTHH:MM
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return "";
    }
  }, []);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setError(null);
        const [profileRes, eventRes] = await Promise.all([
          api.get('/users/profile'),
          api.get(`/events/${eventId}`)
        ]);
        
        const eventData = eventRes.data;
        const profileData = profileRes.data;
        
        setCurrentUserId(profileData.id);
        setEvent(eventData);
        
        // Check ownership
        if (profileData.id !== eventData.organizer?.id) {
          setOwnershipError("You can only edit your own events.");
          return;
        }
        
        // Pre-fill form with existing data
        setForm({
          title: eventData.title || "",
          description: eventData.description || "",
          location: eventData.location || "",
          category: eventData.category || "TECH",
          startAt: formatDateTimeForInput(eventData.startAt),
          endAt: formatDateTimeForInput(eventData.endAt),
          basePriceIDR: String(eventData.basePriceIDR || 0),
          totalSeats: String(eventData.totalSeats || 0),
          availableSeats: String(eventData.availableSeats || 0),
          status: eventData.status || "DRAFT"
        });
        
        // Load ticket types
        setTicketTypes(eventData.ticketTypes || []);
      } catch (error: any) {
        console.error('Failed to fetch event:', error);
        if (error.response?.status === 404) {
          setError("Event not found. It may have been deleted or you don't have permission to edit it.");
        } else if (error.response?.status === 401) {
          setError("Please log in to edit events.");
        } else {
          setError("Failed to load event data. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (eventId && !isNaN(eventId)) {
      fetchEvent();
    } else {
      setError("Invalid event ID.");
      setLoading(false);
    }
  }, [eventId, formatDateTimeForInput]);

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value, // Always store as string
    }));
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setBannerFile(e.target.files?.[0] || null);
  }, []);

  const validateForm = useCallback(() => {
    if (!form.title.trim()) {
      alert("Event title is required.");
      return false;
    }
    if (!form.description.trim()) {
      alert("Event description is required.");
      return false;
    }
    if (!form.location.trim()) {
      alert("Event location is required.");
      return false;
    }
    if (!form.startAt) {
      alert("Start date and time is required.");
      return false;
    }
    if (!form.endAt) {
      alert("End date and time is required.");
      return false;
    }
    
    const startDate = new Date(form.startAt);
    const endDate = new Date(form.endAt);
    const now = new Date();
    
    if (startDate <= now) {
      alert("Start date must be in the future.");
      return false;
    }
    if (endDate <= startDate) {
      alert("End date must be after start date.");
      return false;
    }
    
    const totalSeatsNum = Number(form.totalSeats || 0);
    const availableSeatsNum = Number(form.availableSeats || 0);
    const basePriceNum = Number(form.basePriceIDR || 0);
    
    if (totalSeatsNum < 0) {
      alert("Total seats cannot be negative.");
      return false;
    }
    if (availableSeatsNum < 0) {
      alert("Available seats cannot be negative.");
      return false;
    }
    if (availableSeatsNum > totalSeatsNum) {
      alert("Available seats cannot exceed total seats.");
      return false;
    }
    if (basePriceNum < 0) {
      alert("Base price cannot be negative.");
      return false;
    }
    
    return true;
  }, [form]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setShowConfirmDialog(true);
  }, [validateForm]);

  const confirmUpdateEvent = useCallback(async () => {
    setSubmitting(true);
    setShowConfirmDialog(false);
    setError(null);
    
    try {
      console.log('Updating event with ID:', eventId);
      
      const fd = new FormData();
      fd.append('title', form.title.trim());
      fd.append('description', form.description.trim());
      fd.append('location', form.location.trim());
      fd.append('category', form.category);
      fd.append('startAt', form.startAt);
      fd.append('endAt', form.endAt);
      fd.append('basePriceIDR', form.basePriceIDR || '0');
      fd.append('totalSeats', form.totalSeats || '0');
      fd.append('availableSeats', form.availableSeats || '0');
      fd.append('status', form.status);
      
      if (bannerFile) {
        console.log('Adding banner file:', bannerFile.name);
        fd.append('bannerImage', bannerFile);
      }

      console.log('Making PATCH request to:', `/events/${eventId}`);
      const response = await api.patch(`/events/${eventId}`, fd, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Update response:', response.data);
      
      alert('Event updated successfully!');
      router.push(`/dashboard/events/${eventId}`);
    } catch (error: any) {
      console.error('Failed to update event:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update event. Please try again.';
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }, [form, bannerFile, eventId, router]);

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

  const cancelEdit = useCallback(() => {
    router.back();
  }, [router]);

  // Ticket Type Management Functions
  const createTicketType = useCallback(async () => {
    if (!newTicketType.name.trim()) {
      alert("Ticket type name is required");
      return;
    }
    
    try {
      const response = await api.post(`/events/${eventId}/ticket-types`, newTicketType);
      setTicketTypes(prev => [...prev, response.data]);
      setNewTicketType({ name: '', priceIDR: 0, totalSeats: 0, availableSeats: 0 });
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to create ticket type");
    }
  }, [newTicketType, eventId]);

  const updateTicketType = useCallback(async (ticketTypeId: number, field: keyof TicketType, value: any) => {
    try {
      await api.patch(`/events/ticket-types/${ticketTypeId}`, { [field]: value });
      setTicketTypes(prev => prev.map(ticket => 
        ticket.id === ticketTypeId ? { ...ticket, [field]: value } : ticket
      ));
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update ticket type");
    }
  }, []);

  const deleteTicketType = useCallback(async () => {
    if (!showDeleteTicketDialog) return;
    
    try {
      await api.delete(`/events/ticket-types/${showDeleteTicketDialog}`);
      setTicketTypes(prev => prev.filter(ticket => ticket.id !== showDeleteTicketDialog));
      setShowDeleteTicketDialog(null);
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete ticket type");
    }
  }, [showDeleteTicketDialog]);

  const isEventEditable = event?.status === 'DRAFT';

  if (loading) {
    return (
      <RouteProtection requiredRole="ORGANIZER">
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
          <div className="container-section">
            <div className="max-w-4xl mx-auto">
              <div className="glass-card">
                <div className="space-y-6">
                  <div className="h-8 bg-white/10 rounded animate-pulse"></div>
                  <div className="h-64 bg-white/10 rounded animate-pulse"></div>
                  <div className="h-32 bg-white/10 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </RouteProtection>
    );
  }

  if (error) {
    return (
      <RouteProtection requiredRole="ORGANIZER">
        <div className="min-h-screen bg-gradient-primary">
          <Navbar />
          <div className="container-hero">
            <div className="text-center mb-16">
              <div className="hero-badge mb-8">
                <span className="text-red-400 mr-3">⚠️</span>
                <span className="text-white text-lg font-medium">Error Loading Event</span>
              </div>
              <h1 className="hero-title text-4xl md:text-5xl mb-6">
                <span className="text-gradient">Oops!</span>
              </h1>
              <p className="hero-subtitle text-lg md:text-xl max-w-2xl mx-auto mb-8">
                {error}
              </p>
              <div className="space-x-4">
                <button onClick={cancelEdit} className="btn-primary">
                  Go Back
                </button>
                <button onClick={() => window.location.reload()} className="btn-secondary">
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </RouteProtection>
    );
  }

  if (!event) {
    return (
      <RouteProtection requiredRole="ORGANIZER">
        <div className="min-h-screen bg-gradient-primary">
          <Navbar />
          <div className="container-hero">
            <div className="text-center mb-16">
              <div className="hero-badge mb-8">
                <span className="text-yellow-400 mr-3">🔍</span>
                <span className="text-white text-lg font-medium">Event Not Found</span>
              </div>
              <h1 className="hero-title text-4xl md:text-5xl mb-6">
                <span className="text-gradient">Event Not Found</span>
              </h1>
              <button onClick={cancelEdit} className="btn-primary">
                Go Back
              </button>
            </div>
          </div>
        </div>
      </RouteProtection>
    );
  }

  if (ownershipError) {
    return (
      <RouteProtection requiredRole="ORGANIZER">
        <div className="min-h-screen bg-gradient-primary">
          <Navbar />
          <div className="container-hero">
            <div className="text-center mb-16">
              <div className="hero-badge mb-8">
                <span className="text-red-400 mr-3">🚫</span>
                <span className="text-white text-lg font-medium">Access Denied</span>
              </div>
              <h1 className="hero-title text-4xl md:text-5xl mb-6">
                <span className="text-gradient">Access Denied</span>
              </h1>
              <p className="hero-subtitle text-lg md:text-xl max-w-2xl mx-auto mb-8">
                {ownershipError}
              </p>
              <button onClick={() => router.push('/dashboard')} className="btn-primary">
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </RouteProtection>
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
                <span className="text-yellow-400 mr-3">✏️</span>
                <span className="text-white text-lg font-medium">Edit Event</span>
              </div>
              
              <h1 className="hero-title text-5xl md:text-6xl mb-6">
                <span className="text-gradient">Update Your Event</span>
              </h1>
              
              <p className="hero-subtitle text-xl md:text-2xl max-w-3xl mx-auto">
                Make changes to your event and keep your attendees informed
              </p>
            </div>
          </div>
        </div>

        <div className="container-section">
          <div className="max-w-6xl mx-auto">
            {/* Event Status Alert */}
            {!isEventEditable && (
              <div className="mb-8 p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl border border-orange-500/20">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">⚠️</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Event is Published</h3>
                    <p className="text-gray-300">This event has been published and cannot be edited. Only draft events can be modified.</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="space-y-8">
              {/* Basic Information */}
              <div className="glass-card">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <span className="mr-3">📝</span>
                  Basic Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group md:col-span-2">
                    <label className="form-label">Event Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter event title"
                      required
                      maxLength={100}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="TECH">Technology</option>
                      <option value="MUSIC">Music</option>
                      <option value="SPORTS">Sports</option>
                      <option value="FOOD">Food & Drink</option>
                      <option value="ART">Art & Culture</option>
                      <option value="BUSINESS">Business</option>
                      <option value="EDUCATION">Education</option>
                      <option value="HEALTH">Health & Wellness</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter event location"
                      required
                      maxLength={100}
                    />
                  </div>

                  <div className="form-group md:col-span-2">
                    <label className="form-label">Description *</label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      className="form-textarea"
                      placeholder="Describe your event..."
                      rows={4}
                      required
                      maxLength={1000}
                    />
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="glass-card">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <span className="mr-3">📅</span>
                  Date & Time
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label className="form-label">Start Date & Time *</label>
                    <input
                      type="datetime-local"
                      name="startAt"
                      value={form.startAt}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">End Date & Time *</label>
                    <input
                      type="datetime-local"
                      name="endAt"
                      value={form.endAt}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Seats */}
              <div className="glass-card">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <span className="mr-3">💰</span>
                  Pricing & Seats
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="form-group">
                    <label className="form-label">Base Price (IDR)</label>
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
                  </div>

                  <div className="form-group">
                    <label className="form-label">Total Seats</label>
                    <div className="relative">
                      <input
                        type="number"
                        name="totalSeats"
                        value={form.totalSeats}
                        onChange={handleChange}
                        className="w-full px-4 py-4 pr-16 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl focus:ring-4 focus:ring-blue-400/50 focus:outline-none transition-all duration-300 hover:bg-white/15 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="Enter total seats"
                        min="0"
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
                          onClick={() => setForm(prev => ({ ...prev, totalSeats: String(Math.max(0, Number(prev.totalSeats || 0) - 1)) }))}
                          className="h-1/2 flex items-center justify-center w-6 text-gray-400 hover:text-white transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Available Seats</label>
                    <div className="relative">
                      <input
                        type="number"
                        name="availableSeats"
                        value={form.availableSeats}
                        onChange={handleChange}
                        className="w-full px-4 py-4 pr-16 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl focus:ring-4 focus:ring-blue-400/50 focus:outline-none transition-all duration-300 hover:bg-white/15 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="Enter available seats"
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
                  </div>
                </div>
              </div>

              {/* Event Status */}
              <div className="glass-card">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <span className="mr-3">📊</span>
                  Event Status
                </h2>
                
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="CANCELED">Canceled</option>
                  </select>
                  <p className="text-gray-400 text-sm mt-2">
                    Draft: Only you can see it | Published: Publicly visible | Canceled: Event is cancelled
                  </p>
                </div>
              </div>

              {/* Banner Image */}
              <div className="glass-card">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <span className="mr-3">🖼️</span>
                  Banner Image
                </h2>
                
                <div className="form-group">
                  <label className="form-label">Update Banner Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="form-input"
                  />
                  <p className="text-gray-400 text-sm mt-2">
                    Upload a new banner to replace the current one. Recommended size: 1200x600 pixels. Max file size: 5MB.
                  </p>
                  {event.bannerImage && (
                    <div className="mt-4">
                      <p className="text-gray-400 text-sm mb-2">Current banner:</p>
                      <img 
                        src={event.bannerImage} 
                        alt="Current banner" 
                        className="w-full max-w-md h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Ticket Types Management */}
              {isEventEditable && (
                <div className="glass-card">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 gradient-info rounded-3xl flex items-center justify-center shadow-lg">
                      <span className="text-2xl">🎫</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Ticket Types Management</h2>
                    <p className="text-gray-300">Create and manage different ticket types for your event</p>
                  </div>

                  {/* Create New Ticket Type */}
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/20 mb-8">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                      <span className="mr-3">➕</span>
                      Add New Ticket Type
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="form-group">
                        <label className="form-label text-sm font-semibold mb-2 block flex items-center">
                          <span className="mr-2">🏷️</span>
                          Ticket Name *
                        </label>
                        <input
                          type="text"
                          value={newTicketType.name}
                          onChange={(e) => setNewTicketType(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl focus:ring-4 focus:ring-purple-400/50 focus:outline-none transition-all duration-300 hover:bg-white/15"
                          placeholder="e.g., VIP, General, Early Bird"
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
                            value={newTicketType.priceIDR}
                            onChange={(e) => setNewTicketType(prev => ({ ...prev, priceIDR: Number(e.target.value) || 0 }))}
                            className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl focus:ring-4 focus:ring-purple-400/50 focus:outline-none transition-all duration-300 hover:bg-white/15 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="0"
                            min="0"
                            step="1000"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-gray-400 text-sm">IDR</span>
                          </div>
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label text-sm font-semibold mb-2 block flex items-center">
                          <span className="mr-2">🎫</span>
                          Total Seats
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={newTicketType.totalSeats}
                            onChange={(e) => setNewTicketType(prev => ({ ...prev, totalSeats: Number(e.target.value) || 0 }))}
                            className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl focus:ring-4 focus:ring-purple-400/50 focus:outline-none transition-all duration-300 hover:bg-white/15 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="0"
                            min="0"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-gray-400 text-sm">seats</span>
                          </div>
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label text-sm font-semibold mb-2 block flex items-center">
                          <span className="mr-2">✅</span>
                          Available Seats
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={newTicketType.availableSeats}
                            onChange={(e) => setNewTicketType(prev => ({ ...prev, availableSeats: Number(e.target.value) || 0 }))}
                            className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl focus:ring-4 focus:ring-purple-400/50 focus:outline-none transition-all duration-300 hover:bg-white/15 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="0"
                            min="0"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-gray-400 text-sm">seats</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={createTicketType}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Ticket Type
                    </button>
                  </div>

                  {/* Existing Ticket Types */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                      <span className="mr-3">📋</span>
                      Current Ticket Types
                    </h3>
                    {ticketTypes.length === 0 ? (
                      <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
                        <div className="text-6xl mb-4">🎫</div>
                        <h4 className="text-xl font-semibold text-white mb-2">No Ticket Types Yet</h4>
                        <p className="text-gray-300">Create your first ticket type above to get started.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ticketTypes.map((ticket) => (
                          <div key={ticket.id} className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl p-6 border border-blue-500/20">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-lg font-bold text-white">{ticket.name}</h4>
                              <button
                                type="button"
                                onClick={() => setShowDeleteTicketDialog(ticket.id)}
                                className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors duration-200"
                                title="Delete ticket type"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-300">Price:</span>
                                <span className="font-bold text-yellow-400">IDR {ticket.priceIDR.toLocaleString('id-ID')}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-300">Total Seats:</span>
                                <span className="font-semibold text-white">{ticket.totalSeats}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-300">Available:</span>
                                <span className={`font-semibold px-2 py-1 rounded-full text-xs ${
                                  ticket.availableSeats > 0 
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                }`}>
                                  {ticket.availableSeats}
                                </span>
                              </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-white/10">
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => updateTicketType(ticket.id, 'availableSeats', ticket.availableSeats + 1)}
                                  className="flex-1 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm font-semibold transition-colors duration-200"
                                >
                                  +1 Seat
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateTicketType(ticket.id, 'availableSeats', Math.max(0, ticket.availableSeats - 1))}
                                  className="flex-1 px-3 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg text-sm font-semibold transition-colors duration-200"
                                >
                                  -1 Seat
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-between pt-6">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="btn-secondary px-8 py-4 text-lg"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={submitting || !isEventEditable}
                  className="btn-primary px-12 py-4 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span>Updating Event...</span>
                    </div>
                  ) : !isEventEditable ? (
                    "Event Published - Cannot Edit"
                  ) : (
                    "Update Event"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showConfirmDialog}
          onClose={closeDialog}
          onConfirm={confirmUpdateEvent}
          title="Update Event"
          message="Are you sure you want to update this event? These changes will be visible to all attendees."
          confirmText="Update Event"
          type="info"
          isLoading={submitting}
        />

        {/* Delete Ticket Type Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showDeleteTicketDialog !== null}
          onClose={() => setShowDeleteTicketDialog(null)}
          onConfirm={deleteTicketType}
          title="Delete Ticket Type"
          message="Are you sure you want to delete this ticket type? This action cannot be undone and will affect any existing transactions."
          confirmText="Delete Ticket Type"
          type="danger"
        />
      </div>
    </RouteProtection>
  );
}
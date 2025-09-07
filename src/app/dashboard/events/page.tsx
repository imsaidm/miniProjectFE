"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import RouteProtection from "@/components/RouteProtection";
import ConfirmDialog from "@/components/ConfirmDialog";
import api from "@/lib/api";

interface EventItem {
  id: number;
  title: string;
  description: string;
  location: string;
  category: string;
  startAt: string;
  endAt: string;
  basePriceIDR?: number | null;
  totalSeats?: number | null;
  availableSeats?: number | null;
  status?: string;
  bannerImage?: string;
}

export default function DashboardEventsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events/my');
        setEvents(response.data || []);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const confirmDelete = (id: number) => setPendingDelete(id);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await api.delete(`/events/${pendingDelete}`);
      setEvents(prev => prev.filter(e => e.id !== pendingDelete));
      alert('Event deleted successfully!');
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Failed to delete event');
    } finally {
      setPendingDelete(null);
    }
  };

  const formatPrice = (price?: number | null) => {
    if (!price) return 'Free';
    return `IDR ${price.toLocaleString('id-ID')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const EventsContent = () => {
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <Navbar />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="space-y-8">
              <div className="h-16 bg-white/10 backdrop-blur-md rounded-2xl w-1/3 animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-80 bg-white/10 backdrop-blur-md rounded-3xl animate-pulse border border-white/10"></div>
                ))}
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
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8">
                <span className="text-yellow-400 mr-3">📅</span>
                <span className="text-white text-lg font-medium">Event Management</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                  Your Events
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
                Manage and monitor all your events in one place. Create, edit, and track your event performance.
              </p>

              <Link 
                href="/dashboard/create" 
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
              >
                <span className="mr-2">✨</span>
                Create New Event
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {events.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-40 h-40 mx-auto mb-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                <span className="text-8xl">🎪</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-6">No Events Yet</h3>
              <p className="text-xl text-gray-300 mb-8 max-w-md mx-auto">
                Start by creating your first event to attract attendees and grow your audience
              </p>
              <Link 
                href="/dashboard/create" 
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
              >
                <span className="mr-2">🚀</span>
                Create Your First Event
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <div key={event.id} className="group relative bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl">
                  {/* Event Banner */}
                  <div className="relative h-48 mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                    {event.bannerImage ? (
                      <img
                        src={event.bannerImage}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl">🎪</span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-sm rounded-full">
                        {event.category}
                      </span>
                    </div>
                  </div>

                  {/* Event Info */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors duration-300">
                      {event.title}
                    </h3>
                    
                    <p className="text-gray-300 text-sm line-clamp-2">
                      {event.description}
                    </p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-400">
                        <span className="mr-2">📍</span>
                        {event.location}
                      </div>
                      <div className="flex items-center text-gray-400">
                        <span className="mr-2">📅</span>
                        {formatDate(event.startAt)}
                      </div>
                      <div className="flex items-center text-gray-400">
                        <span className="mr-2">💰</span>
                        {formatPrice(event.basePriceIDR)}
                      </div>
                      {event.totalSeats && (
                        <div className="flex items-center text-gray-400">
                          <span className="mr-2">🎫</span>
                          {event.availableSeats}/{event.totalSeats} seats available
                        </div>
                      )}
                    </div>

                    {/* Event Status */}
                    <div className="mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        event.status === 'PUBLISHED' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : event.status === 'DRAFT'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {event.status === 'PUBLISHED' ? '📢 Published' : 
                         event.status === 'DRAFT' ? '📝 Draft' : 
                         '❌ Canceled'}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4">
                      <Link
                        href={`/dashboard/events/${event.id}`}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 text-center"
                      >
                        View Details
                      </Link>
                      {event.status === 'DRAFT' ? (
                        <>
                          <Link
                            href={`/dashboard/events/${event.id}/edit`}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-semibold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 text-center"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => confirmDelete(event.id)}
                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-semibold rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300"
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <div className="flex-1 px-4 py-2 bg-gray-500/20 text-gray-400 text-sm font-semibold rounded-xl text-center border border-gray-500/30">
                          {event.status === 'PUBLISHED' ? 'Published - Read Only' : 'Cannot Edit'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={!!pendingDelete}
          onClose={() => setPendingDelete(null)}
          onConfirm={handleDelete}
          title="Delete Event"
          message="Are you sure you want to delete this event? This action cannot be undone and will affect all related transactions."
          confirmText="Delete Event"
          type="danger"
        />
      </div>
    );
  };

  if (!mounted) {
    return null;
  }

  return (
    <RouteProtection requiredRole="ORGANIZER">
      <EventsContent />
    </RouteProtection>
  );
}

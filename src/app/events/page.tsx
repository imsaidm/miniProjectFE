"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { CardSkeleton } from "@/components/Skeleton";
import api from "@/lib/api";
import { isLoggedIn, getRoleFromToken } from "@/lib/auth";

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
  organizer: {
    id: number;
    name: string;
    profileImg?: string;
    rating: number;
    reviewCount: number;
  };
}

function EventsPageContent() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  // Get filter values from URL
  const searchTerm = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedLocation = searchParams.get('location') || '';
  const selectedDate = searchParams.get('date') || '';
  const priceRange = searchParams.get('price') || '';
  const sortBy = searchParams.get('sort') || 'date';

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Function to update URL with new filter values
  const updateURL = (newFilters: { 
    search?: string; 
    category?: string; 
    location?: string; 
    date?: string; 
    price?: string; 
    sort?: string; 
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
    });
    
    const newURL = params.toString() ? `?${params.toString()}` : window.location.pathname;
    router.replace(newURL, { scroll: false });
  };

  // Handlers for filter changes
  const handleSearchChange = (value: string) => {
    updateURL({ search: value });
  };

  const handleCategoryChange = (value: string) => {
    updateURL({ category: value });
  };

  const handleLocationChange = (value: string) => {
    updateURL({ location: value });
  };

  const handleDateChange = (value: string) => {
    updateURL({ date: value });
  };

  const handlePriceChange = (value: string) => {
    updateURL({ price: value });
  };

  const handleSortChange = (value: string) => {
    updateURL({ sort: value });
  };

  const handleClearFilters = () => {
    updateURL({ 
      search: '', 
      category: '', 
      location: '', 
      date: '', 
      price: '', 
      sort: 'date' 
    });
  };

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = isLoggedIn();
      const role = getRoleFromToken();
      setIsUserLoggedIn(loggedIn);
      setUserRole(role);
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get("/events");
        setEvents(response.data || []);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    const searchLower = debouncedSearch.toLowerCase();
    const matchesSearch = event.title.toLowerCase().includes(searchLower) ||
      event.description.toLowerCase().includes(searchLower) ||
      event.location.toLowerCase().includes(searchLower) ||
      event.category.toLowerCase().includes(searchLower);
    const matchesCategory = !selectedCategory || event.category === selectedCategory;
    const matchesLocation = !selectedLocation || 
      event.location.toLowerCase().includes(selectedLocation.toLowerCase());
    const matchesDate = !selectedDate || event.startAt.startsWith(selectedDate);
    
    // Price range filter
    let matchesPrice = true;
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      if (max) {
        matchesPrice = event.basePriceIDR >= min && event.basePriceIDR <= max;
      } else {
        matchesPrice = event.basePriceIDR >= min;
      }
    }

    return matchesSearch && matchesCategory && matchesLocation && matchesDate && matchesPrice;
  });

  // Sort events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
      case "price-low":
        return a.basePriceIDR - b.basePriceIDR;
      case "price-high":
        return b.basePriceIDR - a.basePriceIDR;
      case "name":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const categories = [...new Set(events.map(event => event.category))].sort();
  const locations = [...new Set(events.map(event => event.location))].sort();

  const hasActiveFilters = !!(debouncedSearch || selectedCategory || selectedLocation || selectedDate || priceRange);



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-primary">
        <Navbar />
        <div className="container-section">
          <div className="text-center mb-12">
            <div className="h-16 bg-white/10 backdrop-blur-md rounded-2xl w-1/3 mx-auto mb-6 animate-pulse"></div>
            <div className="h-6 bg-white/10 backdrop-blur-md rounded w-1/2 mx-auto mb-8 animate-pulse"></div>
          </div>

          <div className="grid-cards">
            {[...Array(9)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
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
          <div className="text-center mb-12 sm:mb-16">
            <div className="hero-badge mb-6 sm:mb-8">
              <span className="text-yellow-400 mr-2 sm:mr-3 text-sm sm:text-base">🎪</span>
              <span className="text-white text-sm sm:text-lg font-medium">Discover Amazing Events</span>
            </div>
            
            <h1 className="hero-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6 px-2">
              <span className="text-gradient">All Events</span>
            </h1>
            
            <p className="hero-subtitle text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto px-4">
              Browse through our collection of amazing events and find your next unforgettable experience
            </p>
          </div>
        </div>
      </div>

             <div className="container-section">
         {/* Advanced Search and Filters */}
         <div className="glass-card mb-12 sm:mb-16 p-4 sm:p-6 lg:p-8">
           <div className="text-center mb-6 sm:mb-8">
             <h2 className="section-title text-2xl sm:text-3xl md:text-4xl mb-3 sm:mb-4 px-2">Find Your Perfect Event</h2>
             <p className="section-subtitle text-base sm:text-lg px-2">Use our advanced filters to discover events that match your interests</p>
           </div>

           {/* Search Bar */}
           <div className="mb-6 sm:mb-8">
             <div className="relative max-w-4xl mx-auto px-4">
               <div className="absolute inset-y-0 left-0 pl-4 sm:pl-6 flex items-center pointer-events-none">
                 <svg className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                 </svg>
               </div>
               <input
                 type="text"
                 placeholder="Search events by title, description, location, or category..."
                 value={searchTerm}
                 onChange={(e) => handleSearchChange(e.target.value)}
                 className="form-input pl-12 sm:pl-16 pr-4 sm:pr-6 py-3 sm:py-5 text-lg sm:text-xl w-full"
               />
             </div>
           </div>

           {/* Filter Controls */}
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
             <div className="form-group">
               <label className="form-label text-xs sm:text-sm font-semibold mb-2 block">Category</label>
               <select
                 value={selectedCategory}
                 onChange={(e) => handleCategoryChange(e.target.value)}
                 className="px-3 py-2 sm:px-4 sm:py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl focus:ring-4 focus:ring-yellow-400/50 focus:outline-none transition-all duration-300 w-full text-sm sm:text-base"
               >
                 <option value="" className="bg-gray-800 text-white">🎭 All Categories</option>
                 {categories.map((category) => (
                   <option key={category} value={category} className="bg-gray-800 text-white">{category}</option>
                 ))}
               </select>
             </div>

             <div className="form-group">
               <label className="form-label text-xs sm:text-sm font-semibold mb-2 block">Location</label>
               <select
                 value={selectedLocation}
                 onChange={(e) => handleLocationChange(e.target.value)}
                 className="px-3 py-2 sm:px-4 sm:py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl focus:ring-4 focus:ring-yellow-400/50 focus:outline-none transition-all duration-300 w-full text-sm sm:text-base"
               >
                 <option value="" className="bg-gray-800 text-white">📍 All Locations</option>
                 {locations.map((location) => (
                   <option key={location} value={location} className="bg-gray-800 text-white">{location}</option>
                 ))}
               </select>
             </div>

             <div className="form-group">
               <label className="form-label text-xs sm:text-sm font-semibold mb-2 block">Date</label>
               <input
                 type="date"
                 value={selectedDate}
                 onChange={(e) => handleDateChange(e.target.value)}
                 className="px-3 py-2 sm:px-4 sm:py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl focus:ring-4 focus:ring-yellow-400/50 focus:outline-none transition-all duration-300 w-full text-sm sm:text-base"
               />
             </div>

             <div className="form-group">
               <label className="form-label text-xs sm:text-sm font-semibold mb-2 block">Price Range</label>
               <select
                 value={priceRange}
                 onChange={(e) => handlePriceChange(e.target.value)}
                 className="px-3 py-2 sm:px-4 sm:py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl focus:ring-4 focus:ring-yellow-400/50 focus:outline-none transition-all duration-300 w-full text-sm sm:text-base"
               >
                 <option value="" className="bg-gray-800 text-white">💰 Any Price</option>
                 <option value="0-50000" className="bg-gray-800 text-white">Under IDR 50K</option>
                 <option value="50000-200000" className="bg-gray-800 text-white">IDR 50K - 200K</option>
                 <option value="200000-500000" className="bg-gray-800 text-white">IDR 200K - 500K</option>
                 <option value="500000-" className="bg-gray-800 text-white">Above IDR 500K</option>
               </select>
             </div>

             <div className="form-group">
               <label className="form-label text-xs sm:text-sm font-semibold mb-2 block">Sort By</label>
               <select
                 value={sortBy}
                 onChange={(e) => handleSortChange(e.target.value)}
                 className="px-3 py-2 sm:px-4 sm:py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl focus:ring-4 focus:ring-yellow-400/50 focus:outline-none transition-all duration-300 w-full text-sm sm:text-base"
               >
                 <option value="date" className="bg-gray-800 text-white">📅 Date</option>
                 <option value="price-low" className="bg-gray-800 text-white">💰 Price: Low to High</option>
                 <option value="price-high" className="bg-gray-800 text-white">💰 Price: High to Low</option>
                 <option value="name" className="bg-gray-800 text-white">📝 Name</option>
               </select>
             </div>
           </div>

           {/* Clear Filters Button */}
           {hasActiveFilters && (
             <div className="text-center">
               <button
                 onClick={handleClearFilters}
                 className="btn-secondary px-6 py-2 sm:px-8 sm:py-3 text-base sm:text-lg font-semibold"
               >
                 <span className="mr-2">🗑️</span>
                 Clear All Filters
               </button>
             </div>
           )}
         </div>

        {/* Results Summary */}
        {hasActiveFilters && (
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 glass rounded-2xl border border-white/20">
              <span className="text-yellow-400 mr-2 text-sm sm:text-base">🔍</span>
              <p className="text-white text-sm sm:text-lg font-medium">
                {sortedEvents.length === 0 ? "No events found" :
                  `Found ${sortedEvents.length} event${sortedEvents.length !== 1 ? 's' : ''} matching your criteria`}
              </p>
            </div>
          </div>
        )}

        {/* Events Grid */}
        {sortedEvents.length === 0 ? (
          <div className="text-center py-12 sm:py-20">
            <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-6 sm:mb-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
              <span className="text-6xl sm:text-8xl">🔍</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 px-2">No Events Found</h3>
            <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8 max-w-md mx-auto px-4">
              Try adjusting your search terms or filters to find more amazing events.
            </p>
            <button
              onClick={handleClearFilters}
              className="btn-primary px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid-cards">
            {sortedEvents.map((event, index) => (
              <div
                key={event.id}
                className="group relative glass-card overflow-hidden hover:bg-white/10 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/25"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Event Image */}
                <div className="relative overflow-hidden h-64 rounded-2xl mb-6">
                  {event.bannerImage || event.imageUrl ? (
                    <img
                      src={(event.bannerImage || event.imageUrl) as string}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-6xl">🎪</span>
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="badge-primary">
                      {event.category}
                    </span>
                  </div>

                  {/* Price Badge */}
                  <div className="absolute bottom-4 left-4">
                    <div className="px-4 py-2 bg-black/70 backdrop-blur-md rounded-full">
                      <span className="text-yellow-400 font-bold text-lg">
                        {!event.basePriceIDR || event.basePriceIDR === 0 ? 'FREE' : `IDR ${event.basePriceIDR.toLocaleString('id-ID')}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Event Content */}
                <div className="p-4 sm:p-6 lg:p-8">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-3 sm:mb-4 group-hover:text-yellow-400 transition-colors duration-300 line-clamp-2">
                    {event.title}
                  </h3>

                  <p className="text-gray-300 text-sm sm:text-base mb-4 sm:mb-6 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>

                  {/* Event Details */}
                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    <div className="flex items-center text-gray-300">
                      <span className="mr-2 sm:mr-3 text-lg sm:text-xl">📍</span>
                      <span className="font-medium text-sm sm:text-base truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <span className="mr-2 sm:mr-3 text-lg sm:text-xl">📅</span>
                      <span className="font-medium text-sm sm:text-base">
                        {new Date(event.startAt).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <span className="mr-2 sm:mr-3 text-lg sm:text-xl">🎫</span>
                      <span className={`font-medium text-sm sm:text-base ${
                        event.availableSeats > 0 ? "text-gray-300" : "text-red-400"
                      }`}>
                        {event.availableSeats > 0 
                          ? `${event.availableSeats} seats available`
                          : "❌ Sold Out"
                        }
                      </span>
                    </div>
                  </div>

                  {/* Organizer details removed on events listing */}

                  {/* CTA Button */}
                  <Link
                    href={`/events/${event.id}`}
                    className="block w-full btn-primary text-center py-3 sm:py-4 text-base sm:text-lg"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        {sortedEvents.length > 0 && (
          <div className="text-center mt-12 sm:mt-16">
            <div className="glass-card max-w-2xl mx-auto p-6 sm:p-8">
              <div className="mb-6 sm:mb-8">
                <span className="text-4xl sm:text-6xl">🎪</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 px-2">Can't Find What You're Looking For?</h3>
              <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8 px-2">
                {isUserLoggedIn && userRole === "ORGANIZER" 
                  ? "Create your own amazing event and share it with the world!"
                  : isUserLoggedIn && userRole === "CUSTOMER"
                  ? "Want to create events? Register as an organizer!"
                  : "Join us to discover amazing events or create your own!"
                }
              </p>
              {isUserLoggedIn && userRole === "ORGANIZER" ? (
                <Link 
                  href="/dashboard/create" 
                  className="btn-primary inline-flex items-center px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg"
                >
                  <span className="mr-2">✨</span>
                  Create Your Own Event
                </Link>
              ) : isUserLoggedIn && userRole === "CUSTOMER" ? (
                <Link 
                  href="/auth/register?role=ORGANIZER"
                  className="btn-secondary inline-flex items-center px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg"
                >
                  <span className="mr-2">🚀</span>
                  Register as Organizer
                </Link>
              ) : (
                <Link 
                  href="/auth/register" 
                  className="btn-primary inline-flex items-center px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg"
                >
                  <span className="mr-2">🎪</span>
                  Start Organizing
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-primary">
        <Navbar />
        <div className="container-section">
          <div className="text-center mb-12">
            <div className="h-16 bg-white/10 backdrop-blur-md rounded-2xl w-1/3 mx-auto mb-6 animate-pulse"></div>
            <div className="h-6 bg-white/10 backdrop-blur-md rounded w-1/2 mx-auto mb-8 animate-pulse"></div>
          </div>
          <div className="grid-cards">
            {[...Array(9)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    }>
      <EventsPageContent />
    </Suspense>
  );
}

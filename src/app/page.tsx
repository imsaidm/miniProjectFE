"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { CardSkeleton } from "@/components/Skeleton";
import api from "@/lib/api";
import { isLoggedIn, getRoleFromToken } from "@/lib/auth";
import { useHydration } from "@/hooks/useHydration";

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

function HomePageContent() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const isHydrated = useHydration();

  const searchParams = useSearchParams();
  const router = useRouter();

  // Get filter values from URL
  const searchTerm = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedLocation = searchParams.get('location') || '';
  const selectedDate = searchParams.get('date') || '';
  
  // State for date filter
  const [dateFilter, setDateFilter] = useState(selectedDate);

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

  const handleClearFilters = () => {
    updateURL({ 
      search: '', 
      category: '', 
      location: '', 
      date: '' 
    });
  };

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      try {
        const loggedIn = isLoggedIn();
        const role = getRoleFromToken();
        setIsUserLoggedIn(loggedIn);
        setUserRole(role);
      } catch (error) {
        console.warn('Auth check failed:', error);
        setIsUserLoggedIn(false);
        setUserRole(null);
      }
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

    return matchesSearch && matchesCategory && matchesLocation && matchesDate;
  });

  const categories = [...new Set(events.map(event => event.category))].sort();
  const locations = [...new Set(events.map(event => event.location))].sort();

  const hasActiveFilters = !!(debouncedSearch || selectedCategory || selectedLocation || selectedDate);



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-primary" suppressHydrationWarning>
        <Navbar />
        <div className="container-section" suppressHydrationWarning>
          <div className="text-center mb-12" suppressHydrationWarning>
            <div className="h-16 bg-white/10 backdrop-blur-md rounded-2xl w-1/3 mx-auto mb-6 animate-pulse" suppressHydrationWarning></div>
            <div className="h-6 bg-white/10 backdrop-blur-md rounded w-1/2 mx-auto mb-8 animate-pulse" suppressHydrationWarning></div>
          </div>
          <div className="glass-card max-w-4xl mx-auto" suppressHydrationWarning>
            <div className="space-y-6" suppressHydrationWarning>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 bg-white/10 backdrop-blur-md rounded-2xl animate-pulse" suppressHydrationWarning></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary" suppressHydrationWarning>
      <Navbar />

      {/* Hero Section - Absolutely Stunning */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0" suppressHydrationWarning>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20" suppressHydrationWarning></div>
          <div className="absolute top-0 left-0 w-full h-full" suppressHydrationWarning>
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" suppressHydrationWarning></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" suppressHydrationWarning></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" suppressHydrationWarning></div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center" suppressHydrationWarning>
          <div className="mb-6 sm:mb-8" suppressHydrationWarning>
            <div className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4 sm:mb-6" suppressHydrationWarning>
              <span className="text-yellow-400 mr-2 text-sm sm:text-base">✨</span>
              <span className="text-white text-xs sm:text-sm font-medium">Discover Amazing Events</span>
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 sm:mb-8 leading-tight px-2" suppressHydrationWarning>
            <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent block sm:inline" suppressHydrationWarning>
              Unforgettable
            </span>
            <span className="text-white block sm:inline sm:ml-2" suppressHydrationWarning>Experiences</span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed px-2" suppressHydrationWarning>
            From electrifying concerts to inspiring tech conferences, discover events that 
            <span className="text-yellow-400 font-semibold" suppressHydrationWarning> transform your world</span> and create 
            <span className="text-pink-400 font-semibold" suppressHydrationWarning> lasting memories</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-12 sm:mb-16 px-4" suppressHydrationWarning>
            <Link 
              href="#events"
              className="group relative w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-2xl text-base sm:text-lg hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/25"
            >
              <span className="relative z-10">Explore Events</span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
            </Link>
            
            {/* Role-based Create Event Button */}
            {isUserLoggedIn && userRole === "ORGANIZER" ? (
              <Link 
                href="/dashboard/create"
                className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-2xl text-base sm:text-lg hover:from-green-400 hover:to-emerald-400 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25"
              >
                🎪 Create Event
              </Link>
            ) : isUserLoggedIn && userRole === "CUSTOMER" ? (
              <div className="relative group w-full sm:w-auto">
                <Link 
                  href="/auth/register?role=ORGANIZER"
                  className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-2xl text-base sm:text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
                >
                  🚀 Register as Organizer
                </Link>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap hidden sm:block">
                  Create events and manage them
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
                </div>
              </div>
            ) : (
              <Link 
                href="/auth/register"
                className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-2xl text-base sm:text-lg hover:from-purple-400 hover:to-pink-400 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
              >
                🎪 Start Organizing
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto px-4">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-yellow-400 mb-2">500+</div>
              <div className="text-gray-300 text-sm sm:text-base">Amazing Events</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-pink-400 mb-2">50K+</div>
              <div className="text-gray-300 text-sm sm:text-base">Happy Attendees</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-purple-400 mb-2">100+</div>
              <div className="text-gray-300 text-sm sm:text-base">Cities Covered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Promotional Banner - Eye-catching */}
      <div className="relative py-12 sm:py-16 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-white/10 rounded-full"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-4 sm:mb-6">
            <span className="text-4xl sm:text-6xl">🎉</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 px-2">
            <span className="text-yellow-300">FLASH SALE!</span> Up to 70% OFF
          </h2>
          <p className="text-lg sm:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Limited time offer! Book your favorite events at incredible prices. 
            Don't miss out on these amazing deals!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <div className="bg-white/20 backdrop-blur-md rounded-2xl px-4 py-2 sm:px-6 sm:py-3 border border-white/30">
              <div className="text-lg sm:text-2xl font-bold text-white">⏰ 24 HOURS LEFT</div>
            </div>
            <Link 
              href="#events"
              className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-3 bg-white text-purple-600 font-bold rounded-2xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
            >
              Claim Offer Now
            </Link>
          </div>
        </div>
      </div>

      {/* Role-based Information Section */}
      <div className="py-12 sm:py-16 bg-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 px-2">
              Choose Your Experience
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto px-2">
              Whether you want to attend amazing events or create them, we have the perfect solution for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Customer Experience */}
            <div className="glass-card p-8 text-center hover:scale-105 transition-transform duration-300">
              <div className="text-5xl mb-4">🎫</div>
              <h3 className="text-2xl font-bold text-white mb-4">Event Attendees</h3>
              <p className="text-gray-300 mb-6">
                Discover and book amazing events, earn points, get exclusive discounts, and create unforgettable memories
              </p>
              <div className="space-y-3 text-left text-sm text-gray-400">
                <div className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Browse and search events
                </div>
                <div className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Book tickets with secure payments
                </div>
                <div className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Earn loyalty points and rewards
                </div>
                <div className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Get exclusive customer discounts
                </div>
              </div>
              {!isUserLoggedIn && (
                <Link 
                  href="/auth/register"
                  className="inline-block mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:from-blue-400 hover:to-purple-400 transition-all duration-300 transform hover:scale-105"
                >
                  Join as Attendee
                </Link>
              )}
            </div>

            {/* Organizer Experience */}
            <div className="glass-card p-8 text-center hover:scale-105 transition-transform duration-300">
              <div className="text-5xl mb-4">🎪</div>
              <h3 className="text-2xl font-bold text-white mb-4">Event Organizers</h3>
              <p className="text-gray-300 mb-6">
                Create, manage, and promote your events with our comprehensive organizer tools and analytics
              </p>
              <div className="space-y-3 text-left text-sm text-gray-400">
                <div className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Create and customize events
                </div>
                <div className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Manage ticket sales and attendees
                </div>
                <div className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Access detailed analytics and reports
                </div>
                <div className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Promote events with marketing tools
                </div>
              </div>
              {!isUserLoggedIn ? (
                <Link 
                  href="/auth/register"
                  className="inline-block mt-6 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-400 hover:to-emerald-400 transition-all duration-300 transform hover:scale-105"
                >
                  Start Organizing
                </Link>
              ) : userRole === "CUSTOMER" ? (
                <div className="mt-6">
                  <Link 
                    href="/auth/register?role=ORGANIZER"
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-400 hover:to-red-400 transition-all duration-300 transform hover:scale-105"
                  >
                    Register as Organizer
                  </Link>
                  <p className="text-xs text-gray-500 mt-2">Create a new organizer account</p>
                </div>
              ) : (
                <Link 
                  href="/dashboard/create"
                  className="inline-block mt-6 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-400 hover:to-emerald-400 transition-all duration-300 transform hover:scale-105"
                >
                  Create Your Event
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters Section */}
      <div id="events" className="py-12 sm:py-16 lg:py-20 bg-white/5 backdrop-blur-md" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
          <div className="text-center mb-12 sm:mb-16" suppressHydrationWarning>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 px-2" suppressHydrationWarning>
              Find Your Perfect Event
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto px-2" suppressHydrationWarning>
              Use our powerful search to discover events that match your interests, location, and schedule
            </p>
          </div>

          {/* Enhanced Search Bar */}
          <div className="mb-8 sm:mb-12" suppressHydrationWarning>
            <div className="relative max-w-3xl mx-auto px-4" suppressHydrationWarning>
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
                className="w-full pl-12 sm:pl-16 pr-4 sm:pr-6 py-3 sm:py-5 text-lg sm:text-xl border-0 bg-white/10 backdrop-blur-md text-white placeholder-gray-400 rounded-2xl focus:ring-4 focus:ring-yellow-400/50 focus:outline-none transition-all duration-300"
                suppressHydrationWarning
              />
              <div className="absolute inset-y-0 right-0 pr-4 sm:pr-6 flex items-center">
                <div className="text-gray-400 text-xs sm:text-sm hidden sm:block">Press Enter to search</div>
              </div>
            </div>
          </div>

          {/* Enhanced Filter Controls */}
          <div className="flex flex-wrap gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4" suppressHydrationWarning>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full sm:w-auto px-4 py-3 sm:px-6 sm:py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl focus:ring-4 focus:ring-yellow-400/50 focus:outline-none transition-all duration-300 text-sm sm:text-base"
              suppressHydrationWarning
            >
              <option value="" className="bg-gray-800 text-white">🎭 All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category} className="bg-gray-800 text-white">{category}</option>
              ))}
            </select>

            <select
              value={selectedLocation}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="w-full sm:w-auto px-4 py-3 sm:px-6 sm:py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl focus:ring-4 focus:ring-yellow-400/50 focus:outline-none transition-all duration-300 text-sm sm:text-base"
              suppressHydrationWarning
            >
              <option value="" className="bg-gray-800 text-white">📍 All Locations</option>
              {locations.map((location) => (
                <option key={location} value={location} className="bg-gray-800 text-white">{location}</option>
              ))}
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                const params = new URLSearchParams(searchParams);
                if (e.target.value) {
                  params.set('date', e.target.value);
                } else {
                  params.delete('date');
                }
                router.push(`/?${params.toString()}`);
              }}
              className="w-full sm:w-auto px-4 py-3 sm:px-6 sm:py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl focus:ring-4 focus:ring-yellow-400/50 focus:outline-none transition-all duration-300 text-sm sm:text-base"
              suppressHydrationWarning
            />
          </div>

          {/* Results Summary */}
          {hasActiveFilters && (
            <div className="text-center mb-12" suppressHydrationWarning>
              <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <span className="text-yellow-400 mr-2">🔍</span>
                <p className="text-white text-lg font-medium">
                  {filteredEvents.length === 0 ? "No events found" :
                    `Found ${filteredEvents.length} event${filteredEvents.length !== 1 ? 's' : ''} matching your criteria`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Events Grid Section */}
      <div className="py-12 sm:py-16 lg:py-20" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
          {filteredEvents.length === 0 ? (
            <div className="text-center py-20" suppressHydrationWarning>
              <div className="w-40 h-40 mx-auto mb-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center" suppressHydrationWarning>
                <span className="text-8xl">🔍</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-6" suppressHydrationWarning>No Events Found</h3>
              <p className="text-xl text-gray-300 mb-8 max-w-md mx-auto" suppressHydrationWarning>
                Try adjusting your search terms or filters to find more amazing events.
              </p>
              <button
                onClick={handleClearFilters}
                className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-2xl hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 transform hover:scale-105"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8" suppressHydrationWarning>
              {filteredEvents.map((event, index) => (
                <div
                  key={event.id}
                  className="group relative bg-white/5 backdrop-blur-md rounded-3xl overflow-hidden hover:bg-white/10 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/25 border border-white/10"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  suppressHydrationWarning
                >
                  {/* Event Image */}
                  <div className="relative overflow-hidden h-64" suppressHydrationWarning>
                    {event.bannerImage || event.imageUrl ? (
                      <img
                        src={(event.bannerImage || event.imageUrl) as string}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        suppressHydrationWarning
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center" suppressHydrationWarning>
                        <span className="text-6xl">🎪</span>
                      </div>
                    )}
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 right-4" suppressHydrationWarning>
                      <span className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold rounded-full shadow-lg" suppressHydrationWarning>
                        {event.category}
                      </span>
                    </div>

                    {/* Price Badge */}
                    <div className="absolute bottom-4 left-4" suppressHydrationWarning>
                      <div className="px-4 py-2 bg-black/70 backdrop-blur-md rounded-full" suppressHydrationWarning>
                        <span className="text-yellow-400 font-bold text-lg" suppressHydrationWarning>
                          {!event.basePriceIDR || event.basePriceIDR === 0 ? 'FREE' : `IDR ${event.basePriceIDR.toLocaleString('id-ID')}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Event Content */}
                  <div className="p-4 sm:p-6 lg:p-8" suppressHydrationWarning>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-3 sm:mb-4 group-hover:text-yellow-400 transition-colors duration-300 line-clamp-2" suppressHydrationWarning>
                      {event.title}
                    </h3>

                    <p className="text-gray-300 text-sm sm:text-base mb-4 sm:mb-6 line-clamp-2 leading-relaxed" suppressHydrationWarning>
                      {event.description}
                    </p>

                    {/* Event Details */}
                    <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6" suppressHydrationWarning>
                      <div className="flex items-center text-gray-300" suppressHydrationWarning>
                        <span className="mr-2 sm:mr-3 text-lg sm:text-xl">📍</span>
                        <span className="font-medium text-sm sm:text-base truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center text-gray-300" suppressHydrationWarning>
                        <span className="mr-2 sm:mr-3 text-lg sm:text-xl">📅</span>
                        <span className="font-medium text-sm sm:text-base" suppressHydrationWarning>
                          {new Date(event.startAt).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-300" suppressHydrationWarning>
                        <span className="mr-2 sm:mr-3 text-lg sm:text-xl">🎫</span>
                        <span className={`font-medium text-sm sm:text-base ${
                          event.availableSeats > 0 ? "text-gray-300" : "text-red-400"
                        }`} suppressHydrationWarning>
                          {event.availableSeats > 0 
                            ? `${event.availableSeats} seats available`
                            : "❌ Sold Out"
                          }
                        </span>
                      </div>
                    </div>

                    {/* Organizer details removed on homepage listing */}

                    {/* CTA Button */}
                    <Link
                      href={`/events/${event.id}`}
                      className="block w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-center py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 transform group-hover:scale-105 shadow-lg"
                      suppressHydrationWarning
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Call to Action Section */}
      {filteredEvents.length > 0 && (
        <div className="py-20 bg-gradient-to-r from-purple-600/20 to-pink-600/20" suppressHydrationWarning>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" suppressHydrationWarning>
            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-12 border border-white/10" suppressHydrationWarning>
              <div className="mb-8" suppressHydrationWarning>
                <span className="text-8xl">🚀</span>
              </div>
              <h3 className="text-4xl font-bold text-white mb-6" suppressHydrationWarning>Can't Find What You're Looking For?</h3>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed" suppressHydrationWarning>
                Create your own amazing event and share it with the world! 
                Whether it's a concert, workshop, or meetup, we've got you covered.
              </p>
              <Link 
                href="/dashboard/create" 
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-2xl text-lg hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 transform hover:scale-105 shadow-lg"
                suppressHydrationWarning
              >
                <span className="mr-2" suppressHydrationWarning>✨</span>
                Create Your Own Event
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Newsletter Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600/20 to-purple-600/20" suppressHydrationWarning>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" suppressHydrationWarning>
          <h3 className="text-4xl font-bold text-white mb-6" suppressHydrationWarning>Stay in the Loop! 🎯</h3>
          <p className="text-xl text-gray-300 mb-8" suppressHydrationWarning>
            Get notified about the latest events, exclusive offers, and early bird discounts!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" suppressHydrationWarning>
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 bg-white/10 backdrop-blur-md text-white placeholder-gray-400 border border-white/20 rounded-2xl focus:ring-4 focus:ring-yellow-400/50 focus:outline-none transition-all duration-300"
              suppressHydrationWarning
            />
            <button className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-2xl hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 transform hover:scale-105" suppressHydrationWarning>
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div suppressHydrationWarning>Loading...</div>}>
      <HomePageContent />
    </Suspense>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getRoleFromToken } from "@/lib/auth";
import api from "@/lib/api";
import { useHydration } from "@/hooks/useHydration";

interface UserProfile {
  name: string;
  email: string;
  role: string;
  profileImg?: string;
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const isHydrated = useHydration();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoggedIn(false);
      setUserRole(null);
      setUserProfile(null);
      return;
    }

    setIsLoggedIn(true);
    setUserRole(getRoleFromToken());

    // hydrate cached profile first to avoid flicker
    try {
      const cached = localStorage.getItem('user_profile_cache');
      if (cached) {
        setUserProfile(JSON.parse(cached));
      }
    } catch {}

    const fetchProfile = async () => {
      try {
        const response = await api.get("/users/profile");
        setUserProfile(response.data);
        try {
          localStorage.setItem('user_profile_cache', JSON.stringify(response.data));
        } catch {}
      } catch (error: any) {
        console.error("Failed to fetch user profile:", error);
        
        // Handle timeout errors
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          console.log('Request timeout - using cached profile if available');
          // Don't clear auth data on timeout, just use cached data if available
          return;
        }
        
        // If user doesn't exist (404) or unauthorized (401), clear auth data
        if (error.response?.status === 404 || error.response?.status === 401) {
          console.log('User not found or unauthorized, clearing auth data');
          localStorage.removeItem('token');
          localStorage.removeItem('user_profile_cache');
          setUserProfile(null);
          setIsLoggedIn(false);
          setUserRole(null);
          return;
        }
        
        // Try to load from cache if API fails for other reasons
        try {
          const cached = localStorage.getItem('user_profile_cache');
          if (cached) {
            setUserProfile(JSON.parse(cached));
          }
        } catch (cacheError) {
          console.warn('Failed to load cached profile:', cacheError);
        }
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem('user_profile_cache');
    setIsLoggedIn(false);
    setUserRole(null);
    setUserProfile(null);
    router.push("/");
  };

  // Render a minimal static navbar during SSR and initial load
  if (!isHydrated) {
    return (
      <nav className="glass sticky top-0 z-50 border-b border-white/10" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
          <div className="flex justify-between items-center h-16" suppressHydrationWarning>
            {/* Logo - Static */}
            <Link href="/" className="flex items-center space-x-3 group" suppressHydrationWarning>
              <div className="w-10 h-10 gradient-primary rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300" suppressHydrationWarning>
                <span className="text-2xl font-bold text-black">🎪</span>
              </div>
              <span className="text-2xl font-bold gradient-text-primary">EventHub</span>
            </Link>

            {/* Desktop Navigation - Static */}
            <div className="hidden md:flex items-center space-x-8" suppressHydrationWarning>
              <Link href="/" className="nav-link" suppressHydrationWarning>Home</Link>
              <Link href="/events" className="nav-link" suppressHydrationWarning>Events</Link>
            </div>

            {/* Auth Buttons - Static */}
            <div className="hidden md:flex items-center space-x-4" suppressHydrationWarning>
              <Link href="/auth/login" className="nav-link" suppressHydrationWarning>Sign In</Link>
              <Link href="/auth/register" className="nav-button" suppressHydrationWarning>Get Started</Link>
            </div>

            {/* Mobile menu button - Static */}
            <div className="md:hidden" suppressHydrationWarning>
              <button className="glass-button p-2 rounded-xl" suppressHydrationWarning>
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  suppressHydrationWarning
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                    suppressHydrationWarning
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/10" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
        <div className="flex justify-between items-center h-16" suppressHydrationWarning>
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group" suppressHydrationWarning>
            <div className="w-10 h-10 gradient-primary rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300" suppressHydrationWarning>
              <span className="text-2xl font-bold text-black">🎪</span>
            </div>
            <span className="text-2xl font-bold gradient-text-primary">EventHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8" suppressHydrationWarning>
            <Link href="/" className="nav-link">
              Home
            </Link>
            <Link href="/events" className="nav-link">
              Events
            </Link>
            {isLoggedIn && userRole === "ORGANIZER" && (
              <Link href="/dashboard" className="nav-link">
                Dashboard
              </Link>
            )}
            {isLoggedIn && userRole === "CUSTOMER" && (
              <Link href="/transactions" className="nav-link">
                My Transactions
              </Link>
            )}
            {isLoggedIn && (
              <Link href="/profile" className="nav-link">
                Profile
              </Link>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4" suppressHydrationWarning>
            {!isLoggedIn ? (
              <>
                <Link href="/auth/login" className="nav-link">
                  Sign In
                </Link>
                <Link href="/auth/register" className="nav-button">
                  Get Started
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 gradient-secondary rounded-full flex items-center justify-center overflow-hidden">
                    {userProfile?.profileImg ? (
                      <img
                        src={userProfile.profileImg}
                        alt={userProfile.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold text-white">
                        {userProfile?.name?.charAt(0).toUpperCase() || (userRole === "ORGANIZER" ? "🎪" : "👤")}
                      </span>
                    )}
                  </div>
                  <span className="text-white font-medium">
                    {userProfile?.name || (userRole === "ORGANIZER" ? "Organizer" : "User")}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="glass-button px-4 py-2 text-sm"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden" suppressHydrationWarning>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="glass-button p-2 rounded-xl"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="glass rounded-2xl mt-4 p-6 space-y-4 border border-white/10">
              <Link
                href="/"
                className="block nav-link text-lg py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/events"
                className="block nav-link text-lg py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Events
              </Link>
              {isLoggedIn && userRole === "ORGANIZER" && (
                <Link
                  href="/dashboard"
                  className="block nav-link text-lg py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              {isLoggedIn && userRole === "CUSTOMER" && (
                <Link
                  href="/transactions"
                  className="block nav-link text-lg py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Transactions
                </Link>
              )}
              {isLoggedIn && (
                <Link
                  href="/profile"
                  className="block nav-link text-lg py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
              )}
              
              <div className="pt-4 border-t border-white/10">
                {!isLoggedIn ? (
                  <div className="space-y-3">
                    <Link
                      href="/auth/login"
                      className="block nav-link text-lg py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/register"
                      className="block btn-primary text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 py-2">
                      <div className="w-10 h-10 gradient-secondary rounded-full flex items-center justify-center overflow-hidden">
                        {userProfile?.profileImg ? (
                          <img
                            src={userProfile.profileImg}
                            alt={userProfile.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-bold text-white">
                            {userProfile?.name?.charAt(0).toUpperCase() || (userRole === "ORGANIZER" ? "🎪" : "👤")}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="text-white font-semibold">
                          {userProfile?.name || (userRole === "ORGANIZER" ? "Organizer" : "User")}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {userProfile?.email || (userRole === "ORGANIZER" ? "Event Management" : "User Account")}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full glass-button py-3 text-lg"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, getRoleFromToken } from "@/lib/auth";
import Navbar from "@/components/Navbar";

interface RouteProtectionProps {
  children: React.ReactNode;
  requiredRole?: "ORGANIZER" | "CUSTOMER";
  fallback?: React.ReactNode;
}

export default function RouteProtection({ 
  children, 
  requiredRole = "ORGANIZER",
  fallback 
}: RouteProtectionProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (hasChecked) return; // Only check auth once
    
    const checkAuth = () => {
      const loggedIn = isLoggedIn();
      if (!loggedIn) {
        router.push("/auth/login");
        return;
      }

      const userRole = getRoleFromToken();
      if (userRole !== requiredRole) {
        setIsAuthorized(false);
        setIsLoading(false);
        setHasChecked(true);
        return;
      }

      setIsAuthorized(true);
      setIsLoading(false);
      setHasChecked(true);
    };

    checkAuth();
  }, [requiredRole, hasChecked]); // Only run once per role change

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-primary">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Checking authorization...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-gradient-primary">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
          <div className="glass-card max-w-md w-full text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
              <span className="text-4xl">🚫</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-gray-300 mb-6">
              {requiredRole === "ORGANIZER" 
                ? "This page is only accessible to event organizers. Please register as an organizer to access this feature."
                : "This page is only accessible to customers."
              }
            </p>
            <div className="space-y-3">
              {requiredRole === "ORGANIZER" && (
                <button
                  onClick={() => router.push("/auth/register?role=ORGANIZER")}
                  className="w-full btn-primary"
                >
                  Register as Organizer
                </button>
              )}
              <button
                onClick={() => router.push("/")}
                className="w-full btn-secondary"
              >
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

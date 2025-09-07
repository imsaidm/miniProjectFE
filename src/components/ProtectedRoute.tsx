"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, getRoleFromToken } from "@/lib/auth";
import { Skeleton } from "./Skeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'CUSTOMER' | 'ORGANIZER';
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallback 
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/auth/login");
      return;
    }

    if (requiredRole) {
      const userRole = getRoleFromToken();
      if (userRole !== requiredRole) {
        if (fallback) {
          setIsAuthorized(false);
        } else {
          router.push("/");
        }
        setIsLoading(false);
        return;
      }
    }

    setIsAuthorized(true);
    setIsLoading(false);
  }, [requiredRole, fallback]); // Remove router dependency

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-primary">
        <div className="container-section">
          <div className="text-center">
            <div className="h-16 bg-white/10 backdrop-blur-md rounded-2xl w-1/3 mx-auto mb-6 animate-pulse"></div>
            <div className="h-6 bg-white/10 backdrop-blur-md rounded w-1/2 mx-auto mb-8 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorized && fallback) {
    return <>{fallback}</>;
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

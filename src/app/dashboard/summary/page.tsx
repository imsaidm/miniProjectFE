"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import RouteProtection from "@/components/RouteProtection";

export default function DashboardSummaryPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main dashboard since we've consolidated everything there
    router.replace('/dashboard');
  }, [router]);

  return (
    <RouteProtection requiredRole="ORGANIZER">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500/20 rounded-full flex items-center justify-center">
            <span className="text-2xl">⏳</span>
          </div>
          <p className="text-white text-lg">Redirecting to dashboard...</p>
        </div>
      </div>
    </RouteProtection>
  );
}
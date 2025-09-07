"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Skeleton } from "@/components/Skeleton";
import RouteProtection from "@/components/RouteProtection";
import api from "@/lib/api";
import { getRoleFromToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface DashboardStats {
  totalEvents: number;
  totalRevenue: number;
  totalTransactions: number;
  monthlyRevenue: { month: string; revenue: number }[];
  yearlyRevenue: { year: string; revenue: number }[];
  dailyRevenue: { date: string; revenue: number }[];
}

// Extracted reusable components for better maintainability
const StatsCard = ({ 
  icon, 
  title, 
  value, 
  subtitle, 
  gradientFrom, 
  gradientTo, 
  shadowColor 
}: {
  icon: string;
  title: string;
  value: string | number;
  subtitle: string;
  gradientFrom: string;
  gradientTo: string;
  shadowColor: string;
}) => (
  <div className={`group relative bg-gradient-to-br from-${gradientFrom}/10 to-${gradientTo}/10 backdrop-blur-md rounded-3xl p-8 border border-${gradientFrom}/20 hover:border-${gradientFrom}/40 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-${shadowColor}/25`}>
    <div className={`w-16 h-16 mb-6 bg-gradient-to-br from-${gradientFrom} to-${gradientTo} rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
      <span className="text-3xl">{icon}</span>
    </div>
    <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
    <p className={`text-3xl font-bold text-${gradientFrom}-300 mb-2`}>{value}</p>
    <p className="text-gray-400 text-sm">{subtitle}</p>
  </div>
);

const RevenueChart = ({ 
  title, 
  data, 
  dataKey, 
  valueKey, 
  gradientFrom, 
  gradientTo, 
  badgeText, 
  badgeColor,
  emptyMessage,
  emptyIcon
}: {
  title: string;
  data: any[];
  dataKey: string;
  valueKey: string;
  gradientFrom: string;
  gradientTo: string;
  badgeText: string;
  badgeColor: string;
  emptyMessage: string;
  emptyIcon: string;
}) => (
  <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
    <div className="flex items-center justify-between mb-8">
      <h3 className="text-2xl font-bold text-white">{title}</h3>
      <span className={`px-4 py-2 bg-${badgeColor}/20 text-${badgeColor}-300 rounded-full text-sm font-semibold border border-${badgeColor}/30`}>
        {badgeText}
      </span>
    </div>
    
    {data.length === 0 ? (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-gray-500/20 to-gray-600/20 rounded-full flex items-center justify-center">
          <span className="text-4xl">{emptyIcon}</span>
        </div>
        <p className="text-gray-400 text-lg">{emptyMessage}</p>
      </div>
    ) : (
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="flex items-center space-x-4">
              <div className={`w-3 h-3 bg-gradient-to-r from-${gradientFrom} to-${gradientTo} rounded-full`}></div>
              <span className="text-white font-medium">{item[dataKey]}</span>
            </div>
            <span className="text-yellow-400 font-bold">
              IDR {item[valueKey].toLocaleString('id-ID')}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
);

const QuickActionCard = ({ 
  href, 
  icon, 
  title, 
  description, 
  gradientFrom, 
  gradientTo 
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
}) => (
  <Link
    href={href}
    className={`group relative bg-gradient-to-br from-${gradientFrom}/10 to-${gradientTo}/10 backdrop-blur-md rounded-3xl p-8 border border-${gradientFrom}/20 hover:border-${gradientFrom}/40 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-${gradientFrom}/25 text-center`}
  >
    <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-${gradientFrom} to-${gradientTo} rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
      <span className="text-4xl">{icon}</span>
    </div>
    <h4 className="text-xl font-bold text-white mb-3">{title}</h4>
    <p className="text-gray-300 mb-6">{description}</p>
    <div className={`inline-flex items-center text-${gradientFrom}-300 font-semibold group-hover:text-${gradientFrom}-200 transition-colors duration-300`}>
      Get Started
      <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    </div>
  </Link>
);

export default function OrganizerDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoized helper functions for better performance
  const formatDayToDate = useCallback((day: string) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const dayNumber = parseInt(day);
    
    if (isNaN(dayNumber)) return day;
    
    const date = new Date(currentYear, currentMonth, dayNumber);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }, []);

  const getMonthName = useCallback((monthNumber: number) => {
    const date = new Date(2024, monthNumber - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long' });
  }, []);

  // Memoized calculations to prevent unnecessary recalculations
  const calculatedMetrics = useMemo(() => {
    if (!stats) return { avgRevenuePerEvent: '0', avgRevenuePerTransaction: '0' };
    
    return {
      avgRevenuePerEvent: (stats.totalRevenue / Math.max(stats.totalEvents, 1)).toFixed(0),
      avgRevenuePerTransaction: (stats.totalRevenue / Math.max(stats.totalTransactions, 1)).toFixed(0)
    };
  }, [stats]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/dashboard/summary');
        // The API returns data wrapped in a 'data' property
        setStats(response.data.data);
      } catch (error: any) {
        console.error('Failed to fetch dashboard data:', error);
        setError(error.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const DashboardContent = () => {
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <Navbar />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="space-y-8">
              <div className="h-16 bg-white/10 backdrop-blur-md rounded-2xl w-1/3 animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-48 bg-white/10 backdrop-blur-md rounded-3xl animate-pulse border border-white/10"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <Navbar />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
                <span className="text-4xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Error Loading Dashboard</h2>
              <p className="text-gray-300 mb-8">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                Try Again
              </button>
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
                <span className="text-yellow-400 mr-3">📊</span>
                <span className="text-white text-lg font-medium">Organizer Dashboard</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                  Welcome Back!
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Manage your events, track performance, and grow your business with powerful analytics and insights.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <StatsCard
              icon="🎪"
              title="Total Events"
              value={stats?.totalEvents || 0}
              subtitle="Events created"
              gradientFrom="purple-500"
              gradientTo="pink-500"
              shadowColor="purple-500"
            />
            <StatsCard
              icon="💰"
              title="Total Revenue"
              value={`IDR ${(stats?.totalRevenue || 0).toLocaleString('id-ID')}`}
              subtitle="All time earnings"
              gradientFrom="green-500"
              gradientTo="emerald-500"
              shadowColor="green-500"
            />
            <StatsCard
              icon="🎫"
              title="Total Transactions"
              value={stats?.totalTransactions || 0}
              subtitle="Completed bookings"
              gradientFrom="blue-500"
              gradientTo="cyan-500"
              shadowColor="blue-500"
            />
            <StatsCard
              icon="📈"
              title="Avg Revenue/Event"
              value={`IDR ${calculatedMetrics.avgRevenuePerEvent}`}
              subtitle="Per event average"
              gradientFrom="yellow-500"
              gradientTo="orange-500"
              shadowColor="yellow-500"
            />
          </div>

          {/* Revenue Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <RevenueChart
              title="Daily Revenue"
              data={stats?.dailyRevenue || []}
              dataKey="date"
              valueKey="revenue"
              gradientFrom="blue-500"
              gradientTo="cyan-500"
              badgeText="Last 7 Days"
              badgeColor="blue-500"
              emptyMessage="No revenue data available"
              emptyIcon="📊"
            />
            <RevenueChart
              title="Monthly Revenue"
              data={stats?.monthlyRevenue || []}
              dataKey="month"
              valueKey="revenue"
              gradientFrom="green-500"
              gradientTo="emerald-500"
              badgeText="This Year"
              badgeColor="green-500"
              emptyMessage="No monthly data available"
              emptyIcon="📅"
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-white mb-4">⚡ Quick Actions</h3>
              <p className="text-gray-300 text-lg">Manage your events and business efficiently</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <QuickActionCard
                href="/dashboard/events"
                icon="📅"
                title="Manage Events"
                description="Create, edit, and manage your amazing events"
                gradientFrom="purple-500"
                gradientTo="pink-500"
              />
              
              <QuickActionCard
                href="/dashboard/vouchers"
                icon="🎫"
                title="Manage Vouchers"
                description="Create and manage discount vouchers"
                gradientFrom="yellow-500"
                gradientTo="orange-500"
              />
              
              <QuickActionCard
                href="/dashboard/transactions"
                icon="💰"
                title="View Transactions"
                description="Monitor and manage all transactions"
                gradientFrom="green-500"
                gradientTo="emerald-500"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <RouteProtection requiredRole="ORGANIZER">
      <DashboardContent />
    </RouteProtection>
  );
}
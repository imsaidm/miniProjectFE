import React from 'react';

interface StatsCardsProps {
  stats: {
    totalEvents: number;
    totalRevenue: number;
    totalTransactions: number;
  };
  averageRevenuePerEvent: string;
  averageRevenuePerTransaction: string;
}

export default function StatsCards({ stats, averageRevenuePerEvent, averageRevenuePerTransaction }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Events */}
      <div className="card-vintage p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-vintage-subtitle text-sm font-medium">📅 Total Events</p>
            <p className="text-3xl font-bold text-vintage-title">{stats.totalEvents}</p>
          </div>
          <div className="w-12 h-12 bg-vintage-gold/10 rounded-lg flex items-center justify-center">
            <span className="text-2xl">📅</span>
          </div>
        </div>
      </div>

      {/* Total Revenue */}
      <div className="card-vintage p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-vintage-subtitle text-sm font-medium">💰 Total Revenue</p>
            <p className="text-3xl font-bold text-vintage-title">
              IDR {stats.totalRevenue.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="w-12 h-12 bg-vintage-gold/10 rounded-lg flex items-center justify-center">
            <span className="text-2xl">💰</span>
          </div>
        </div>
      </div>

      {/* Total Transactions */}
      <div className="card-vintage p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-vintage-subtitle text-sm font-medium">🎫 Total Transactions</p>
            <p className="text-3xl font-bold text-vintage-title">{stats.totalTransactions}</p>
          </div>
          <div className="w-12 h-12 bg-vintage-gold/10 rounded-lg flex items-center justify-center">
            <span className="text-2xl">🎫</span>
          </div>
        </div>
      </div>

      {/* Average Sale Value */}
      <div className="card-vintage p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-vintage-subtitle text-sm font-medium">📊 Avg. Sale Value</p>
            <p className="text-3xl font-bold text-vintage-title">
              IDR {averageRevenuePerTransaction}
            </p>
          </div>
          <div className="w-12 h-12 bg-vintage-gold/10 rounded-lg flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
        </div>
      </div>
    </div>
  );
}

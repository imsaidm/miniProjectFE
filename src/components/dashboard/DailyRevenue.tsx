interface DailyRevenueProps {
  dailyRevenue: { date: string; revenue: number }[];
  formatDayToDate: (day: string) => string;
}

export default function DailyRevenue({ dailyRevenue, formatDayToDate }: DailyRevenueProps) {
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'long' });
  const currentYear = currentDate.getFullYear();

  return (
    <div className="card-vintage p-6 mb-8">
      <h3 className="text-xl font-bold text-vintage-title mb-4">
        📅 Daily Revenue - {currentMonth} {currentYear}
      </h3>
      {dailyRevenue.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {dailyRevenue.map((item, index) => (
            <div key={index} className="p-3 bg-vintage-cream rounded-lg text-center">
              <div className="text-sm font-medium text-vintage-subtitle mb-1">
                Day {item.date}
              </div>
              <div className="text-lg font-bold text-vintage-gold">
                {formatDayToDate(item.date)}
              </div>
              <div className="text-sm font-semibold text-vintage-title mt-1">
                IDR {item.revenue.toLocaleString('id-ID')}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <span className="text-6xl mb-4 block">📊</span>
          <p className="text-vintage-subtitle text-lg">No daily revenue data available for this month</p>
          <p className="text-vintage-subtitle text-sm mt-2">Revenue data will appear here as transactions are completed</p>
        </div>
      )}
    </div>
  );
}

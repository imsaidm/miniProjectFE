interface RevenueChartsProps {
  monthlyRevenue: { month: string; revenue: number }[];
  yearlyRevenue: { year: string; revenue: number }[];
  dailyRevenue: { date: string; revenue: number }[];
  formatDayToDate: (day: string) => string;
  getMonthName: (monthNumber: number) => string;
}

export default function RevenueCharts({ 
  monthlyRevenue, 
  yearlyRevenue, 
  dailyRevenue, 
  formatDayToDate, 
  getMonthName 
}: RevenueChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Monthly Revenue */}
      <div className="card-vintage p-6">
        <h3 className="text-xl font-bold text-vintage-title mb-4">📈 Monthly Revenue - {new Date().getFullYear()}</h3>
        {monthlyRevenue.length > 0 ? (
          <div className="space-y-3">
            {monthlyRevenue.map((item, index) => (
              <div key={index} className="p-3 bg-vintage-cream rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-vintage-title">
                    {getMonthName(parseInt(item.month))}
                  </span>
                  <span className="text-vintage-gold font-bold">
                    IDR {item.revenue.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <span className="text-4xl mb-4 block">📊</span>
            <p className="text-vintage-subtitle">No monthly revenue data available</p>
          </div>
        )}
      </div>

      {/* Yearly Revenue */}
      <div className="card-vintage p-6">
        <h3 className="text-xl font-bold text-vintage-title mb-4">📊 Yearly Revenue Overview</h3>
        {yearlyRevenue.length > 0 ? (
          <div className="space-y-3">
            {yearlyRevenue.map((item, index) => (
              <div key={index} className="p-3 bg-vintage-cream rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-vintage-title">{item.year}</span>
                  <span className="text-vintage-gold font-bold">
                    IDR {item.revenue.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <span className="text-4xl mb-4 block">📈</span>
            <p className="text-vintage-subtitle">No yearly revenue data available</p>
          </div>
        )}
      </div>
    </div>
  );
}

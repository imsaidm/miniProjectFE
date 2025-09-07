import Link from "next/link";

export default function QuickActions() {
  return (
    <div className="card-vintage p-6">
      <h3 className="text-xl font-bold text-vintage-title mb-4">⚡ Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/dashboard/events"
          className="p-4 bg-vintage-cream rounded-lg hover:bg-vintage-gold/10 transition-colors duration-300 text-center group"
        >
          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">📅</div>
          <h4 className="font-semibold text-vintage-title mb-1">Manage Events</h4>
          <p className="text-sm text-vintage-subtitle">Create, edit, and manage your events</p>
        </Link>

        <Link
          href="/dashboard/vouchers"
          className="p-4 bg-vintage-cream rounded-lg hover:bg-vintage-gold/10 transition-colors duration-300 text-center group"
        >
          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">🎫</div>
          <h4 className="font-semibold text-vintage-title mb-1">Manage Vouchers</h4>
          <p className="text-sm text-vintage-subtitle">Create and manage discount vouchers</p>
        </Link>

        <Link
          href="/dashboard/transactions"
          className="p-4 bg-vintage-cream rounded-lg hover:bg-vintage-gold/10 transition-colors duration-300 text-center group"
        >
          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">💰</div>
          <h4 className="font-semibold text-vintage-title mb-1">View Transactions</h4>
          <p className="text-sm text-vintage-subtitle">Monitor and manage transactions</p>
        </Link>
      </div>
    </div>
  );
}

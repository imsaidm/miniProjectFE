import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-3 group">
      <div className="w-10 h-10 bg-vintage-gold rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <span className="text-2xl font-bold text-white">🎪</span>
      </div>
      <div className="hidden sm:block">
        <h1 className="text-xl font-bold text-vintage-title group-hover:text-vintage-gold transition-colors duration-300">
          EventHub
        </h1>
        <p className="text-xs text-vintage-subtitle">Discover Amazing Events</p>
      </div>
    </Link>
  );
}

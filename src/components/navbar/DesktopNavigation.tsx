import Link from "next/link";
import ClientOnly from "../ClientOnly";

interface DesktopNavigationProps {
  isLoggedIn: boolean;
  userRole: string | null;
  onLogout: () => void;
}

export default function DesktopNavigation({ isLoggedIn, userRole, onLogout }: DesktopNavigationProps) {
  return (
    <div className="hidden md:flex items-center space-x-8">
      <Link 
        href="/" 
        className="text-vintage-body hover:text-vintage-gold transition-colors duration-300 font-medium"
      >
        Events
      </Link>
      
      <ClientOnly fallback={
        <div className="flex items-center space-x-4">
          <div className="skeleton-vintage h-10 w-20"></div>
          <div className="skeleton-vintage h-10 w-24"></div>
        </div>
      }>
        {!isLoggedIn ? (
          <div className="flex items-center space-x-4">
            <Link 
              href="/auth/login" 
              className="btn-vintage-outline px-6 py-2"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/register" 
              className="btn-vintage px-6 py-2"
            >
              Get Started
            </Link>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            {userRole === 'ORGANIZER' && (
              <Link 
                href="/dashboard" 
                className="btn-vintage-secondary px-4 py-2 text-sm"
              >
                Dashboard
              </Link>
            )}
            <Link 
              href="/transactions" 
              className="text-vintage-body hover:text-vintage-gold transition-colors duration-300 font-medium"
            >
              My Tickets
            </Link>
            <Link 
              href="/profile" 
              className="text-vintage-body hover:text-vintage-gold transition-colors duration-300 font-medium"
            >
              Profile
            </Link>
            <button 
              onClick={onLogout}
              className="btn-vintage-outline px-4 py-2 text-sm hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300"
            >
              Sign Out
            </button>
          </div>
        )}
      </ClientOnly>
    </div>
  );
}

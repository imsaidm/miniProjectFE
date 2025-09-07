import Link from "next/link";

interface MobileNavigationProps {
  isMenuOpen: boolean;
  isLoggedIn: boolean;
  userRole: string | null;
  onLogout: () => void;
  onToggleMenu: () => void;
}

export default function MobileNavigation({ 
  isMenuOpen, 
  isLoggedIn, 
  userRole, 
  onLogout, 
  onToggleMenu 
}: MobileNavigationProps) {
  return (
    <div className="md:hidden">
      {/* Mobile menu button */}
      <button
        onClick={onToggleMenu}
        className="text-vintage-title hover:text-vintage-gold transition-colors duration-300"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-vintage-sage shadow-lg z-50">
          <div className="container-vintage py-4 space-y-4">
            <Link 
              href="/" 
              className="block text-vintage-body hover:text-vintage-gold transition-colors duration-300 font-medium"
              onClick={onToggleMenu}
            >
              Events
            </Link>
            
            {!isLoggedIn ? (
              <div className="space-y-2">
                <Link 
                  href="/auth/login" 
                  className="block btn-vintage-outline text-center"
                  onClick={onToggleMenu}
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/register" 
                  className="block btn-vintage text-center"
                  onClick={onToggleMenu}
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {userRole === 'ORGANIZER' && (
                  <Link 
                    href="/dashboard" 
                    className="block btn-vintage-secondary text-center text-sm"
                    onClick={onToggleMenu}
                  >
                    Dashboard
                  </Link>
                )}
                <Link 
                  href="/transactions" 
                  className="block text-vintage-body hover:text-vintage-gold transition-colors duration-300 font-medium"
                  onClick={onToggleMenu}
                >
                  My Tickets
                </Link>
                <Link 
                  href="/profile" 
                  className="block text-vintage-body hover:text-vintage-gold transition-colors duration-300 font-medium"
                  onClick={onToggleMenu}
                >
                  Profile
                </Link>
                <button 
                  onClick={() => {
                    onLogout();
                    onToggleMenu();
                  }}
                  className="w-full btn-vintage-outline text-sm hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

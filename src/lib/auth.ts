export type UserRole = 'CUSTOMER' | 'ORGANIZER';

// Token storage keys - keeping 'token' for compatibility
const TOKEN_KEY = 'token';
const USER_DATA_KEY = 'user_data';

// Token expiration check (JWT tokens typically expire)
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1] || ''));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
  } catch {
    return false; // If we can't parse the token, don't consider it expired
  }
};

// Enhanced token getter with basic validation
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    
    // Only check expiration if token exists
    if (isTokenExpired(token)) {
      clearToken();
      return null;
    }
    
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
}

// Enhanced token setter
export function setToken(token: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.setItem(TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error('Error setting token:', error);
    return false;
  }
}

// Enhanced token clearer
export function clearToken(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
  } catch (error) {
    console.error('Error clearing token:', error);
  }
}

// Enhanced login status checker
export function isLoggedIn(): boolean {
  const token = getToken();
  return !!token;
}

// Enhanced logout function
export function logout(): void {
  clearToken();
  
  // Clear any other auth-related data
  if (typeof window !== 'undefined') {
    // Clear any other auth-related items
    const keysToRemove = Object.keys(localStorage).filter(key => 
      key.startsWith('auth_') || key.startsWith('user_')
    );
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Redirect to home page
    window.location.href = '/';
  }
}

// Enhanced role getter with validation
export function getRoleFromToken(): UserRole | null {
  try {
    const token = getToken();
    if (!token) return null;
    
    const payload = JSON.parse(atob(token.split('.')[1] || ''));
    
    // Validate payload structure
    if (!payload || typeof payload.role !== 'string') {
      return null;
    }
    
    // Validate role value
    if (!['CUSTOMER', 'ORGANIZER'].includes(payload.role)) {
      return null;
    }
    
    return payload.role as UserRole;
  } catch (error) {
    console.error('Error parsing token payload:', error);
    return null;
  }
}

// Get user ID from token
export function getUserIdFromToken(): number | null {
  try {
    const token = getToken();
    if (!token) return null;
    
    const payload = JSON.parse(atob(token.split('.')[1] || ''));
    
    if (!payload || typeof payload.id !== 'number') {
      return null;
    }
    
    return payload.id;
  } catch (error) {
    console.error('Error getting user ID from token:', error);
    return null;
  }
}

// Get user email from token
export function getUserEmailFromToken(): string | null {
  try {
    const token = getToken();
    if (!token) return null;
    
    const payload = JSON.parse(atob(token.split('.')[1] || ''));
    
    if (!payload || typeof payload.email !== 'string') {
      return null;
    }
    
    return payload.email;
  } catch (error) {
    console.error('Error getting user email from token:', error);
    return null;
  }
}

// Check if user has specific role
export function hasRole(requiredRole: UserRole): boolean {
  const userRole = getRoleFromToken();
  return userRole === requiredRole;
}
// Check if user has any of the specified roles
export function hasAnyRole(requiredRoles: UserRole[]): boolean {
  const userRole = getRoleFromToken();
  return requiredRoles.includes(userRole!);
}

// Get token expiration time
export function getTokenExpirationTime(): Date | null {
  try {
    const token = getToken();
    if (!token) return null;
    
    const payload = JSON.parse(atob(token.split('.')[1] || ''));
    
    if (!payload || !payload.exp) {
      return null;
    }
    
    return new Date(payload.exp * 1000);
  } catch (error) {
    console.error('Error getting token expiration time:', error);
    return null;
  }
}

// Check if token will expire soon (within specified minutes)
export function isTokenExpiringSoon(minutes: number = 5): boolean {
  const expirationTime = getTokenExpirationTime();
  if (!expirationTime) return false;
  
  const now = new Date();
  const timeUntilExpiration = expirationTime.getTime() - now.getTime();
  const minutesUntilExpiration = timeUntilExpiration / (1000 * 60);
  
  return minutesUntilExpiration <= minutes;
}

// Refresh token if needed (placeholder for future implementation)
export async function refreshTokenIfNeeded(): Promise<boolean> {
  if (isTokenExpiringSoon(10)) {
    // Token refresh logic can be implemented here when needed
    console.log('Token refresh needed');
    return false;
  }
  
  return true;
}

// Validate token on app startup
export function validateTokenOnStartup(): boolean {
  const token = getToken();
  
  if (!token) {
    return false;
  }
  
  if (isTokenExpired(token)) {
    clearToken();
    return false;
  }
  
  return true;
}

// Get user data from localStorage
export function getUserData(): any {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
}

// Set user data in localStorage
export function setUserData(userData: any): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error('Error setting user data:', error);
  }
}

// Clear all auth-related data
export function clearAllAuthData(): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Clear all auth-related items
    const keysToRemove = Object.keys(localStorage).filter(key => 
      key.startsWith('auth_') || 
      key.startsWith('user_') || 
      key === TOKEN_KEY || 
      key === USER_DATA_KEY
    );
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
}


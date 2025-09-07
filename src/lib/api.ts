import axios from 'axios';

// Prefer NEXT_PUBLIC_API_URL. Otherwise, use relative /api so Next rewrites/proxy can route to backend
const resolvedBaseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';

export const api = axios.create({
  baseURL: resolvedBaseUrl,
  timeout: 30000, // Increased from 10s to 30s
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Add response interceptor to handle 401 and 404 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined') {
      if (error.response?.status === 401) {
        // Clear the invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user_profile_cache');
        // Redirect to login page
        window.location.href = '/auth/login';
      } else if (error.response?.status === 404 && error.config?.url?.includes('/users/profile')) {
        // User profile not found - clear auth data and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user_profile_cache');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;



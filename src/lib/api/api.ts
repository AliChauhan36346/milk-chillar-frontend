import axios from 'axios';
import { isTokenExpired, handleSessionExpired } from '@/lib/auth/tokenUtils';

const DEFAULT_API_URL = 'https://localhost:7013/api';

// Normalize URL: trim whitespace, remove trailing slashes, and ensure /api is present
const rawUrl = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL).trim().replace(/\/+$/, '');
export const API_BASE_URL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;

// Create axios instance with base URL
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30-second timeout to handle free-tier cloud cold starts gracefully
});

// Add request interceptor for authentication & pre-flight expiration checks
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        if (isTokenExpired(token)) {
          // Token is already expired; intercept and redirect immediately without sending a doomed request
          handleSessionExpired(window.location.pathname);
          return Promise.reject(new axios.Cancel('Session expired. Redirecting to login...'));
        }
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling & 401 expiration handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // Handle unauthorized access or expired token detected on failure
    if (status === 401 || (token && isTokenExpired(token))) {
      if (typeof window !== 'undefined') {
        handleSessionExpired(window.location.pathname);
      }
    }

    // Log error for debugging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });

    return Promise.reject(error);
  }
);

export default api;

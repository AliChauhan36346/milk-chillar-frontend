// import axios from 'axios';

// // Create axios instance with base URL
// export const api = axios.create({
//   // baseURL: 'https://localhost:7013/api', // Match the backend URL from login page
//   baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7013/api',
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Add request interceptor for authentication
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Add response interceptor for error handling
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // Handle unauthorized access (e.g., redirect to login)
//       localStorage.removeItem('token');
//       localStorage.removeItem('userInfo');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

import axios from 'axios';

// Create axios instance with base URL
export const api = axios.create({
  //baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://milkchillarapi-production.up.railway.app/api',
  baseURL: 'https://localhost:7013/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
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
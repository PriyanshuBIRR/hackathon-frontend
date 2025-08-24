import axios from 'axios';

// Vite environment variables (note the VITE_ prefix)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 10000;
const ENABLE_LOGGING = import.meta.env.VITE_ENABLE_API_LOGGING === 'true';

// Create axios instance with Vite environment variables
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: parseInt(API_TIMEOUT),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Development logging (only in dev mode)
if (import.meta.env.DEV && ENABLE_LOGGING) {
  api.interceptors.request.use(
    (config) => {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
      return config;
    }
  );

  api.interceptors.response.use(
    (response) => {
      console.log('✅ API Response:', {
        status: response.status,
        data: response.data,
      });
      return response;
    },
    (error) => {
      console.error('❌ API Error:', error.response?.data || error.message);
      return Promise.reject(error);
    }
  );
}

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    
    if (error.response?.status === 500 && import.meta.env.DEV) {
      console.error('Server error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default api;

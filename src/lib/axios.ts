import axios from 'axios';

/**
 * Configured Axios instance for making API requests
 * 
 * Features:
 * - Base URL is set to the current origin
 * - Includes credentials in requests (cookies, etc.)
 * - Sets common headers for JSON requests
 * - Adds request and response interceptors for debugging
 */
const api = axios.create({
  // No need to set baseURL for same-origin API calls
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api; 
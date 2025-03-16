import axios from 'axios';

/**
 * Configured Axios instance for making API requests
 * 
 * Features:
 * - Base URL is set to the current origin
 * - Includes credentials in requests (cookies, etc.)
 * - Sets common headers for JSON requests
 */
const api = axios.create({
  // No need to set baseURL for same-origin API calls
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export default api; 
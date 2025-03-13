import axios from 'axios';

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to handle auth token
apiClient.interceptors.request.use((config) => {
  // You can add auth token here if needed
  return config;
});

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient; 
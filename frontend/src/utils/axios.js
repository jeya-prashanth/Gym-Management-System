import axios from 'axios';
import { toast } from 'react-toastify';

// Default API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      
      if (status === 401) {
        toast.error('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (status === 403) {
        toast.error('You do not have permission to perform this action.');
      } else if (status >= 500) {
        toast.error('Something went wrong. Please try again later.');
      }

      const errorMessage = error.response?.data?.message || 'An error occurred';
      if (errorMessage && status !== 401 && status !== 403) {
        toast.error(errorMessage);
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

export default api;

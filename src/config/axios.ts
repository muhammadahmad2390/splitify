import axios from 'axios';
import API_CONFIG from './api';
import { useAuthStore } from '@/store/AuthStore';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(config => {
  const token = useAuthStore.getState().token; // sync, no await needed
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      const { isAuthenticated, logout } = useAuthStore.getState();
      if (isAuthenticated) {
        // ← only logout if user was already logged in
        logout();
      }
    }
    return Promise.reject(error);
  },
);

export default api;

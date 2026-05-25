import axios from 'axios';

const BACKEND_URL = 'https://dailyflow-backend-dqou.onrender.com';

const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request automatically
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('dailyflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const authPages = ['/login', '/signup', '/forgot-password'];
        const isAuthPage = authPages.some(page =>
          window.location.pathname.startsWith(page)
        );
        if (!isAuthPage) {
          localStorage.removeItem('dailyflow_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
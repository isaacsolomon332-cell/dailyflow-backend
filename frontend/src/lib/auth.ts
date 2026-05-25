import api from './api';
import { LoginCredentials, SignupCredentials, AuthResponse, User } from '@/types';

const TOKEN_KEY = 'dailyflow_token';

export const tokenStorage = {
  get: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  set: (token: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  },
  remove: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
  },
};

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/login', {
      email: credentials.usernameOrEmail,
      password: credentials.password,
    });
    if (response.data.token) {
      tokenStorage.set(response.data.token);
    }
    return response.data;
  },

  signup: async (credentials: SignupCredentials): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/signup', {
      fullName: credentials.fullName,
      email: credentials.email,
      username: credentials.username,
      phoneNumber: credentials.phoneNumber,
      password: credentials.password,
      confirmPassword: credentials.confirmPassword,
    });
    if (response.data.token) {
      tokenStorage.set(response.data.token);
    }
    return response.data;
  },

  logout: async (): Promise<void> => {
    tokenStorage.remove();
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/api/auth/me');
    return response.data.data.user;
  },

  checkAuth: async (): Promise<User> => {
    const token = tokenStorage.get();
    if (!token) throw new Error('No token');
    const response = await api.get('/api/auth/me', { timeout: 5000 });
    return response.data.data.user;
  },

  checkAvailability: async (field: 'email' | 'username', value: string): Promise<boolean> => {
    try {
      const response = await api.get('/api/auth/check-availability', {
        params: { [field]: value },
      });
      return response.data.data.available;
    } catch {
      return true;
    }
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/api/auth/forgot-password', { email });
  },

  verifyOtp: async (email: string, otp: string): Promise<string> => {
    const response = await api.post('/api/auth/verify-otp', { email, otp });
    return response.data.resetToken;
  },

  resetPassword: async (
    email: string,
    otp: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<void> => {
    await api.post('/api/auth/reset-password', {
      email, otp, newPassword, confirmPassword,
    });
  },
};
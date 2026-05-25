'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@/types';
import { authService } from './auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  signup: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const user = await authService.checkAuth();
      setUser(user);
    } catch {
      if (process.env.NODE_ENV === 'development') {
        setUser(null);
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }

  async function login(usernameOrEmail: string, password: string) {
    const response = await authService.login({ usernameOrEmail, password });
    if (response.data?.user) {
      setUser(response.data.user);
    } else if (response.token) {
      const user = await authService.checkAuth();
      setUser(user);
    }
  }

  async function signup(credentials: any) {
    const response = await authService.signup(credentials);
    if (response.data?.user) {
      setUser(response.data.user);
    } else if (response.token) {
      const user = await authService.checkAuth();
      setUser(user);
    }
  }

  async function logout() {
    authService.logout();
    setUser(null);
  }

  async function refreshUser() {
    await checkUser();
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <div style={{
          width: '48px', height: '48px',
          border: '3px solid rgba(255,255,255,0.3)',
          borderTop: '3px solid white',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
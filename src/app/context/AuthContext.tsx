import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { apiRequest } from '../lib/api';

export type UserRole = 'nasabah' | 'admin' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'nasabah' | 'admin';
  phone?: string | null;
  address?: string | null;
  points?: number;
  roomNumber?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, role: 'nasabah' | 'admin') => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  resetPassword: (email: string, newPassword: string) => Promise<boolean>;
  loginWithGoogle: (credential: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  role: 'nasabah' | 'admin';
}

interface AuthApiResponse {
  message: string;
  token: string;
  user: User;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_STORAGE_KEY = 'milos_auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as { user: User; token: string };
      setUser(parsed.user);
      setToken(parsed.token);
    } catch (_error) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  const persistAuth = (payload: AuthApiResponse) => {
    setUser(payload.user);
    setToken(payload.token);
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        user: payload.user,
        token: payload.token,
      })
    );
  };

  const login = async (
    email: string,
    password: string,
    role: 'nasabah' | 'admin'
  ): Promise<boolean> => {
    const endpoint = role === 'admin' ? '/auth/admin/login' : '/auth/login';
    const payload = await apiRequest<AuthApiResponse>(endpoint, {
      method: 'POST',
      body: { email, password, role },
    });
    persistAuth(payload);
    return true;
  };

  const register = async (_data: RegisterData): Promise<boolean> => {
    await apiRequest<{ message: string; user: User }>('/auth/register', {
      method: 'POST',
      body: _data,
    });
    return true;
  };

  const resetPassword = async (email: string, newPassword: string): Promise<boolean> => {
    await apiRequest<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: { email, newPassword },
    });
    return true;
  };

  const loginWithGoogle = async (credential: string): Promise<boolean> => {
    const payload = await apiRequest<AuthApiResponse>('/auth/google/login', {
      method: 'POST',
      body: { credential, role: 'nasabah' },
    });
    persistAuth(payload);
    return true;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      register,
      resetPassword,
      loginWithGoogle,
      logout,
      isAuthenticated: !!user && !!token,
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

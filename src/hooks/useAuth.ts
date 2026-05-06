import { useState, useEffect } from 'react';
import { User } from '../types';

const API_BASE = '/api';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const setAuth = (token: string, userData: User) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('intellihealth_user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  useEffect(() => {
    const saved = localStorage.getItem('intellihealth_user');
    if (saved) {
      setUser(JSON.parse(saved));
      setIsAuthenticated(true);
    }
  }, []);

  const loginWithEmail = async (email: string, password: string): Promise<User> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    const userData: User = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      role: data.user.role,
      avatar: data.user.avatar,
      walletAddress: data.user.walletAddress,
      subscription: data.user.subscription ?? undefined,
    };
    setAuth(data.token, userData);
    return userData;
  };

  const register = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
    birthday?: string,
    hobby?: string
  ): Promise<User> => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        password,
        firstName: (firstName || '').trim() || undefined,
        lastName: (lastName || '').trim() || undefined,
        birthday: (birthday || '').trim() || undefined,
        hobby: (hobby || '').trim() || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    const userData: User = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      role: data.user.role,
      avatar: data.user.avatar,
      walletAddress: data.user.walletAddress,
      subscription: data.user.subscription ?? undefined,
    };
    setAuth(data.token, userData);
    return userData;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('intellihealth_user');
    localStorage.removeItem('auth_token');
  };

  const refreshUser = () => {
    const saved = localStorage.getItem('intellihealth_user');
    if (saved) setUser(JSON.parse(saved));
  };

  return { user, isAuthenticated, loginWithEmail, register, logout, refreshUser };
}

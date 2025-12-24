import { useState, useEffect } from 'react';
import { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('intellihealth_user');
    if (saved) {
      setUser(JSON.parse(saved));
      setIsAuthenticated(true);
    }
  }, []);

  const loginWithWallet = async (walletAddress: string) => {
    await new Promise((r) => setTimeout(r, 1000));
    const mockUser: User = {
      id: walletAddress.toLowerCase(),
      email: '',
      name: `User ${walletAddress.slice(2, 8)}`,
      role: 'patient',
      walletAddress,
      subscription: {
        tier: 'free',
        status: 'active',
        startDate: new Date().toISOString(),
        autoRenew: false,
      },
    };
    setUser(mockUser);
    setIsAuthenticated(true);
    localStorage.setItem('intellihealth_user', JSON.stringify(mockUser));
    return mockUser;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('intellihealth_user');
  };

  const refreshUser = () => {
    const saved = localStorage.getItem('intellihealth_user');
    if (saved) setUser(JSON.parse(saved));
  };

  return { user, isAuthenticated, loginWithWallet, logout, refreshUser };
}

// lib/auth/AuthContext.tsx
'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { isTokenExpired, clearAuthSession, handleSessionExpired } from './tokenUtils';

type User = {
  userId: number;
  username: string;
  role: string;
  tenantId: number;
  permissions: string[];
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  isAuthenticated: () => boolean;
  isInitialized: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const logout = useCallback(() => {
    clearAuthSession();
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('token');
      const userInfo = localStorage.getItem('userInfo');

      if (storedToken && userInfo) {
        if (isTokenExpired(storedToken)) {
          clearAuthSession();
          setToken(null);
          setUser(null);
        } else {
          try {
            setToken(storedToken);
            setUser(JSON.parse(userInfo));
          } catch (e) {
            console.error('Failed to parse user info:', e);
            clearAuthSession();
          }
        }
      }
      setIsInitialized(true);
    };

    initializeAuth();
  }, []);

  // Monitor session expiration upon tab focus, visibility change, and periodic intervals
  useEffect(() => {
    if (!token) return;

    const checkSession = () => {
      if (isTokenExpired(token)) {
        logout();
        handleSessionExpired();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkSession();
      }
    };

    window.addEventListener('focus', checkSession);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Periodic check every 45 seconds
    const interval = setInterval(checkSession, 45000);

    return () => {
      window.removeEventListener('focus', checkSession);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [token, logout]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('userInfo', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const hasPermission = (permission: string) => {
    return user?.permissions?.includes(permission) || false;
  };

  const isAuthenticated = () => {
    return !!token && !!user && !isTokenExpired(token);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      hasPermission, 
      isAuthenticated,
      isInitialized
    }}>
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
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CanonicalRole, normalizeRole, UserStatus } from '../lib/rbac';

export type Role = CanonicalRole | null;

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: Exclude<Role, null>;
  status?: UserStatus;
  avatarUrl?: string;
  requiresPasswordChange?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  role: Role;
  token?: string;
  refreshToken?: string;
  isLoading: boolean;
  login: (user: UserProfile, token: string, refreshToken?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'skilldna_auth';

const getStoredAuth = (): { user: UserProfile | null; token?: string; refreshToken?: string } => {
  if (typeof window === 'undefined') {
    return { user: null, token: undefined, refreshToken: undefined };
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as { user: UserProfile; token: string; refreshToken?: string };
      if (parsed?.user && parsed?.token) {
        const normalizedRole = normalizeRole(parsed.user.role, parsed.user.email);
        return {
          user: { ...parsed.user, role: normalizedRole as Exclude<Role, null> },
          token: parsed.token,
          refreshToken: parsed.refreshToken,
        };
      }
    }
  } catch (err) {
    console.warn('Failed to parse saved auth state from localStorage:', err);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
  return { user: null, token: undefined, refreshToken: undefined };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState(getStoredAuth);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Re-verify localStorage once mounted in case of multi-tab updates
    const stored = getStoredAuth();
    if (stored.user && !authState.user) {
      setAuthState(stored);
    }
  }, []);

  const login = (newUser: UserProfile, newToken: string, newRefreshToken?: string) => {
    const normalizedRole = normalizeRole(newUser.role, newUser.email);
    const userWithNormalizedRole = { ...newUser, role: normalizedRole as Exclude<Role, null> };
    setAuthState({
      user: userWithNormalizedRole,
      token: newToken,
      refreshToken: newRefreshToken,
    });
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ user: userWithNormalizedRole, token: newToken, refreshToken: newRefreshToken })
      );
    } catch (e) {
      console.error('Failed to persist auth to localStorage:', e);
    }
  };

  const logout = () => {
    setAuthState({ user: null, token: undefined, refreshToken: undefined });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        role: authState.user?.role ?? null,
        token: authState.token,
        refreshToken: authState.refreshToken,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

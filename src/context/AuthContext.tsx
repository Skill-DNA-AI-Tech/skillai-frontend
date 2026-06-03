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
  login: (user: UserProfile, token: string, refreshToken?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'skilldna_auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [refreshToken, setRefreshToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { user: UserProfile; token: string; refreshToken?: string };
        const normalizedRole = normalizeRole(parsed.user.role);
        setUser({ ...parsed.user, role: normalizedRole as Exclude<Role, null> });
        setToken(parsed.token);
        setRefreshToken(parsed.refreshToken);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const login = (newUser: UserProfile, newToken: string, newRefreshToken?: string) => {
    const normalizedRole = normalizeRole(newUser.role);
    const userWithNormalizedRole = { ...newUser, role: normalizedRole as Exclude<Role, null> };
    setUser(userWithNormalizedRole);
    setToken(newToken);
    setRefreshToken(newRefreshToken);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: userWithNormalizedRole, token: newToken, refreshToken: newRefreshToken }));
  };

  const logout = () => {
    setUser(null);
    setToken(undefined);
    setRefreshToken(undefined);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role ?? null, token, refreshToken, login, logout }}>
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

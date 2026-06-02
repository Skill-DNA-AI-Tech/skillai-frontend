import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Role = 'STUDENT' | 'HR' | 'ADMIN' | 'MAIN_ADMIN' | 'student' | 'recruiter' | 'admin' | 'employee' | null;

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: Exclude<Role, null>;
  avatarUrl?: string;
  requiresPasswordChange?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  role: Role;
  token?: string;
  login: (user: UserProfile, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'skilldna_auth';

const normalizeRole = (role?: string | null): Role => {
  if (!role) return null;
  const original = role.trim();
  const upper = original.toUpperCase();
  if (original === 'student' || upper === 'STUDENT') return 'STUDENT';
  if (original === 'admin' || original === 'employee' || original === 'staff' || upper === 'ADMIN') return 'ADMIN';
  if (original === 'recruiter' || upper === 'HR') return 'HR';
  if (upper === 'MAIN_ADMIN') return 'MAIN_ADMIN';
  return 'STUDENT';
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { user: UserProfile; token: string };
        const normalizedRole = normalizeRole(parsed.user.role);
        setUser({ ...parsed.user, role: normalizedRole as Exclude<Role, null> });
        setToken(parsed.token);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const login = (newUser: UserProfile, newToken: string) => {
    const normalizedRole = normalizeRole(newUser.role);
    const userWithNormalizedRole = { ...newUser, role: normalizedRole as Exclude<Role, null> };
    setUser(userWithNormalizedRole);
    setToken(newToken);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: userWithNormalizedRole, token: newToken }));
  };

  const logout = () => {
    setUser(null);
    setToken(undefined);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role ?? null, token, login, logout }}>
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


import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CanonicalRole, normalizeRole, UserStatus } from '../lib/rbac';
import { apiRequest } from '../lib/api';

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
    const stored = getStoredAuth();
    if (!stored.token) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const verifySession = async () => {
      try {
        const res = await apiRequest<any>('/auth/current-user', {
          token: stored.token,
        }, false);
        if (isMounted && res && res.email) {
          const normalizedRole = normalizeRole(res.role, res.email);
          const validatedUser: UserProfile = {
            ...res,
            _id: res._id || res.id,
            role: normalizedRole as Exclude<Role, null>,
          };
          setAuthState((prev) => ({
            ...prev,
            user: validatedUser,
            token: stored.token,
            refreshToken: stored.refreshToken,
          }));
          try {
            localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify({ user: validatedUser, token: stored.token, refreshToken: stored.refreshToken })
            );
          } catch {}
        }
      } catch (err: any) {
        // If 401 Unauthorized, token has genuinely expired!
        if (err?.response?.status === 401 || err?.message?.includes('401') || err?.message?.includes('expired')) {
          console.warn('Session expired, clearing authentication:', err);
          if (isMounted) {
            logout();
          }
        } else {
          // Transient network hiccup or backend cold-boot: maintain cached session
          console.warn('Session verification delayed, maintaining cached session state:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    verifySession();
    return () => {
      isMounted = false;
    };
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

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { api, getToken, setToken } from '@/lib/api';
import type { User, Workspace } from '@/lib/types';

interface AuthContextValue {
  user: User | null;
  workspace: Workspace | null;
  /** True until the stored token has been checked against the API. */
  loading: boolean;
  loginAsGuest: () => Promise<void>;
  logout: () => void;
  patchUser: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore the session on mount. A stored token can still be rejected (the
  // guest's workspace may have been cleaned up), so it is verified, not trusted.
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      if (!getToken()) {
        setLoading(false);
        return;
      }

      try {
        const session = await api.me();
        if (cancelled) return;
        setUser(session.user);
        setWorkspace(session.workspace);
      } catch {
        if (cancelled) return;
        setToken(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const loginAsGuest = useCallback(async () => {
    const session = await api.loginAsGuest();
    setToken(session.accessToken);
    setUser(session.user);
    setWorkspace(session.workspace);
    router.push('/tasks');
  }, [router]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setWorkspace(null);
    router.push('/login');
  }, [router]);

  const patchUser = useCallback((patch: Partial<User>) => {
    setUser((current) => (current ? { ...current, ...patch } : current));
  }, []);

  const value = useMemo(
    () => ({ user, workspace, loading, loginAsGuest, logout, patchUser }),
    [user, workspace, loading, loginAsGuest, logout, patchUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { LogoMark } from '@/components/brand/logo';

/**
 * Entry point. The session lives in localStorage, so the decision can only be
 * made on the client — this renders a neutral splash until it knows.
 */
export default function IndexPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? '/tasks' : '/login');
  }, [loading, user, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface">
      <LogoMark className="h-8 w-8 animate-pulse" />
      <span className="sr-only">Loading</span>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { AppShell } from '@/components/shell/app-shell';
import { LogoMark } from '@/components/brand/logo';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface">
        <LogoMark className="h-8 w-8 animate-pulse" />
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}

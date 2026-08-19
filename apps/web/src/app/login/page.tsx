'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Wordmark } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/auth-provider';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, loginAsGuest } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Someone arriving with a live session shouldn't sit on the login screen.
  useEffect(() => {
    if (!loading && user) router.replace('/tasks');
  }, [loading, user, router]);

  async function handleGuestLogin() {
    setSubmitting(true);
    setError(null);
    try {
      await loginAsGuest();
    } catch {
      setError('Could not start a guest session. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-surface px-4 py-10">
      <Wordmark className="mb-6" />

      <div className="w-full max-w-[340px] rounded-xl border border-line bg-surface p-6 shadow-[var(--shadow-card)]">
        <h1 className="text-center text-[17px] font-semibold tracking-tight text-ink">
          Let&apos;s get back on track
        </h1>
        <p className="mt-1 text-center text-[12px] text-ink-muted">
          Enter your email below to login to your account.
        </p>

        <div className="mt-5 space-y-2.5">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleGuestLogin}
            disabled={submitting}
          >
            {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {submitting ? 'Setting up your workspace' : 'Continue as Guest'}
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            disabled
            title="Google sign-in is not part of this assessment scope"
          >
            <GoogleGlyph className="h-3.5 w-3.5" />
            Login with Google
          </Button>
        </div>

        {error && (
          <p role="alert" className="mt-3 text-center text-[12px] text-danger">
            {error}
          </p>
        )}
      </div>

      <p className="mt-4 max-w-[220px] text-center text-[11px] leading-relaxed text-ink-subtle">
        By clicking continue, you agree to our{' '}
        <a href="#" className="underline underline-offset-2 hover:text-ink-muted">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="#" className="underline underline-offset-2 hover:text-ink-muted">
          Privacy Policy
        </a>
        .
      </p>
    </main>
  );
}

function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.87Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.91l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.28v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.28a12 12 0 0 0 0 10.76l3.99-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.62l3.99 3.09C6.22 6.87 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

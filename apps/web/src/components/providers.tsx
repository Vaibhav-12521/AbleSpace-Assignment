'use client';

import { useState } from 'react';
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { AuthProvider } from '@/components/auth/auth-provider';
import { Toaster } from '@/components/ui/toaster';
import { ConfirmHost } from '@/components/ui/confirm-host';
import { ApiError } from '@/lib/api';
import { pushToast } from '@/lib/toast';

function describe(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return 'Your session expired. Please sign in again.';
    }
    return error.message;
  }
  if (error instanceof Error && error.message === 'Failed to fetch') {
    return 'Could not reach the server. Check your connection.';
  }
  return error instanceof Error ? error.message : 'Something went wrong.';
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
        mutationCache: new MutationCache({
          onError: (error) => {
            pushToast({
              title: "That didn't save",
              description: describe(error),
              variant: 'error',
            });
          },
        }),
        queryCache: new QueryCache({
          onError: (error, query) => {
            if (query.state.data === undefined) return;
            pushToast({
              title: "Couldn't refresh",
              description: describe(error),
              variant: 'error',
            });
          },
        }),
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          {children}
          <Toaster />
          <ConfirmHost />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import * as Dialog from '@radix-ui/react-dialog';
import { ChevronRight, PanelLeft } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Sidebar, SidebarContent } from './sidebar';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface ShellContextValue {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setBreadcrumbs: (items: BreadcrumbItem[] | null) => void;
}

const ShellContext = createContext<ShellContextValue | null>(null);

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error('useShell must be used inside <AppShell>');
  return ctx;
}

/**
 * Lets a page publish breadcrumbs into the shell header (screen 12) without
 * the layout needing to know which route is rendering.
 *
 * Takes plain data, not JSX: a JSX argument would be a fresh object on every
 * render, so the effect would re-run forever. Serialising the items gives the
 * effect a value that only changes when the crumbs actually change.
 */
export function useBreadcrumbs(items: BreadcrumbItem[]) {
  const { setBreadcrumbs } = useShell();
  const serialised = JSON.stringify(items);

  useEffect(() => {
    setBreadcrumbs(JSON.parse(serialised) as BreadcrumbItem[]);
    return () => setBreadcrumbs(null);
  }, [serialised, setBreadcrumbs]);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  // Desktop collapse and the mobile drawer are separate concerns: collapsing
  // hides a persistent rail, the drawer overlays the page.
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[] | null>(null);

  return (
    <ShellContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar: () => setSidebarOpen((open) => !open),
        setBreadcrumbs,
      }}
    >
      <div className="flex h-dvh overflow-hidden bg-surface">
        <Sidebar
          className={cn(
            'hidden transition-[width] duration-200 md:block',
            !sidebarOpen && 'md:hidden',
          )}
        />

        <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fade-animate fixed inset-0 z-40 bg-[var(--overlay)] md:hidden" />
            <Dialog.Content
              className="fixed inset-y-0 left-0 z-50 w-[260px] border-r border-line bg-sidebar outline-none md:hidden"
              aria-describedby={undefined}
            >
              <Dialog.Title className="sr-only">Navigation</Dialog.Title>
              <SidebarContent onNavigate={() => setDrawerOpen(false)} />
            </Dialog.Content>
          </Dialog.Portal>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex h-12 shrink-0 items-center gap-2 border-b border-line px-3">
              <Dialog.Trigger
                aria-label="Open navigation"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink md:hidden"
              >
                <PanelLeft className="h-4 w-4" />
              </Dialog.Trigger>

              <button
                type="button"
                aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                aria-expanded={sidebarOpen}
                onClick={() => setSidebarOpen((open) => !open)}
                className="hidden h-7 w-7 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink md:inline-flex"
              >
                <PanelLeft className="h-4 w-4" />
              </button>

              <div className="min-w-0 flex-1">
                {breadcrumbs && breadcrumbs.length > 0 && (
                  <nav
                    aria-label="Breadcrumb"
                    className="flex min-w-0 items-center gap-1 text-[13px] text-ink-muted"
                  >
                    {breadcrumbs.map((crumb, index) => (
                      <span
                        key={`${crumb.label}-${index}`}
                        className="flex min-w-0 items-center gap-1"
                      >
                        {index > 0 && (
                          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                        )}
                        {crumb.href ? (
                          <Link
                            href={crumb.href}
                            className="truncate transition-colors hover:text-ink"
                          >
                            {crumb.label}
                          </Link>
                        ) : (
                          <span className="truncate text-ink">{crumb.label}</span>
                        )}
                      </span>
                    ))}
                  </nav>
                )}
              </div>
            </header>

            <main className="min-h-0 flex-1 overflow-auto">{children}</main>
          </div>
        </Dialog.Root>
      </div>
    </ShellContext.Provider>
  );
}

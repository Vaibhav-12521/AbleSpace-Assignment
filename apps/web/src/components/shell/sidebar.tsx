'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Briefcase, ChevronDown, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/cn';
import { WorkspaceMenu } from './workspace-menu';

const NAV = [
  { href: '/tasks', label: 'Tasks', icon: LayoutGrid },
  { href: '/projects', label: 'Projects', icon: Briefcase },
];

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [workspaceOpen, setWorkspaceOpen] = useState(true);

  return (
    <div className="flex h-full flex-col gap-1 px-2 py-2.5">
      <WorkspaceMenu />

      <div className="mt-2">
        <button
          type="button"
          onClick={() => setWorkspaceOpen((open) => !open)}
          className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-[12px] font-medium text-ink-muted transition-colors hover:text-ink"
        >
          Workspace
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 transition-transform duration-150',
              !workspaceOpen && '-rotate-90',
            )}
          />
        </button>

        {workspaceOpen && (
          <nav className="mt-1 space-y-0.5">
            {NAV.map((item) => {
              const Icon = item.icon;

              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] transition-colors',
                    active
                      ? 'bg-surface-subtle font-medium text-ink'
                      : 'text-ink-muted hover:bg-surface-hover hover:text-ink',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}

export function Sidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        'w-[250px] shrink-0 border-r border-line bg-sidebar',
        className,
      )}
    >
      <SidebarContent />
    </aside>
  );
}

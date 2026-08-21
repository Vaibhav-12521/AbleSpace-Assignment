'use client';

import { useRouter } from 'next/navigation';
import { ChevronsUpDown, LogOut, Moon, Settings, Sun, SunMedium } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar } from '@/components/ui/avatar';
import { useTheme } from '@/components/theme/theme-provider';
import { useAuth } from '@/components/auth/auth-provider';
import { COLOR_MODE_SWATCHES, COLOR_MODES, THEMES } from '@/lib/theme';
import { cn } from '@/lib/cn';

const THEME_ICONS = { light: Sun, dark: Moon } as const;
const THEME_LABELS = { light: 'Light', dark: 'Dark' } as const;

const COLOR_MODE_LABELS: Record<(typeof COLOR_MODES)[number], string> = {
  amber: 'Amber',
  blue: 'Blue',
  pink: 'Pink',
  rose: 'Rose',
  emerald: 'Emerald',
  black: 'Black',
};

export function WorkspaceMenu({ collapsed = false }: { collapsed?: boolean }) {
  const router = useRouter();
  const { user, workspace, logout } = useAuth();
  const { theme, colorMode, setTheme, setColorMode } = useTheme();

  if (!user || !workspace) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-surface-hover data-[state=open]:bg-surface-hover',
          collapsed && 'justify-center px-0',
        )}
      >
        <Avatar name={workspace.name} src={user.avatarUrl} size="md" />
        {!collapsed && (
          <>
            <span className="flex-1 truncate text-[13px] font-medium text-ink">
              {workspace.name}
            </span>
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
          </>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[230px]" align="start">
        <div className="flex flex-col items-center gap-1 px-2 py-3">
          <Avatar name={user.name} src={user.avatarUrl} size="xl" />
          <span className="mt-1 text-[13px] font-medium text-ink">
            {user.name}
          </span>
          <span className="text-[11px] text-ink-muted">{user.email}</span>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <SunMedium />
            Change Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-[140px]">
            <DropdownMenuLabel>Theme</DropdownMenuLabel>
            {THEMES.map((option) => {
              const Icon = THEME_ICONS[option];
              return (
                <DropdownMenuRadioItem
                  key={option}
                  checked={theme === option}
                  onSelect={(event) => {
                    event.preventDefault();
                    setTheme(option);
                  }}
                >
                  <Icon />
                  {THEME_LABELS[option]}
                </DropdownMenuRadioItem>
              );
            })}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span
              className="h-3.5 w-3.5 rounded-[3px]"
              style={{ backgroundColor: COLOR_MODE_SWATCHES[colorMode] }}
            />
            Color Mode
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-[140px]">
            <DropdownMenuLabel>Color Mode</DropdownMenuLabel>
            {COLOR_MODES.map((option) => (
              <DropdownMenuRadioItem
                key={option}
                checked={colorMode === option}
                onSelect={(event) => {
                  event.preventDefault();
                  setColorMode(option);
                }}
              >
                <span
                  className="h-3.5 w-3.5 rounded-[3px]"
                  style={{ backgroundColor: COLOR_MODE_SWATCHES[option] }}
                />
                {COLOR_MODE_LABELS[option]}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem onSelect={() => router.push('/settings')}>
          <Settings />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={logout}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Palette, Pencil, Search, SunMedium, User } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { useTheme } from '@/components/theme/theme-provider';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { FieldInput, Input } from '@/components/ui/input';
import { LogoMark } from '@/components/brand/logo';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import { COLOR_MODES, COLOR_MODE_SWATCHES, THEMES } from '@/lib/theme';

const SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'theme', label: 'Theme', icon: SunMedium },
  { id: 'color', label: 'Color', icon: Palette },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading, logout, patchUser } = useAuth();
  const [section, setSection] = useState<SectionId>('profile');
  const [query, setQuery] = useState('');

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

  const visible = SECTIONS.filter((item) =>
    item.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className="flex min-h-dvh bg-canvas">
      <aside className="hidden w-[250px] shrink-0 border-r border-line bg-sidebar px-2 py-3 md:block">
        <Link
          href="/tasks"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] text-ink transition-colors hover:bg-surface-hover"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to app
        </Link>

        <div className="relative mt-3">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            aria-label="Search settings"
            className="pl-8"
          />
        </div>

        <nav className="mt-3 space-y-0.5">
          {visible.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                aria-current={section === item.id ? 'true' : undefined}
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] transition-colors',
                  section === item.id
                    ? 'bg-surface-subtle font-medium text-ink'
                    : 'text-ink-muted hover:bg-surface-hover hover:text-ink',
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="min-w-0 flex-1 overflow-auto px-4 py-8 sm:px-8">

        <div className="mb-6 flex items-center gap-1.5 md:hidden">
          <Link
            href="/tasks"
            className="mr-1 inline-flex h-8 items-center gap-1.5 rounded-lg border border-line px-2 text-[13px] text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>
          {SECTIONS.map((item) => (
            <Button
              key={item.id}
              size="sm"
              variant={section === item.id ? 'primary' : 'outline'}
              onClick={() => setSection(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </div>

        <div className="mx-auto max-w-[560px]">
          {section === 'profile' && (
            <ProfileSection user={user} onPatch={patchUser} onLogout={logout} />
          )}
          {section === 'theme' && <ThemeSection />}
          {section === 'color' && <ColorSection />}
        </div>
      </main>
    </div>
  );
}

function ProfileSection({
  user,
  onPatch,
  onLogout,
}: {
  user: { name: string; email: string; title?: string | null; username?: string | null; avatarUrl?: string | null };
  onPatch: (patch: Record<string, string>) => void;
  onLogout: () => void;
}) {
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save(field: 'name' | 'title' | 'username', value: string) {
    setSaving(field);
    setError(null);
    try {
      const updated = await api.updateProfile({ [field]: value });
      onPatch({ [field]: updated[field] ?? '' });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save');
    } finally {
      setSaving(null);
    }
  }

  return (
    <>
      <h1 className="mb-4 text-[18px] font-semibold tracking-tight text-ink">
        Profile
      </h1>

      <div className="rounded-xl border border-line bg-surface px-4">
        <Field label="Profile picture">
          <Avatar name={user.name} src={user.avatarUrl} size="lg" />
        </Field>

        <Field label="Email">
          <span className="flex items-center gap-2 text-[13px] text-ink-muted">
            {user.email}
            <Pencil className="h-3 w-3" />
          </span>
        </Field>

        <Field label="Full name">
          <FieldInput
            defaultValue={user.name}
            aria-label="Full name"
            disabled={saving === 'name'}
            onBlur={(event) => {
              const value = event.target.value.trim();
              if (value && value !== user.name) void save('name', value);
            }}
          />
        </Field>

        <Field label="Title" hint="Your job title or role">
          <FieldInput
            defaultValue={user.title ?? ''}
            placeholder="Designer"
            aria-label="Title"
            disabled={saving === 'title'}
            onBlur={(event) => {
              const value = event.target.value.trim();
              if (value !== (user.title ?? '')) void save('title', value);
            }}
          />
        </Field>

        <Field
          label="Username"
          hint="One word, like a nickname or first name"
          last
        >
          <FieldInput
            defaultValue={user.username ?? ''}
            placeholder="Dexuser"
            aria-label="Username"
            disabled={saving === 'username'}
            onBlur={(event) => {
              const value = event.target.value.trim();
              if (value !== (user.username ?? '')) void save('username', value);
            }}
          />
        </Field>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-[12px] text-danger">
          {error}
        </p>
      )}

      <h2 className="mt-8 mb-4 text-[15px] font-semibold tracking-tight text-ink">
        Workspace access
      </h2>

      <div className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface px-4 py-4">
        <p className="text-[13px] text-ink-muted">
          Remove yourself from the workspace
        </p>
        <Button variant="danger" size="md" onClick={onLogout}>
          Leave Workspace
        </Button>
      </div>
    </>
  );
}

function ThemeSection() {
  const { theme, setTheme } = useTheme();

  return (
    <>
      <h1 className="mb-4 text-[18px] font-semibold tracking-tight text-ink">
        Theme
      </h1>
      <div className="rounded-xl border border-line bg-surface px-4">
        <Field label="Appearance" hint="Applies to this browser" last>
          <div className="flex gap-1.5">
            {THEMES.map((option) => (
              <Button
                key={option}
                size="md"
                variant={theme === option ? 'primary' : 'outline'}
                onClick={() => setTheme(option)}
                className="capitalize"
              >
                {option}
              </Button>
            ))}
          </div>
        </Field>
      </div>
    </>
  );
}

function ColorSection() {
  const { colorMode, setColorMode } = useTheme();

  return (
    <>
      <h1 className="mb-4 text-[18px] font-semibold tracking-tight text-ink">
        Color
      </h1>
      <div className="rounded-xl border border-line bg-surface px-4">
        <Field label="Accent" hint="Used for selected and active states" last>
          <div className="flex flex-wrap gap-1.5">
            {COLOR_MODES.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setColorMode(option)}
                aria-pressed={colorMode === option}
                className={cn(
                  'inline-flex h-8 items-center gap-1.5 rounded-lg border px-2 text-[13px] capitalize transition-colors',
                  colorMode === option
                    ? 'border-ink text-ink'
                    : 'border-line text-ink-muted hover:text-ink',
                )}
              >
                <span
                  className="h-3.5 w-3.5 rounded-[3px]"
                  style={{ backgroundColor: COLOR_MODE_SWATCHES[option] }}
                />
                {option}
              </button>
            ))}
          </div>
        </Field>
      </div>
    </>
  );
}

function Field({
  label,
  hint,
  last,
  children,
}: {
  label: string;
  hint?: string;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 py-4',
        !last && 'border-b border-line-subtle',
      )}
    >
      <div className="min-w-0">
        <p className="text-[13px] text-ink">{label}</p>
        {hint && <p className="text-[11px] text-ink-muted">{hint}</p>}
      </div>
      <div className="w-full max-w-[220px] shrink-0 text-right">{children}</div>
    </div>
  );
}

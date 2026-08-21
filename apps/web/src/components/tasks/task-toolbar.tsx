'use client';

import { useEffect, useRef, useState } from 'react';
import { LayoutGrid, List, ListFilter, Plus, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/cn';
import {
  FIELD_KEYS,
  FIELD_LABELS,
  type FieldKey,
  type ViewMode,
} from '@/hooks/use-view-preferences';

export interface TaskToolbarProps {
  title: string;
  search: string;
  onSearchChange: (value: string) => void;
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  fields: Record<FieldKey, boolean>;
  onFieldChange: (key: FieldKey, value: boolean) => void;
  onAdd: () => void;
  addLabel?: string;

  filterContent?: React.ReactNode;

  showModeSwitch?: boolean;
}

export function TaskToolbar({
  title,
  search,
  onSearchChange,
  mode,
  onModeChange,
  fields,
  onFieldChange,
  onAdd,
  addLabel = 'Add Task',
  filterContent,
  showModeSwitch = true,
}: TaskToolbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        setSearchOpen(true);
        requestAnimationFrame(() => inputRef.current?.focus());
      }
      if (event.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
        onSearchChange('');
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [searchOpen, onSearchChange]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6">
      <h1 className="text-[15px] font-semibold tracking-tight text-ink">
        {title}
      </h1>

      <div className="flex items-center gap-1.5">
        {searchOpen ? (
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-ink-muted" />
            <input
              ref={inputRef}
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search tasks..."
              aria-label="Search tasks"
              className="h-8 w-[180px] rounded-lg border border-line bg-surface pr-14 pl-8 text-[13px] text-ink placeholder:text-ink-subtle focus:outline-none focus-visible:outline-2 focus-visible:outline-accent sm:w-[230px]"
            />
            <kbd className="pointer-events-none absolute right-7 hidden rounded border border-line px-1 text-[10px] text-ink-subtle sm:block">
              ⌘F
            </kbd>
            <button
              type="button"
              aria-label="Close search"
              onClick={() => {
                setSearchOpen(false);
                onSearchChange('');
              }}
              className="absolute right-2 text-ink-muted transition-colors hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="icon"
            aria-label="Search"
            onClick={() => {
              setSearchOpen(true);
              requestAnimationFrame(() => inputRef.current?.focus());
            }}
          >
            <Search className="h-3.5 w-3.5" />
          </Button>
        )}

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="md">
              <FieldsGlyph />
              Fields
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-2">
            {showModeSwitch && (
              <SegmentedControl
                className="mb-2"
                value={mode}
                onChange={onModeChange}
                options={[
                  { value: 'list', label: 'List', icon: List },
                  { value: 'board', label: 'Board', icon: LayoutGrid },
                ]}
              />
            )}

            <div className="space-y-0.5">
              {FIELD_KEYS.map((key) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-[13px] text-ink transition-colors hover:bg-surface-hover"
                >
                  {FIELD_LABELS[key]}
                  <Switch
                    checked={fields[key]}
                    onCheckedChange={(value) => onFieldChange(key, value)}
                    label={FIELD_LABELS[key]}
                  />
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {filterContent}

        <Button variant="primary" size="md" onClick={onAdd}>
          <Plus className="h-3.5 w-3.5" />
          {addLabel}
        </Button>
      </div>
    </div>
  );
}

function FieldsGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 14 14" className={cn('h-3.5 w-3.5', className)} aria-hidden="true">
      <rect
        x="1.5"
        y="2.5"
        width="11"
        height="9"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path d="M5.5 2.5v9M9 2.5v9" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export { ListFilter };

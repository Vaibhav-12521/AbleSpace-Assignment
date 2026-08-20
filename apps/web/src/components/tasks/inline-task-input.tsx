'use client';

import { useState } from 'react';

/**
 * Inline row for creating a task, subtask or project.
 *
 * The design has no "new item" modal anywhere, so creation happens where the
 * "+ Add …" affordance sits: type a name, press Enter. Blur commits too, so a
 * click elsewhere doesn't silently discard what was typed.
 */
export function InlineTaskInput({
  onSubmit,
  onCancel,
  placeholder = 'Task name, then press Enter',
}: {
  onSubmit: (title: string) => void;
  onCancel: () => void;
  placeholder?: string;
}) {
  const [value, setValue] = useState('');

  function commit() {
    const title = value.trim();
    if (title) onSubmit(title);
    else onCancel();
  }

  return (
    <input
      autoFocus
      value={value}
      placeholder={placeholder}
      aria-label={placeholder}
      onChange={(event) => setValue(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          commit();
        }
        if (event.key === 'Escape') {
          event.preventDefault();
          onCancel();
        }
      }}
      className="h-7 w-full max-w-sm rounded-md bg-surface-subtle px-2 text-[13px] text-ink placeholder:text-ink-subtle focus:outline-none focus-visible:outline-2 focus-visible:outline-accent"
    />
  );
}

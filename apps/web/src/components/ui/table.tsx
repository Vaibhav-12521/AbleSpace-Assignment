import { cn } from '@/lib/cn';

/**
 * Bordered card that wraps a table, matching the list and project views.
 * Overflow-x lets wide column sets scroll instead of breaking the layout.
 */
export function TableCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-line bg-surface',
        className,
      )}
    >
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function Table({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <table className={cn('w-full border-collapse text-[13px]', className)}>
      {children}
    </table>
  );
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-surface-subtle text-ink-muted">
      <tr>{children}</tr>
    </thead>
  );
}

export function Th({
  className,
  children,
  align = 'left',
}: {
  className?: string;
  children?: React.ReactNode;
  align?: 'left' | 'right' | 'center';
}) {
  return (
    <th
      scope="col"
      className={cn(
        'h-9 px-4 font-normal whitespace-nowrap',
        align === 'left' && 'text-left',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className,
      )}
    >
      {children}
    </th>
  );
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function Tr({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        'border-t border-line-subtle transition-colors first:border-t-0 hover:bg-surface-subtle',
        className,
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function Td({
  className,
  children,
  align = 'left',
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        'h-10 px-4 whitespace-nowrap',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className,
      )}
      {...props}
    >
      {children}
    </td>
  );
}

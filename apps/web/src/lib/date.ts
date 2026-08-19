import { format, isBefore, startOfDay } from 'date-fns';

/** "29 Jul" — the compact form used on board cards. */
export function formatShortDate(value: string | Date) {
  return format(new Date(value), 'dd MMM');
}

/** "12 Sep 2026" — the long form used in list and project tables. */
export function formatLongDate(value: string | Date) {
  return format(new Date(value), 'dd MMM yyyy');
}

/** "Jan 10" — the compact form shown inside the date-range control. */
export function formatDateChip(value: string | Date) {
  return format(new Date(value), 'MMM d');
}

export function isOverdue(value: string | Date) {
  return isBefore(startOfDay(new Date(value)), startOfDay(new Date()));
}

/** "just now", "5m", "3h", then falls back to a date. */
export function formatRelative(value: string | Date) {
  const then = new Date(value);
  const diffMs = Date.now() - then.getTime();
  const minutes = Math.floor(diffMs / 60_000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;

  return format(then, 'MMM yyyy');
}

/** Serialises a picked calendar day without dragging the timezone along. */
export function toDateOnlyISO(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

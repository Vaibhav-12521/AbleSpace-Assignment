import { format, isBefore, startOfDay } from 'date-fns';

export function formatShortDate(value: string | Date) {
  return format(new Date(value), 'dd MMM');
}

export function formatLongDate(value: string | Date) {
  return format(new Date(value), 'dd MMM yyyy');
}

export function formatDateChip(value: string | Date) {
  return format(new Date(value), 'MMM d');
}

export function isOverdue(value: string | Date) {
  return isBefore(startOfDay(new Date(value)), startOfDay(new Date()));
}

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

export function toDateOnlyISO(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

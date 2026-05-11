import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export function parseDate(value?: string | number): Date | undefined {
  try {
    if (!value) return undefined;
    return new Date(value);
  } catch {
    return undefined;
  }
}

export function formatDuration(delta: number): string {
  const hh = 3600 * 1000;
  const mm = 60 * 1000;
  const ss = 1000;

  let v;
  const result = [];
  delta = Math.floor(delta);
  if (delta >= hh) {
    v = Math.floor(delta / hh);
    result.push(`${v} hour${v > 1 ? 's' : ''}`);
    delta %= hh;
  }
  if (delta > mm) {
    v = Math.floor(delta / mm);
    result.push(`${v} minute${v > 1 ? 's' : ''}`);
    delta %= mm;
  }
  v = Math.round(delta / ss);
  result.push(`${v} second${v > 1 ? 's' : ''}`);
  return result.join(' ');
}

export function formatDifference(a: Date, b: Date): string {
  if (a < b) {
    return formatDuration(b.getTime() - a.getTime());
  } else {
    return formatDuration(a.getTime() - b.getTime());
  }
}

export function formatDate(value?: string | number | Date | null) {
  if (!value) return '';
  return dayjs(value).format('MMM D, YYYY h:mm A');
}

export function formatFromNow(value?: string | number | Date | null) {
  if (!value) return '';
  return dayjs(value).fromNow();
}

export function calculateRemaining(started: number, progress: number): string {
  const remaining = 100 - progress;
  const delta = Date.now() - started;
  return formatDuration((remaining * delta) / progress);
}

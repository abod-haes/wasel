/**
 * Shared presentation-only formatting for server timestamps.
 *
 * Backend timestamps that include Z/offset are converted to the browser's local
 * time. Both Arabic and English UIs use Western digits and a 24-hour clock, so
 * dates remain stable and readable even inside RTL layouts.
 *
 * Never use these functions to build API payloads or parse form values.
 */
type DateInput = string | number | Date | null | undefined;

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function parseDate(input: DateInput): Date | null {
  if (input == null || input === '') return null;

  // Date-only values represent a calendar day, not UTC midnight.
  // This avoids showing the prior date for users in negative UTC offsets.
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [year, month, day] = input.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
      ? date
      : null;
  }

  const date = input instanceof Date ? input : new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formattedParts(date: Date): { date: string; time: string } {
  const parts = dateTimeFormatter.formatToParts(date);
  const get = (type: string): string => parts.find((part) => part.type === type)?.value ?? '';
  return {
    date: `${get('day')}/${get('month')}/${get('year')}`,
    time: `${get('hour')}:${get('minute')}`,
  };
}

export function formatDate(input: DateInput): string {
  const parsed = parseDate(input);
  return parsed ? dateFormatter.format(parsed) : '—';
}

export function formatTime(input: DateInput): string {
  const parsed = parseDate(input);
  return parsed ? timeFormatter.format(parsed) : '—';
}

export function formatDateTime(input: DateInput): string {
  const parsed = parseDate(input);
  if (!parsed) return '—';
  const { date, time } = formattedParts(parsed);
  return `${date} — ${time}`;
}

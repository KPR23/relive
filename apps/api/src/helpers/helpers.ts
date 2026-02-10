import z from 'zod';

export function asNumber(v: unknown): number | undefined {
  return typeof v === 'number' ? v : undefined;
}

export function asString(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

export function asDate(v: unknown): Date | undefined {
  return v instanceof Date ? v : undefined;
}

export const dateFromString = z.preprocess((arg) => {
  if (arg === null || arg === undefined) return null;
  if (arg instanceof Date) return arg;
  if (typeof arg === 'string') return new Date(arg);
  return null;
}, z.date().nullable());

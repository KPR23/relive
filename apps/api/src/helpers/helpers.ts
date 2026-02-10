export function asNumber(v: unknown): number | undefined {
  return typeof v === 'number' ? v : undefined;
}

export function asString(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

export function asDate(v: unknown): Date | undefined {
  return v instanceof Date ? v : undefined;
}

export function parsePositiveInt(value: unknown): number | null {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
}

export function cleanText(value: unknown, maxLength: number, required = false): string | null {
  if (typeof value !== "string") return required ? null : "";
  const text = value.trim();
  if (required && !text) return null;
  if (text.length > maxLength) return null;
  return text;
}

export function optionalText(value: unknown, maxLength: number): string | null | undefined {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") return undefined;
  const text = value.trim();
  if (text.length > maxLength) return undefined;
  return text || null;
}

export function parseOptionalDate(value: unknown): Date | null | undefined {
  if (value === undefined || value === null || value === "") return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function isFutureDate(date: Date | null): boolean {
  return !date || date.getTime() > Date.now();
}

export function parseMoney(value: unknown): number | null | undefined {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0 || num > 1_000_000) return undefined;
  return Math.round(num * 100) / 100;
}

export function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

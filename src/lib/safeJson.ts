/**
 * Utility untuk parsing JSON dan response fetch secara aman
 * Mencegah error "JSON.parse: unexpected end of data at line 1 column 1"
 */

export function safeJsonParse<T = any>(input: unknown, fallback: T): T {
  if (typeof input !== 'string') return fallback;
  const trimmed = input.trim();
  if (!trimmed || (!trimmed.startsWith('{') && !trimmed.startsWith('['))) {
    return fallback;
  }
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    return fallback;
  }
}

export async function safeFetchJson<T = any>(res: Response, fallback: T): Promise<T> {
  try {
    const text = await res.text();
    return safeJsonParse<T>(text, fallback);
  } catch {
    return fallback;
  }
}

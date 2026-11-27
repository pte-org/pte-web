import { parsePartialJson } from "../utils/partialJson";

/**
 * The partial-JSON parse of a draft, remembered per question: several parts of a frame read the same text, and a
 * frame in which nothing was typed repeats the last one. The text is compared whole, so a result is never stale.
 */
const cache = new Map<string, { text: string; value: unknown }>();
const MAX_ENTRIES = 64;

export function parseDraftText(key: string, text: string): unknown {
  const known = cache.get(key);
  if (known && known.text === text) return known.value;
  const value = text === "" ? undefined : parsePartialJson(text);
  if (cache.size >= MAX_ENTRIES && !cache.has(key)) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, { text, value });
  return value;
}

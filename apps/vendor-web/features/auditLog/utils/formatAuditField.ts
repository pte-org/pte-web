import { humanizePlatformAuditCode } from "../constants";

const PATH_SEPARATOR = " › ";

/** "options", 1, "correct" -> "Options › 2 › Correct": list positions are shown 1-based to the reader. */
export function formatAuditPath(path: readonly (string | number)[]): string {
  return path
    .map((segment) =>
      typeof segment === "number" ? String(segment + 1) : humanizePlatformAuditCode(segment),
    )
    .join(PATH_SEPARATOR);
}

/** A snapshot leaf as text; null and empty strings use the caller's empty label. */
export function formatAuditValue(value: unknown, emptyLabel: string): string {
  if (value === null || value === undefined || value === "") return emptyLabel;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

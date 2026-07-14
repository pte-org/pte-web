export type ClassValue = string | false | null | undefined;

/**
 * Merge conditional class names into a single space-separated string.
 * Falsy values are dropped, so `cn("base", isActive && "active")` works.
 * Tailwind-first: this does not de-duplicate conflicting utilities — keep
 * class lists non-overlapping at the call site.
 */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}

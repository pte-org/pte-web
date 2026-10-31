import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { vi } from "vitest";

const RECHARTS_SIZE_WARNING = "of chart should be greater than 0";

/**
 * recharts warns on every server render because ResponsiveContainer has no measured size
 * outside a browser. Mute only that message (anything else still reaches the console) and
 * return a function that restores the console.
 */
export const muteRechartsSizeWarning = (): (() => void) => {
  const muted = (original: (...args: unknown[]) => void) => (...args: unknown[]): void => {
    if (typeof args[0] === "string" && args[0].includes(RECHARTS_SIZE_WARNING)) return;
    original(...args);
  };
  const warn = vi.spyOn(console, "warn").mockImplementation(muted(console.warn.bind(console)));
  const error = vi.spyOn(console, "error").mockImplementation(muted(console.error.bind(console)));
  return () => {
    warn.mockRestore();
    error.mockRestore();
  };
};

/** Server-render an element to a static HTML string (no DOM, no hydration markers). */
export const renderHtml = (element: ReactElement): string => renderToStaticMarkup(element);

/** Number of non-overlapping matches of `pattern` in `html`. */
export const countMatches = (html: string, pattern: RegExp): number => {
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  return (html.match(new RegExp(pattern.source, flags)) ?? []).length;
};

/** Visible plus screen-reader text of `html`: tags removed, whitespace collapsed. */
export const textOf = (html: string): string =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** First `<tag ...>` opening tag whose attributes contain `needle`, or undefined. */
export const findOpeningTag = (html: string, tag: string, needle: string): string | undefined =>
  (html.match(new RegExp(`<${tag}\\b[^>]*>`, "g")) ?? []).find((candidate) =>
    candidate.includes(needle),
  );

/** Inner HTML of the first `<tag>...</tag>` block, or undefined. */
export const innerOf = (html: string, tag: string): string | undefined =>
  html.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`))?.[1];

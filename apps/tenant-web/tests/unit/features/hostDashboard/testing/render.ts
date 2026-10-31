import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LocaleProvider } from "@pte/ui";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { HOST_DASHBOARD_ROUTES } from "../../../../../features/hostDashboard/constants";
import { environment, type RecordedButton, type RecordedPanel, type TestOrgLabels } from "./environment";

/** Locale / organisation-noun switches of the test environment. */
export function useTestLocale(locale: "en" | "vi"): void {
  environment.locale = locale;
}

export function useTestOrgLabels(labels: Pick<TestOrgLabels, "program" | "class">): void {
  environment.labels = { ...labels, isLoading: false };
}

export function resetTestEnvironment(): void {
  environment.locale = "en";
  environment.labels = { program: "Program", class: "Class", isLoading: false };
  environment.push.mockClear();
  environment.buttons.length = 0;
  environment.panels.length = 0;
}

/** Recorded retry handlers of the last renders (see `environment.ts`). */
export function recordedButtons(label: string): RecordedButton[] {
  return environment.buttons.filter((button) => button.label === label);
}

export function recordedPanel(title: string): RecordedPanel | undefined {
  return environment.panels.find((panel) => panel.title === title);
}

const RECHARTS_SIZE_WARNING = "of chart should be greater than 0";

/** recharts warns on every server render (no measured size outside a browser); mute only that. */
export function muteRechartsSizeWarning(): () => void {
  const filtered =
    (original: (...args: unknown[]) => void) =>
    (...args: unknown[]): void => {
      if (typeof args[0] === "string" && args[0].includes(RECHARTS_SIZE_WARNING)) return;
      original(...args);
    };
  const warn = vi.spyOn(console, "warn").mockImplementation(filtered(console.warn.bind(console)));
  const error = vi.spyOn(console, "error").mockImplementation(filtered(console.error.bind(console)));
  return () => {
    warn.mockRestore();
    error.mockRestore();
  };
}

/** Registers the per-file hooks every component test needs (quiet recharts, clean environment). */
export function installRenderHooks(): void {
  let restore: () => void = () => undefined;
  beforeAll(() => {
    restore = muteRechartsSizeWarning();
  });
  afterAll(() => restore());
  afterEach(() => resetTestEnvironment());
}

/** Static HTML of an element inside the real LocaleProvider the @pte/ui components require. */
export function renderHtml(element: ReactElement): string {
  return renderToStaticMarkup(createElement(LocaleProvider, null, element));
}

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#x27;": "'",
  "&#39;": "'",
};

/** Visible plus screen-reader text: tags removed, entities decoded, whitespace collapsed. */
export function textOf(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&(?:amp|lt|gt|quot|#x27|#39);/g, (entity) => ENTITIES[entity] ?? entity)
    .replace(/\s+/g, " ")
    .trim();
}

export function hrefsOf(html: string): string[] {
  return [...html.matchAll(/\shref="([^"]*)"/g)].map((match) => match[1]);
}

export function countOf(html: string, pattern: RegExp): number {
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  return (html.match(new RegExp(pattern.source, flags)) ?? []).length;
}

const DIV_TOKEN = /<div\b|<\/div>/g;

/**
 * HTML of the panel (`role="region"`) whose `<h2>` heading is `title`, found by balancing the
 * `<div>` tags from the region's opening tag. Undefined when no such panel is rendered.
 */
export function regionOf(html: string, title: string): string | undefined {
  const heading = new RegExp(`<h2 id="([^"]+)"[^>]*>${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</h2>`).exec(html);
  if (!heading) return undefined;
  const start = html.lastIndexOf(`<div role="region" aria-labelledby="${heading[1]}"`, heading.index);
  if (start < 0) return undefined;
  let depth = 0;
  DIV_TOKEN.lastIndex = start;
  for (let token = DIV_TOKEN.exec(html); token; token = DIV_TOKEN.exec(html)) {
    depth += token[0] === "</div>" ? -1 : 1;
    if (depth === 0) return html.slice(start, DIV_TOKEN.lastIndex);
  }
  return undefined;
}

/** `<h2>` titles in document order. */
export function panelTitles(html: string): string[] {
  return [...html.matchAll(/<h2 [^>]*>([^<]*)<\/h2>/g)].map((match) => match[1]);
}

/** Text of every aria-label / title attribute (screen-reader copy that textOf cannot see). */
export function attributeText(html: string): string[] {
  return [...html.matchAll(/\s(?:aria-label|title)="([^"]*)"/g)].map((match) => match[1]);
}

/** Index of the first occurrence of `needle`; fails loudly instead of returning -1 silently. */
export function indexOfOrThrow(html: string, needle: string): number {
  const index = html.indexOf(needle);
  if (index < 0) throw new Error(`"${needle}" not found in rendered HTML`);
  return index;
}

/** Every static route the dashboard may link to (plus the per-session route pattern). */
export const ALLOWED_STATIC_HREFS: readonly string[] = [
  HOST_DASHBOARD_ROUTES.students,
  HOST_DASHBOARD_ROUTES.programs,
  HOST_DASHBOARD_ROUTES.exams,
  HOST_DASHBOARD_ROUTES.examStaff,
  HOST_DASHBOARD_ROUTES.billing,
  HOST_DASHBOARD_ROUTES.orders,
  HOST_DASHBOARD_ROUTES.supportTickets,
  HOST_DASHBOARD_ROUTES.auditLog,
];

export const SESSION_HREF_PATTERN = /^\/host\/exams\/[0-9a-f-]{36}$/;

export function isAllowedHref(href: string): boolean {
  return ALLOWED_STATIC_HREFS.includes(href) || SESSION_HREF_PATTERN.test(href);
}

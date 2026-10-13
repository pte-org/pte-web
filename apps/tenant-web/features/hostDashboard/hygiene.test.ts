import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { HOST_DASHBOARD_ROUTES } from "./constants";

/**
 * Source-level guards for the coding standards that cannot be seen in rendered output
 * (client directive, JSX text, inline styles, colours, size limits) and for the "one request,
 * existing routes only" design constraints.
 */
const FEATURE_ROOT = fileURLToPath(new URL(".", import.meta.url));
const TENANT_ROOT = join(FEATURE_ROOT, "..", "..");
const PAGE = join(TENANT_ROOT, "app", "(dashboard)", "host", "dashboard", "page.tsx");

const MAX_FILE_LINES = 300;
const MAX_COMPONENT_LINES = 150;

function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return entry.name === "node_modules" || entry.name === ".next" ? [] : walk(path);
    return [path];
  });
}

const isTest = (path: string): boolean => /\.test\.tsx?$/.test(path);
const isTestSupport = (path: string): boolean => path.split(sep).includes("testing");
const read = (path: string): string => readFileSync(path, "utf8");
const name = (path: string): string => relative(TENANT_ROOT, path).split(sep).join("/");

const SOURCES = walk(FEATURE_ROOT).filter((path) => /\.tsx?$/.test(path) && !isTest(path) && !isTestSupport(path));
const COMPONENTS = SOURCES.filter((path) => path.endsWith(".tsx"));
const TESTS = walk(FEATURE_ROOT).filter((path) => isTest(path) || isTestSupport(path));

/** Source without block and line comments, so documentation cannot trigger or hide a finding. */
const code = (path: string): string => read(path).replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

describe("host/dashboard route", () => {
  const source = read(PAGE);

  it("is a thin server component: no client directive, no logic, no text", () => {
    expect(source).not.toMatch(/["']use client["']/);
    expect(source.trim().split("\n").length).toBeLessThanOrEqual(6);
    expect(source).toContain("<HostDashboardView />");
    expect(source).toMatch(/export default function \w+\(\)/);
    expect(source).not.toMatch(/use(State|Effect|Query|Router)|fetch\(/);
  });

  it("has no JSX text nodes or string props", () => {
    expect(source).not.toMatch(/>\s*[^<>{}\s][^<>{}]*</);
    expect(source).not.toMatch(/\w+="[^"]*"/);
  });

  it("renders the view from the feature barrel", () => {
    expect(source).toContain('from "@/features/hostDashboard/components"');
  });
});

describe("feature sources", () => {
  it("finds the sources it is supposed to guard", () => {
    expect(COMPONENTS.length).toBeGreaterThanOrEqual(15);
    expect(SOURCES.length).toBeGreaterThan(COMPONENTS.length);
  });

  it("use no inline style attribute, hex, rgb or hsl colour, arbitrary colour or spacing", () => {
    for (const path of SOURCES) {
      const text = code(path);
      expect(text, name(path)).not.toMatch(/\bstyle\s*=/);
      expect(text, name(path)).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
      expect(text, name(path)).not.toMatch(/\b(?:rgb|rgba|hsl|hsla|oklch)\(/);
      expect(text, name(path)).not.toMatch(/-\[(?:#|rgb|hsl)/);
      expect(text, name(path)).not.toMatch(/\b(?:p|m|gap|w|h)-\[\d+px\]/);
    }
  });

  it("use no `any`, ts-ignore or console output", () => {
    for (const path of SOURCES) {
      const text = code(path);
      expect(text, name(path)).not.toMatch(/:\s*any\b|\bas any\b|<any>/);
      expect(text, name(path)).not.toMatch(/@ts-ignore/);
      expect(text, name(path)).not.toMatch(/\bconsole\./);
    }
  });

  it("keep user-facing text out of JSX: components contain no literal text nodes", () => {
    for (const path of COMPONENTS) {
      const text = code(path)
        .split("\n")
        .filter((line) => !/=>|^\s*(import|export type|interface|type)\b|<[A-Z]\w*,|Record<|Array<|Promise</.test(line))
        .join("\n");
      expect(text, name(path)).not.toMatch(/<\/?[A-Za-z][^<>]*>\s*[A-Za-z][A-Za-z ,.!?']{2,}\s*<\//);
    }
  });

  it("compose no user-facing text in code: no template literal joins values with a separator", () => {
    for (const path of COMPONENTS) {
      const text = code(path);
      expect(text, name(path)).not.toMatch(/`[^`]*\$\{[^}]*\}[^`$]*?\s[·/:|-]\s[^`]*`/);
      expect(text, name(path)).not.toMatch(/`\s[·/:|-]\s[^`]*\$\{/);
      expect(text, name(path)).not.toMatch(/`[^`$]*\s[·/:|-]\s\$\{/);
    }
  });

  it("use framework primitives: no raw anchors, images or fetch calls", () => {
    for (const path of SOURCES) {
      const text = code(path);
      expect(text, name(path)).not.toMatch(/<a\s|<img\s/);
      expect(text, name(path)).not.toMatch(/\bfetch\(/);
    }
  });

  it("keep every source file within 300 lines", () => {
    for (const path of SOURCES) {
      expect(read(path).split("\n").length, name(path)).toBeLessThanOrEqual(MAX_FILE_LINES);
    }
  });

  it("keep every component function within 150 lines", () => {
    for (const path of COMPONENTS) {
      const lines = read(path).split("\n");
      lines.forEach((line, index) => {
        if (!/^(export )?(const|function) [A-Z]\w*/.test(line)) return;
        const end = lines.findIndex((candidate, offset) => offset >= index && /^[)}\]]+;?$/.test(candidate));
        const length = (end < 0 ? lines.length : end + 1) - index;
        expect(length, `${name(path)}:${index + 1} ${line.trim()}`).toBeLessThanOrEqual(MAX_COMPONENT_LINES);
      });
    }
  });

  it("keep the tests themselves within 300 lines", () => {
    for (const path of TESTS) {
      expect(read(path).split("\n").length, name(path)).toBeLessThanOrEqual(MAX_FILE_LINES);
    }
  });
});

describe("single request and existing routes", () => {
  it("only the feature api and the view touch the dashboard endpoint hook", () => {
    const users = walk(TENANT_ROOT)
      .filter((path) => /\.tsx?$/.test(path) && !isTest(path) && !path.includes(`${sep}node_modules${sep}`))
      .filter((path) => !path.includes(`${sep}.next${sep}`))
      .filter((path) => /getHostDashboard|useHostDashboard\(/.test(read(path)))
      .map(name)
      .sort();
    expect(users).toEqual([
      "features/hostDashboard/api.ts",
      "features/hostDashboard/components/HostDashboardView.tsx",
    ]);
  });

  it("the grid and panels receive data by props and never call the hook themselves", () => {
    for (const path of COMPONENTS.filter((file) => !file.endsWith("HostDashboardView.tsx"))) {
      expect(read(path), name(path)).not.toMatch(/useHostDashboard\(|useQuery\(|useMutation\(/);
    }
  });

  it("every route the dashboard links to has a page under app/(dashboard)/host", () => {
    const routes = Object.values(HOST_DASHBOARD_ROUTES).flatMap((value) => (typeof value === "string" ? [value] : []));
    const sessionRoute = HOST_DASHBOARD_ROUTES.session("PUBLIC_ID");
    for (const route of [...routes, sessionRoute]) {
      const segments = route.replace(/^\/host\//, "").split("/").map((segment) => (segment === "PUBLIC_ID" ? "[publicId]" : segment));
      const page = join(TENANT_ROOT, "app", "(dashboard)", "host", ...segments, "page.tsx");
      expect(existsSync(page), `${route} -> ${name(page)}`).toBe(true);
    }
  });

  it("the sources link only to routes in the verified route table", () => {
    const known = new Set<string>(
      Object.values(HOST_DASHBOARD_ROUTES).flatMap((value) => (typeof value === "string" ? [value] : [])),
    );
    for (const path of SOURCES.filter((file) => !file.endsWith("constants.ts"))) {
      for (const match of code(path).matchAll(/["'`](\/host\/[^"'`$]*)["'`]/g)) {
        expect(known.has(match[1]), `${name(path)}: ${match[1]}`).toBe(true);
      }
    }
  });
});

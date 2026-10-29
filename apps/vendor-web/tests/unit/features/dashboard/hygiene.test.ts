import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ADMIN_DASHBOARD_ROUTES } from "../../../../features/dashboard/constants";

const FEATURE_ROOT = fileURLToPath(new URL("../../../../features/dashboard", import.meta.url));
const VENDOR_ROOT = join(FEATURE_ROOT, "..", "..");
const PAGE = join(VENDOR_ROOT, "app", "(dashboard)", "admin", "page.tsx");

const MAX_FILE_LINES = 300;
const MAX_COMPONENT_LINES = 150;

function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return entry.name === "node_modules" || entry.name === ".next" ? [] : walk(path);
    }
    return [path];
  });
}

const isTest = (path: string): boolean => /\.test\.tsx?$/.test(path);
const isTestSupport = (path: string): boolean => path.split(sep).includes("testing");
const read = (path: string): string => readFileSync(path, "utf8");
const name = (path: string): string => relative(VENDOR_ROOT, path).split(sep).join("/");

const SOURCES = walk(FEATURE_ROOT).filter(
  (path) => /\.tsx?$/.test(path) && !isTest(path) && !isTestSupport(path),
);
const COMPONENTS = SOURCES.filter((path) => path.endsWith(".tsx"));
const TESTS = walk(fileURLToPath(new URL(".", import.meta.url))).filter((path) => isTest(path) || isTestSupport(path));

/** Source without block and line comments, so documentation cannot trigger or hide a finding. */
const code = (path: string): string =>
  read(path)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

describe("admin route", () => {
  const source = read(PAGE);

  it("is a thin server component: no client directive, no logic, no text", () => {
    expect(source).not.toMatch(/["']use client["']/);
    expect(source.trim().split("\n").length).toBeLessThanOrEqual(6);
    expect(source).toContain("<AdminDashboardView />");
    expect(source).toMatch(/export default function \w+\(\)/);
    expect(source).not.toMatch(/use(State|Effect|Query|Router)|fetch\(/);
  });

  it("has no JSX text nodes or string props", () => {
    expect(source).not.toMatch(/>\s*[^<>{}\s][^<>{}]*</);
    expect(source).not.toMatch(/\w+="[^"]*"/);
  });

  it("renders the view from the feature barrel", () => {
    expect(source).toContain('from "@/features/dashboard/components"');
  });
});

describe("feature sources hygiene", () => {
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
        .filter(
          (line) =>
            !/=>|^\s*(import|export type|interface|type)\b|<[A-Z]\w*,|Record<|Array<|Promise</.test(
              line,
            ),
        )
        .join("\n");
      expect(text, name(path)).not.toMatch(/<\/?[A-Za-z][^<>]*>\s*[A-Za-z][A-Za-z ,.!?']{2,}\s*<\//);
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
        const end = lines.findIndex(
          (candidate, offset) => offset >= index && /^[)}\]]+;?$/.test(candidate),
        );
        const length = (end < 0 ? lines.length : end + 1) - index;
        expect(
          length,
          `${name(path)}:${index + 1} ${line.trim()}`,
        ).toBeLessThanOrEqual(MAX_COMPONENT_LINES);
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
    const users = walk(VENDOR_ROOT)
      .filter(
        (path) =>
          /\.tsx?$/.test(path) &&
          !isTest(path) &&
          !path.includes(`${sep}node_modules${sep}`) &&
          !path.includes(`${sep}.next${sep}`),
      )
      .filter((path) => /getAdminDashboard|useAdminDashboard\(/.test(read(path)))
      .map(name)
      .sort();
    expect(users).toEqual([
      "features/dashboard/api.ts",
      "features/dashboard/components/AdminDashboardView.tsx",
    ]);
  });

  it("the grid and panels receive data by props and never call the hook themselves", () => {
    for (const path of COMPONENTS.filter((file) => !file.endsWith("AdminDashboardView.tsx"))) {
      expect(read(path), name(path)).not.toMatch(/useAdminDashboard\(|useQuery\(|useMutation\(/);
    }
  });

  it("every route the dashboard links to has a page under app/(dashboard)/admin", () => {
    const routes = Object.values(ADMIN_DASHBOARD_ROUTES).flatMap((value) =>
      typeof value === "string" ? [value] : [],
    );
    for (const route of routes) {
      const segments = route.replace(/^\/admin\/?/, "").split("/").filter(Boolean);
      const page = join(VENDOR_ROOT, "app", "(dashboard)", "admin", ...segments, "page.tsx");
      expect(existsSync(page), `${route} -> ${name(page)}`).toBe(true);
    }
  });
});

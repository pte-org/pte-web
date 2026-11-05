import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { SCORE_EXPLANATION_EN } from "../../../../features/scoreexplanation/messages/en";
import { SCORE_EXPLANATION_VI } from "../../../../features/scoreexplanation/messages/vi";

const FEATURE_ROOT = fileURLToPath(new URL("../../../../features/scoreexplanation", import.meta.url));
const TENANT_ROOT = join(FEATURE_ROOT, "..", "..");
const DASHBOARD = join(TENANT_ROOT, "app", "(dashboard)");
const ROUTES = [
  join(DASHBOARD, "host", "exams", "[publicId]", "attempts", "[attemptPublicId]", "score-explanation"),
  join(DASHBOARD, "examiner", "work", "[sessionPublicId]", "[attemptPublicId]", "score-explanation"),
];

const walk = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return ["node_modules", ".next"].includes(entry.name) ? [] : walk(path);
    }
    return [path];
  });

const read = (path: string): string => readFileSync(path, "utf8");
const name = (path: string): string => relative(TENANT_ROOT, path).split(sep).join("/");
const code = (path: string): string =>
  read(path)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

const SOURCES = walk(FEATURE_ROOT).filter((path) => /\.tsx?$/.test(path));
const COMPONENTS = SOURCES.filter((path) => path.endsWith(".tsx"));
const APP_SOURCES = walk(TENANT_ROOT).filter(
  (path) => /\.tsx?$/.test(path) && !path.includes(`${sep}tests${sep}`),
);

describe("score explanation feature hygiene", () => {
  it("has a page, loading and error file for the Host and the Examiner route", () => {
    for (const route of ROUTES) {
      for (const file of ["page.tsx", "loading.tsx", "error.tsx"]) {
        expect(existsSync(join(route, file)), `${name(route)}/${file}`).toBe(true);
      }
    }
  });

  it("uses no inline style, raw colour, arbitrary spacing, any, ts-ignore or raw fetch", () => {
    expect(COMPONENTS.length).toBeGreaterThanOrEqual(10);
    for (const path of SOURCES) {
      const text = code(path);
      expect(text, name(path)).not.toMatch(/\bstyle\s*=/);
      expect(text, name(path)).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
      expect(text, name(path)).not.toMatch(/\b(?:rgb|rgba|hsl|hsla|oklch)\(/);
      expect(text, name(path)).not.toMatch(/\b(?:p|m|gap|w|h)-\[\d+px\]/);
      expect(text, name(path)).not.toMatch(/:\s*any\b|\bas any\b|<any>|@ts-ignore/);
      expect(text, name(path)).not.toMatch(/\bfetch\(|<a\s|<img\s/);
    }
  });

  it("keeps files within 300 lines and component functions within 150", () => {
    for (const path of SOURCES) {
      expect(read(path).split("\n").length, name(path)).toBeLessThanOrEqual(300);
    }
    for (const path of COMPONENTS) {
      const lines = read(path).split("\n");
      lines.forEach((line, index) => {
        if (!/^(export )?const [A-Z]\w* = /.test(line)) return;
        const end = lines.findIndex((candidate, offset) => offset > index && /^[)}\]]+;?$/.test(candidate));
        expect((end < 0 ? lines.length : end + 1) - index, `${name(path)}:${index + 1}`).toBeLessThanOrEqual(150);
      });
    }
  });

  it("never recalculates: no arithmetic on scores, weights or averages in the feature", () => {
    for (const path of SOURCES.filter((file) => !file.includes(`${sep}messages${sep}`))) {
      const text = code(path);
      expect(text, name(path)).not.toMatch(/\b(?:score|weight|average|sum|ratio|achieved)\w*\s*[*/]\s*\w/i);
      expect(text, name(path)).not.toMatch(/Math\.(?:round|floor|ceil)|toFixed\(/);
    }
  });

  it("has the same message keys in en and vi, with the exact uncalibrated wording in vi", () => {
    expect(Object.keys(SCORE_EXPLANATION_VI).sort()).toEqual(Object.keys(SCORE_EXPLANATION_EN).sort());
    for (const [key, value] of Object.entries(SCORE_EXPLANATION_VI)) {
      expect(value.trim(), key).not.toBe("");
    }
    expect(SCORE_EXPLANATION_VI.azureUncalibrated).toBe("chưa hiệu chỉnh với dữ liệu người chấm");
  });
});

describe("access boundaries", () => {
  it("only the feature api calls the explanation endpoint", () => {
    const users = APP_SOURCES.filter((path) => /getScoreExplanation\(/.test(read(path))).map(name);
    expect(users).toEqual(["features/scoreexplanation/api.ts"]);
  });

  it("links to the explanation only from the Host submissions and the Examiner marking header", () => {
    const users = APP_SOURCES.filter(
      (path) => !path.startsWith(FEATURE_ROOT) && /<ScoreExplanationLink\b/.test(read(path)),
    )
      .map(name)
      .sort();
    expect(users).toEqual([
      "features/examiner/components/ExaminerAttemptHeader.tsx",
      "features/exams/components/AttemptsSection.tsx",
    ]);
    expect(read(join(TENANT_ROOT, users[0]))).toContain('role="EXAMINER"');
    expect(read(join(TENANT_ROOT, users[1]))).toContain('role="HOST_ADMIN"');
  });

  it("explanation routes live only under the Host and Examiner areas", () => {
    const routes = walk(DASHBOARD)
      .filter((path) => path.includes(`${sep}score-explanation${sep}`) && path.endsWith("page.tsx"))
      .map(name)
      .sort();
    expect(routes).toEqual(ROUTES.map((route) => `${name(route)}/page.tsx`).sort());
  });
});

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { SCORING_RUBRIC_EN } from "../../../../features/scoringrubric/messages/en";
import { SCORING_RUBRIC_VI } from "../../../../features/scoringrubric/messages/vi";

const FEATURE_ROOT = fileURLToPath(new URL("../../../../features/scoringrubric", import.meta.url));
const VENDOR_ROOT = join(FEATURE_ROOT, "..", "..");
const ROUTE_ROOT = join(VENDOR_ROOT, "app", "(dashboard)", "admin", "scoring-rubric");

const walk = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return ["node_modules", ".next"].includes(entry.name) ? [] : walk(path);
    }
    return [path];
  });

const read = (path: string): string => readFileSync(path, "utf8");
const name = (path: string): string => relative(VENDOR_ROOT, path).split(sep).join("/");
const code = (path: string): string =>
  read(path)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

const SOURCES = walk(FEATURE_ROOT).filter((path) => /\.tsx?$/.test(path));
const COMPONENTS = SOURCES.filter((path) => path.endsWith(".tsx"));
const APP_SOURCES = walk(VENDOR_ROOT).filter(
  (path) => /\.tsx?$/.test(path) && !path.includes(`${sep}tests${sep}`),
);

describe("vendor rubric feature hygiene", () => {
  it("finds the sources and routes it guards", () => {
    expect(COMPONENTS.length).toBeGreaterThanOrEqual(10);
    for (const file of ["page.tsx", "loading.tsx", "error.tsx"]) {
      expect(existsSync(join(ROUTE_ROOT, file)), file).toBe(true);
      expect(existsSync(join(ROUTE_ROOT, "[taskType]", file)), file).toBe(true);
      expect(existsSync(join(ROUTE_ROOT, "versions", file)), file).toBe(true);
      expect(existsSync(join(ROUTE_ROOT, "versions", "[publicId]", file)), file).toBe(true);
    }
  });

  it("uses no inline style, raw colour, arbitrary spacing, any or ts-ignore", () => {
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

  it("has the same message keys in en and vi, with the exact uncalibrated wording in vi", () => {
    expect(Object.keys(SCORING_RUBRIC_VI).sort()).toEqual(Object.keys(SCORING_RUBRIC_EN).sort());
    for (const [key, value] of Object.entries(SCORING_RUBRIC_VI)) {
      expect(value.trim(), key).not.toBe("");
    }
    expect(SCORING_RUBRIC_VI.azureUncalibrated).toBe("chưa hiệu chỉnh với dữ liệu người chấm");
  });
});

describe("vendor-web never reads attempt data", () => {
  it("no vendor source calls the score explanation or attempt report API", () => {
    const offenders = APP_SOURCES.filter((path) =>
      /getScoreExplanation|score-explanation|useScoreExplanation|getAttemptReport|SCORE_EXPLANATION_ENDPOINTS|REPORT_ENDPOINTS/.test(
        read(path),
      ),
    ).map(name);
    expect(offenders).toEqual([]);
  });

  it("the rubric feature never uses attempt or answer data", () => {
    for (const path of SOURCES) {
      const text = code(path);
      expect(text, name(path)).not.toMatch(/attempt|answerPublicId|sessionPublicId/i);
    }
  });
});

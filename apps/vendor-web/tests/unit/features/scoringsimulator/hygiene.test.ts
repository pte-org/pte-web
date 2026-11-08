import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { SIMULATOR_TEXT } from "../../../../features/scoringsimulator/constants";

const root = fileURLToPath(new URL("../../../../features/scoringsimulator", import.meta.url));
function sources(path: string): string[] {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => entry.isDirectory()
    ? sources(join(path, entry.name)) : /\.tsx?$/.test(entry.name) ? [join(path, entry.name)] : []);
}
describe("simulator boundaries", () => {
  it("keeps files small and free from scoring math, unsafe types and custom styles", () => {
    for (const path of sources(root)) {
      const text = readFileSync(path, "utf8");
      expect(text.split(/\r?\n/).length, path).toBeLessThanOrEqual(300);
      expect(text, path).not.toMatch(/\bany\b|@ts-ignore|style=|bg-\[#|fetch\(/);
      // Labels may describe the formula; production expressions may not implement it.
      expect(text, path).not.toMatch(/Math\.round|reduce\(|\.achieved\s*\/|\.effectiveWeight\s*\*/);
    }
  });
  it("provides matching translated keys and the page that redirects to the rubric screen", () => {
    expect(Object.keys(SIMULATOR_TEXT.vi)).toEqual(Object.keys(SIMULATOR_TEXT.en));
    for (const name of ["page.tsx"]) {
      expect(existsSync(fileURLToPath(new URL(`../../../../app/(dashboard)/admin/scoring-simulator/${name}`, import.meta.url)))).toBe(true);
    }
  });
});

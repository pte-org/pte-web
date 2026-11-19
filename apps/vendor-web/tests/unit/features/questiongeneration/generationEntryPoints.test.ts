import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { hasTypedContent } from "../../../../features/questionbank/questionPreviewDraft";
import type { QuestionPreviewDraft } from "../../../../features/questionbank/types";

const APP = fileURLToPath(new URL("../../../../", import.meta.url));
const GENERATION = join(APP, "features/questiongeneration");
const BATCHES_ROUTE = join(APP, "app/(dashboard)/admin/questions/ai-batches");

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? sources(join(dir, entry.name)) : [join(dir, entry.name)]);
}

const draft = (patch: Partial<QuestionPreviewDraft>): QuestionPreviewDraft =>
  // Only the fields the dirty check reads matter here.
  ({ taskType: "WRITE_ESSAY", promptText: "", options: [], ...patch }) as QuestionPreviewDraft;

describe("generation entry points", () => {
  it("no Drawer and no __tests__ remain in question generation", () => {
    const files = sources(GENERATION);
    expect(files.some((file) => file.includes("__tests__"))).toBe(false);
    expect(files.filter((file) => /from "@pte\/ui"[\s\S]*?\bDrawer\b/.test(readFileSync(file, "utf8")) ||
      /\bDrawer\b,/.test(readFileSync(file, "utf8")))).toEqual([]);
  });

  it("batches keep only their detail page (the popup is the only way to start one)", () => {
    expect(existsSync(join(BATCHES_ROUTE, "page.tsx"))).toBe(false);
    expect(existsSync(join(BATCHES_ROUTE, "new"))).toBe(false);
    expect(existsSync(join(BATCHES_ROUTE, "[batch-id]", "page.tsx"))).toBe(true);
  });

  it("asks before leaving only when the editor holds typed text", () => {
    expect(hasTypedContent(null)).toBe(false);
    expect(hasTypedContent(draft({}))).toBe(false);
    expect(hasTypedContent(draft({ promptText: "Write about cities" }))).toBe(true);
    expect(hasTypedContent(draft({ options: ["", "an option"] }))).toBe(true);
  });
});

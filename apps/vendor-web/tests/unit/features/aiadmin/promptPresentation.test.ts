import { describe, expect, it } from "vitest";
import type { PromptSection } from "@pte/api-client";
import {
  PROMPT_COPY,
  PROMPT_SECTION_TITLES_VI,
  promptDetailHref,
} from "../../../../features/aiadmin/promptConstants";
import {
  categoryLabel,
  hasPrompt,
  levelsDescending,
  sectionTitle,
  splitLabeled,
  tagLabel,
} from "../../../../features/aiadmin/utils/promptPresentation";

const section = (id: string, title: string): PromptSection => ({ id, title, locked: false, blocks: [] });
const SECTIONS = [section("intro", "Overview"), section("custom-part", "Custom part")];

describe("sectionTitle", () => {
  it("translates a known section id and keeps the API's English title for the rest", () => {
    expect(sectionTitle(SECTIONS[0], "vi")).toBe(PROMPT_SECTION_TITLES_VI.intro);
    expect(sectionTitle(SECTIONS[1], "vi")).toBe("Custom part");
    expect(sectionTitle(SECTIONS[0], "en")).toBe("Overview");
  });
});

describe("splitLabeled", () => {
  it("splits a short label from its value", () => {
    expect(splitLabeled("CEFR Level: {cefr}")).toEqual({ label: "CEFR Level", value: "{cefr}" });
    expect(splitLabeled("Question: six to twenty words")).toEqual({ label: "Question", value: "six to twenty words" });
  });

  it("leaves a plain sentence whole, even when it contains a colon late", () => {
    expect(splitLabeled("Write in clear, academic English")).toBeNull();
    expect(splitLabeled("A very long sentence that only mentions something like this: a colon")).toBeNull();
  });
});

describe("labels", () => {
  it("names the engines and shows any other tag, such as a skill, as it is", () => {
    expect(tagLabel(PROMPT_COPY.vi, "GEMINI")).toBe("Gemini");
    expect(tagLabel(PROMPT_COPY.vi, "AZURE")).toBe("Azure");
    expect(tagLabel(PROMPT_COPY.vi, "CODE")).toBe("Code");
    expect(tagLabel(PROMPT_COPY.vi, "LLM")).toBe("LLM");
    expect(tagLabel(PROMPT_COPY.vi, "TTS")).toBe("Kokoro TTS");
    expect(tagLabel(PROMPT_COPY.vi, "CHART")).toBe("Vẽ biểu đồ");
    expect(tagLabel(PROMPT_COPY.vi, "SPEAKING")).toBe("SPEAKING");
  });

  it("labels each category in both languages", () => {
    for (const category of ["GENERATION", "REVIEW", "SCORING", "SHARED"] as const) {
      expect(categoryLabel(PROMPT_COPY.en, category)).not.toBe("");
      expect(categoryLabel(PROMPT_COPY.vi, category)).not.toBe("");
    }
    expect(categoryLabel(PROMPT_COPY.vi, "SCORING")).toBe("Chấm điểm");
  });
});

describe("levelsDescending", () => {
  it("puts the highest level first without changing the input", () => {
    const rows = [
      { level: 0, text: "none" },
      { level: 5, text: "top" },
      { level: 3, text: "mid" },
    ];

    expect(levelsDescending(rows).map((row) => row.level)).toEqual([5, 3, 0]);
    expect(rows.map((row) => row.level)).toEqual([0, 5, 3]);
  });
});

describe("copy and links", () => {
  it("has the same keys in English and Vietnamese, none empty", () => {
    expect(Object.keys(PROMPT_COPY.vi).sort()).toEqual(Object.keys(PROMPT_COPY.en).sort());
    for (const copy of [PROMPT_COPY.en, PROMPT_COPY.vi]) {
      for (const [key, value] of Object.entries(copy)) {
        expect(value.trim(), key).not.toBe("");
      }
    }
  });

  it("builds a detail link that keeps unusual keys safe", () => {
    expect(promptDetailHref("SCORING", "WRITE_ESSAY")).toBe("/admin/ai/prompts/SCORING/WRITE_ESSAY");
    expect(promptDetailHref("SHARED", "a b/c")).toBe("/admin/ai/prompts/SHARED/a%20b%2Fc");
  });
});

describe("hasPrompt", () => {
  const entry = (category: "SCORING" | "GENERATION", tags: string[]) => ({ category, key: "K", title: "K", tags });

  it("keeps a scoring entry only when an AI model scores it", () => {
    expect(hasPrompt(entry("SCORING", ["GEMINI", "CODE"]))).toBe(true);
    expect(hasPrompt(entry("SCORING", ["CODE"]))).toBe(false);
    expect(hasPrompt(entry("SCORING", ["AZURE", "CODE"]))).toBe(false);
  });

  it("keeps every entry of the other categories", () => {
    expect(hasPrompt(entry("GENERATION", []))).toBe(true);
  });
});

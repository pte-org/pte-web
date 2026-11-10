import type { PromptCategory, PromptLevelRow, PromptSection, PromptSummary } from "@pte/api-client";
import { PROMPT_SECTION_TITLES_VI, type PromptCopy } from "../promptConstants";

/** A list entry written as "Label: value" (e.g. "CEFR Level: {cefr}"), split so a form can show a label and a box. */
export interface LabeledValue {
  label: string;
  value: string;
}

/** Labels longer than this are sentences that merely contain a colon, not "Label: value" entries. */
const MAX_LABEL_LENGTH = 40;
const LABELED_ENTRY = /^([^:]+):\s+([\s\S]+)$/;

/** A section's title in the user's language; an id without a translation keeps the API's English title. */
export function sectionTitle(section: PromptSection, locale: string): string {
  return locale === "vi" ? (PROMPT_SECTION_TITLES_VI[section.id] ?? section.title) : section.title;
}

export function categoryLabel(copy: PromptCopy, category: PromptCategory): string {
  switch (category) {
    case "GENERATION":
      return copy.CATEGORY_GENERATION;
    case "REVIEW":
      return copy.CATEGORY_REVIEW;
    case "SCORING":
      return copy.CATEGORY_SCORING;
    case "SHARED":
      return copy.CATEGORY_SHARED;
    case "CHATBOT":
      return copy.CATEGORY_CHATBOT;
  }
}

/** The name of an engine tag; any other tag (a skill) is shown as it is. */
export function tagLabel(copy: PromptCopy, tag: string): string {
  switch (tag) {
    case "GEMINI":
      return copy.ENGINE_GEMINI;
    case "AZURE":
      return copy.ENGINE_AZURE;
    case "CODE":
      return copy.ENGINE_CODE;
    case "LLM":
      return copy.ENGINE_LLM;
    case "TTS":
      return copy.ENGINE_TTS;
    case "CHART":
      return copy.ENGINE_CHART;
    default:
      return tag;
  }
}

/** Highest level first, like the rubric screen. */
export function levelsDescending(levels: readonly PromptLevelRow[]): PromptLevelRow[] {
  return [...levels].sort((left, right) => right.level - left.level);
}

/** "Label: value" split in two, or null when the entry is a plain sentence. */
export function splitLabeled(entry: string): LabeledValue | null {
  const match = LABELED_ENTRY.exec(entry);
  if (!match) return null;
  const label = match[1].trim();
  return label.length <= MAX_LABEL_LENGTH ? { label, value: match[2].trim() } : null;
}

const AI_SCORING_ENGINE = "GEMINI";

/** Only a scoring entry that an AI model scores has a prompt; the others are scored by code or the speech engine. */
export const hasPrompt = (entry: PromptSummary): boolean =>
  entry.category !== "SCORING" || entry.tags.includes(AI_SCORING_ENGINE);

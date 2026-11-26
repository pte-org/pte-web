import type { QuestionGenerationLiveCheck } from "@pte/api-client";
import { detailValue, type CheckCopy } from "../liveCheckCopy";

export interface BriefLine {
  key: string;
  label: string;
  value: string;
}

/** What the writer was asked for in its current round, read from the live feed's prompt check. */
export interface WritingBrief {
  lines: BriefLine[];
  /** The topics already in the bank that it was told to avoid. */
  avoided: string[];
}

/** The lines of the prompt check worth showing, in this order; the topics to avoid are listed apart. */
const BRIEF_KEYS = ["cefr", "topicHint", "feedback", "taskPrompt", "systemPrompt"] as const;
const AVOIDED_KEY = "avoidedTopics";
const TOPIC_SEPARATOR = ", ";

/**
 * The brief the writer received: its level, its topic, the feedback of a rejected round, the size of its prompt and
 * the topics to avoid. Empty until the prompt check of the round arrives.
 */
export function writingBrief(
  checks: readonly QuestionGenerationLiveCheck[],
  copy: CheckCopy,
): WritingBrief {
  const prompt = [...checks].reverse().find((check) => check.step === "PROMPT");
  const details = prompt?.details ?? [];
  const lines = BRIEF_KEYS.flatMap((key): BriefLine[] => {
    const detail = details.find((entry) => entry.key === key);
    if (!detail || (key === "feedback" && !detail.text)) return [];
    return [{ key, label: copy.details[key] ?? key, value: detailValue(detail, copy) }];
  });
  const avoidedText = details.find((entry) => entry.key === AVOIDED_KEY)?.text ?? "";
  const avoided = avoidedText
    .split(TOPIC_SEPARATOR)
    .map((topic) => topic.trim())
    .filter((topic) => topic.length > 0);
  return { lines, avoided };
}

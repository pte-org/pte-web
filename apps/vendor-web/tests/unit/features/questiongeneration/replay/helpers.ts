import type {
  QuestionGenerationCheckStep,
  QuestionGenerationLiveEvent,
  QuestionGenerationLiveItem,
} from "@pte/api-client";

/** Builders for the events and snapshots of the live stream, for the tests of the replay engine. */
export const INDEX = 0;

export const check = (
  step: QuestionGenerationCheckStep,
  status: "RUNNING" | "PASSED" | "FAILED" = "PASSED",
): QuestionGenerationLiveEvent => ({
  type: "check",
  index: INDEX,
  step,
  status,
  facts: {},
});

export const begin = (
  agent: "GENERATOR" | "REVIEWER",
  attempt = 1,
  model?: string,
): QuestionGenerationLiveEvent => ({ type: "begin", index: INDEX, agent, attempt, ...(model ? { model } : {}) });

export const token = (agent: "GENERATOR" | "REVIEWER", delta: string): QuestionGenerationLiveEvent => ({
  type: "token",
  index: INDEX,
  agent,
  delta,
});

export const thinking = (agent: "GENERATOR" | "REVIEWER", delta: string): QuestionGenerationLiveEvent => ({
  type: "thinking",
  index: INDEX,
  agent,
  delta,
});

export const draft = (attempt: number): QuestionGenerationLiveEvent =>
  ({
    type: "draft",
    index: INDEX,
    attempt,
    fields: { promptText: `draft ${attempt}` },
  }) as unknown as QuestionGenerationLiveEvent;

export const verdict = (
  passed: boolean,
  kind: "CONTENT" | "IMAGE" = "CONTENT",
): QuestionGenerationLiveEvent => ({
  type: "review",
  index: INDEX,
  kind,
  passed,
  fixSuggestion: passed ? null : "fix it",
  notes: {},
});

export const media = (audioRef: string | null, imageRef: string | null = null): QuestionGenerationLiveEvent => ({
  type: "media",
  index: INDEX,
  audioRef,
  imageRef,
});

export const stage = (value: Extract<QuestionGenerationLiveEvent, { type: "stage" }>["stage"]): QuestionGenerationLiveEvent => ({
  type: "stage",
  index: INDEX,
  stage: value,
});

export const end: QuestionGenerationLiveEvent = { type: "end", finished: true };

/** One question as the snapshot of the stream reports it. */
export function live(overrides: Partial<QuestionGenerationLiveItem> = {}): QuestionGenerationLiveItem {
  return {
    index: INDEX,
    stage: "GENERATING",
    activeAgent: "GENERATOR",
    generator: null,
    reviewer: null,
    audioRef: null,
    imageRef: null,
    checks: [],
    ...overrides,
  };
}

export const liveCheck = (
  step: QuestionGenerationCheckStep,
  status: "RUNNING" | "PASSED" | "FAILED" = "PASSED",
): NonNullable<QuestionGenerationLiveItem["checks"]>[number] => ({ index: INDEX, step, status, facts: {} });

export const liveDraft = (attempt: number): NonNullable<QuestionGenerationLiveItem["draft"]> =>
  ({ index: INDEX, attempt, fields: { promptText: `draft ${attempt}` } }) as unknown as NonNullable<
    QuestionGenerationLiveItem["draft"]
  >;

export const liveReview = (
  passed: boolean,
  kind: "CONTENT" | "IMAGE" = "CONTENT",
): NonNullable<QuestionGenerationLiveItem["review"]> => ({
  index: INDEX,
  kind,
  passed,
  fixSuggestion: null,
  notes: {},
});

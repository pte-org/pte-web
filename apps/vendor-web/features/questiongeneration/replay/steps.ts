import type { QuestionGenerationLiveCheck } from "@pte/api-client";
import type {
  CheckStep,
  ItemScript,
  MediaStep,
  PromptStep,
  ReviewStep,
  ScriptStep,
  StepKind,
  WriteStep,
} from "./scriptTypes";

/** Where a kind of step sits among the others of a round. */
const KIND_ORDER: Readonly<Record<StepKind, number>> = {
  previousRounds: 0,
  prompt: 1,
  write: 2,
  check: 3,
  review: 4,
  media: 5,
  assemble: 6,
  outcome: 7,
};
const ROUND_WEIGHT = 10;
/** Assembling and the outcome come after every round. */
const AFTER_ROUNDS = 1_000_000;

export const stepKey = (kind: StepKind, round: number, attempt = 0, sub = ""): string =>
  `${kind}:${round}:${attempt}:${sub}`;

/** Position of a step in a script: a step may only be appended at or after the last one. */
export const rankOf = (step: ScriptStep): number =>
  step.kind === "assemble" || step.kind === "outcome"
    ? AFTER_ROUNDS + KIND_ORDER[step.kind]
    : step.round * ROUND_WEIGHT + KIND_ORDER[step.kind];

export const newItem = (index: number): ItemScript => ({
  index,
  steps: [],
  round: 0,
  ended: false,
  pendingOutcome: null,
});

export const newPrompt = (round: number, check: QuestionGenerationLiveCheck | null): PromptStep => ({
  key: stepKey("prompt", round),
  kind: "prompt",
  round,
  check,
});

export const newWrite = (round: number, attempt: number): WriteStep => ({
  key: stepKey("write", round, attempt),
  kind: "write",
  round,
  attempt,
  model: "",
  text: "",
  thinking: "",
  thinkingChars: 0,
  draft: null,
  check: null,
  superseded: false,
});

export const newReview = (round: number, attempt: number): ReviewStep => ({
  key: stepKey("review", round, attempt),
  kind: "review",
  round,
  attempt,
  model: "",
  text: "",
  thinking: "",
  thinkingChars: 0,
  verdict: null,
  checks: {},
  superseded: false,
});

export const newMedia = (round: number): MediaStep => ({
  key: stepKey("media", round),
  kind: "media",
  round,
  audioRef: null,
  imageRef: null,
  imageReview: null,
  superseded: false,
});

export const newCheck = (round: number, check: QuestionGenerationLiveCheck): CheckStep => ({
  key: stepKey("check", round, 0, check.step),
  kind: "check",
  round,
  check,
});

/** The last step of a kind in a round, with its position, or null. */
export function lastOf<K extends StepKind>(
  steps: readonly ScriptStep[],
  kind: K,
  round: number,
): { step: Extract<ScriptStep, { kind: K }>; at: number } | null {
  for (let at = steps.length - 1; at >= 0; at--) {
    const step = steps[at];
    if (step && step.kind === kind && step.round === round) {
      return { step: step as Extract<ScriptStep, { kind: K }>, at };
    }
  }
  return null;
}

export const replaceAt = (steps: readonly ScriptStep[], at: number, step: ScriptStep): ScriptStep[] =>
  steps.map((existing, position) => (position === at ? step : existing));

import type {
  QuestionGenerationLiveCheck,
  QuestionGenerationLiveDraft,
  QuestionGenerationLiveReview,
} from "@pte/api-client";

/**
 * The script of one question: the steps its agents took, in the order they ran. It only ever grows: a step is never
 * removed, moved or shortened, so a replay that has shown a step can rely on it staying where it is.
 */
export type StepKind =
  | "previousRounds"
  | "prompt"
  | "write"
  | "check"
  | "review"
  | "media"
  | "assemble"
  | "outcome";

/** How the question ended. READY is a question written into the form it was asked from and not saved. */
export type ItemOutcome = "SAVED" | "READY" | "FAILED" | "CANCELLED";

interface StepBase {
  /** Names the step across snapshots: kind, round and (for a write) the attempt. Equal keys are the same step. */
  key: string;
  kind: StepKind;
  /** The round of writing (a new PROMPT check opens the next one); 0 for steps outside any round. */
  round: number;
}

export interface PreviousRoundsStep extends StepBase {
  kind: "previousRounds";
  /** How many earlier rounds a snapshot summed up; they have no text of their own to replay. */
  rounds: number;
}

export interface PromptStep extends StepBase {
  kind: "prompt";
  check: QuestionGenerationLiveCheck | null;
}

export interface WriteStep extends StepBase {
  kind: "write";
  attempt: number;
  /** The model that answered this attempt; empty when the stream did not say. */
  model: string;
  text: string;
  /** The end of what a reasoning model thought, and how many characters it thought in all. */
  thinking: string;
  thinkingChars: number;
  /** The draft the writer produced in this round (set once the draft event arrives). */
  draft: QuestionGenerationLiveDraft | null;
  check: QuestionGenerationLiveCheck | null;
  /** Written again in the same round (a retry or the fallback model): this attempt is no longer the answer. */
  superseded: boolean;
}

export interface CheckStep extends StepBase {
  kind: "check";
  check: QuestionGenerationLiveCheck;
}

export interface ReviewStep extends StepBase {
  kind: "review";
  attempt: number;
  model: string;
  text: string;
  thinking: string;
  thinkingChars: number;
  verdict: QuestionGenerationLiveReview | null;
  /** The reviewer's own checks (prompt, write, verdict), by step name. */
  checks: Readonly<Record<string, QuestionGenerationLiveCheck>>;
  superseded: boolean;
}

export interface MediaStep extends StepBase {
  kind: "media";
  audioRef: string | null;
  imageRef: string | null;
  /** The drawn chart was looked over by the image reviewer (stage REVIEWING after RENDERING_MEDIA). */
  imageReview: QuestionGenerationLiveReview | null;
  /** A later round replaced this media: the reviewer refused it and it was removed. */
  superseded: boolean;
}

export interface AssembleStep extends StepBase {
  kind: "assemble";
}

export interface OutcomeStep extends StepBase {
  kind: "outcome";
  outcome: ItemOutcome;
}

export type ScriptStep =
  | PreviousRoundsStep
  | PromptStep
  | WriteStep
  | CheckStep
  | ReviewStep
  | MediaStep
  | AssembleStep
  | OutcomeStep;

export interface ItemScript {
  index: number;
  steps: readonly ScriptStep[];
  /** The current round of writing: the number of PROMPT checks seen (or snapshot rounds). */
  round: number;
  /** The question reached its outcome: no step is added any more. */
  ended: boolean;
  /** An outcome known to the job but held back until the stream has delivered everything before it. */
  pendingOutcome: ItemOutcome | null;
}

/** The scripts of a job's questions, by item index. */
export interface Script {
  items: Readonly<Record<number, ItemScript>>;
  /** The stream said it has nothing more to send. */
  streamEnded: boolean;
}

/** What the script builder needs to know about the job, and a place to report events it had to drop. */
export interface ScriptContext {
  /** False for a question started from the form: its READY stage is the end of it. */
  saveQuestions: boolean;
  onDropped?: (reason: string) => void;
}

export const EMPTY_SCRIPT: Script = { items: {}, streamEnded: false };

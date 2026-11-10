import type { ScoreTemplateTimeFrame } from "@pte/api-client";

export const SECONDS_PER_MINUTE = 60;

/** The window of the Pearson Score Guide, in minutes: a range per part and a ceiling for the whole test. */
export const PEARSON_TIME_FRAME_MINUTES = {
  speakingWritingMin: 76,
  speakingWritingMax: 84,
  readingMin: 23,
  readingMax: 30,
  listeningMin: 31,
  listeningMax: 39,
  totalMax: 135,
} as const;

/** What the form holds: minutes as typed, so a half-typed number is not lost. */
export interface TimeFrameDraft {
  speakingWritingMin: string;
  speakingWritingMax: string;
  readingMin: string;
  readingMax: string;
  listeningMin: string;
  listeningMax: string;
  totalMax: string;
}

export type TimeFrameProblem =
  | { kind: "not-a-number" }
  | { kind: "range"; part: "speakingWriting" | "reading" | "listening" }
  | { kind: "total" };

const minutes = (seconds: number): string => String(seconds / SECONDS_PER_MINUTE);

export const pearsonTimeFrameDraft = (): TimeFrameDraft => ({
  speakingWritingMin: String(PEARSON_TIME_FRAME_MINUTES.speakingWritingMin),
  speakingWritingMax: String(PEARSON_TIME_FRAME_MINUTES.speakingWritingMax),
  readingMin: String(PEARSON_TIME_FRAME_MINUTES.readingMin),
  readingMax: String(PEARSON_TIME_FRAME_MINUTES.readingMax),
  listeningMin: String(PEARSON_TIME_FRAME_MINUTES.listeningMin),
  listeningMax: String(PEARSON_TIME_FRAME_MINUTES.listeningMax),
  totalMax: String(PEARSON_TIME_FRAME_MINUTES.totalMax),
});

/** The form's starting values: the template's own frame, or the Pearson window when it has none yet. */
export const timeFrameToDraft = (
  frame: ScoreTemplateTimeFrame | null | undefined,
): TimeFrameDraft =>
  frame
    ? {
        speakingWritingMin: minutes(frame.speakingWritingMinSeconds),
        speakingWritingMax: minutes(frame.speakingWritingMaxSeconds),
        readingMin: minutes(frame.readingMinSeconds),
        readingMax: minutes(frame.readingMaxSeconds),
        listeningMin: minutes(frame.listeningMinSeconds),
        listeningMax: minutes(frame.listeningMaxSeconds),
        totalMax: minutes(frame.totalMaxSeconds),
      }
    : pearsonTimeFrameDraft();

const toSeconds = (value: string): number => Math.round(Number(value) * SECONDS_PER_MINUTE);

const isPositiveNumber = (value: string): boolean => value.trim() !== "" && Number(value) > 0;

/** What is wrong with the draft, or null when it can be saved; mirrors the server's rules. */
export const checkTimeFrame = (draft: TimeFrameDraft): TimeFrameProblem | null => {
  if (!Object.values(draft).every(isPositiveNumber)) return { kind: "not-a-number" };
  const parts = [
    ["speakingWriting", draft.speakingWritingMin, draft.speakingWritingMax],
    ["reading", draft.readingMin, draft.readingMax],
    ["listening", draft.listeningMin, draft.listeningMax],
  ] as const;
  for (const [part, min, max] of parts) {
    if (toSeconds(min) > toSeconds(max)) return { kind: "range", part };
  }
  const minimumSum =
    toSeconds(draft.speakingWritingMin) +
    toSeconds(draft.readingMin) +
    toSeconds(draft.listeningMin);
  return toSeconds(draft.totalMax) < minimumSum ? { kind: "total" } : null;
};

/** The payload for a valid draft; call {@link checkTimeFrame} first. */
export const draftToTimeFrame = (draft: TimeFrameDraft): ScoreTemplateTimeFrame => ({
  speakingWritingMinSeconds: toSeconds(draft.speakingWritingMin),
  speakingWritingMaxSeconds: toSeconds(draft.speakingWritingMax),
  readingMinSeconds: toSeconds(draft.readingMin),
  readingMaxSeconds: toSeconds(draft.readingMax),
  listeningMinSeconds: toSeconds(draft.listeningMin),
  listeningMaxSeconds: toSeconds(draft.listeningMax),
  totalMaxSeconds: toSeconds(draft.totalMax),
});

/** Minutes with one decimal, e.g. 4560 seconds -> "76.0". */
export const formatMinutes = (seconds: number): string => (seconds / SECONDS_PER_MINUTE).toFixed(1);

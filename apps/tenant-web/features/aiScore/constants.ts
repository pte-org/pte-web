import type { AiScoreStatus } from "@pte/api-client";

/** An AI and a manual score this far apart (on 0–100) deserve a second look. */
export const AI_MANUAL_GAP_THRESHOLD = 20;

export const AI_SCORE_STATUS_VARIANT: Record<
  AiScoreStatus,
  "neutral" | "info" | "danger" | "success"
> = {
  PENDING: "neutral",
  SCORING: "info",
  FAILED: "danger",
  SCORED: "success",
};

/** Table row highlight for answers whose AI and manual scores differ a lot. */
export const AI_GAP_ROW_CLASS = "bg-[var(--cream-tint)]";

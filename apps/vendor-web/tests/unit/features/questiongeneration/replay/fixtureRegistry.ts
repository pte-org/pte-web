import type { ItemOutcome } from "../../../../../features/questiongeneration/replay";
import type { PieceNeeds } from "../../../../../features/questiongeneration/utils/livePieces";

/**
 * Every fixture of the replay harness. `recorded` fixtures come from a real stream (`tests/tools/recordReplayFixture.mjs`);
 * `todo-record` ones are hand-written stand-ins until a real run replaces them; `handwritten` ones are rare cases that
 * a real run does not produce on demand. `snapshot-reduced` fixtures hold only snapshots, so they carry no history.
 */
export interface FixtureMeta {
  name: string;
  source: "recorded" | "todo-record" | "handwritten";
  level: "event-complete" | "snapshot-reduced";
  needs: PieceNeeds;
  needsMedia: boolean;
  /** False for a question started from the form: the READY stage of the feed is its end. */
  saveQuestions: boolean;
  /** What the job record says about the question and when it says it (the server is often far ahead of the replay). */
  outcome: { outcome: ItemOutcome; atMs: number } | null;
  /** The connection dropped at this time without an `end` event. */
  streamClosedAtMs?: number;
  /** Opened on a question that had already finished: the replay may jump to the end at mount. */
  openedFinished?: boolean;
}

const TEXT_NEEDS: PieceNeeds = { prompt: true, options: false, audio: false, image: false, reference: false };
const CHART_NEEDS: PieceNeeds = { prompt: false, options: false, audio: false, image: true, reference: false };

const text = (
  name: string,
  source: FixtureMeta["source"],
  outcome: FixtureMeta["outcome"],
  extra: Partial<FixtureMeta> = {},
): FixtureMeta => ({
  name,
  source,
  level: "event-complete",
  needs: TEXT_NEEDS,
  needsMedia: false,
  saveQuestions: true,
  outcome,
  ...extra,
});

export const FIXTURES: readonly FixtureMeta[] = [
  // Recorded 2026-11-26 from a real job on the local stack (a question started from the form, so READY is its end).
  text("cliproxy-fast", "recorded", null, { saveQuestions: false }),
  text("capstone-slow", "recorded", null, { saveQuestions: false }),
  // Both rewrites were recorded from real jobs whose level (A1) and brief (advanced vocabulary) the reviewer refused.
  text("rewrite-v2", "recorded", null, { saveQuestions: false }),
  text("fail-midway", "handwritten", { outcome: "FAILED", atMs: 1300 }),
  text("fallback-begin-repeat", "handwritten", { outcome: "SAVED", atMs: 6000 }),
  text("cancelled", "handwritten", { outcome: "CANCELLED", atMs: 1600 }),
  text("reconnect-midway", "handwritten", { outcome: "SAVED", atMs: 3000 }),
  text("reopen-finished-snapshot-only", "handwritten", { outcome: "SAVED", atMs: 0 }, {
    level: "snapshot-reduced",
    openedFinished: true,
  }),
  text("media-chart", "handwritten", { outcome: "SAVED", atMs: 3000 }, { needs: CHART_NEEDS, needsMedia: true }),
  text("reconnect-after-rewrite", "handwritten", { outcome: "SAVED", atMs: 2500 }),
  // A batch paused while the writer was answering, then resumed: the stream ends, then opens on a fresh run.
  text("pause-midway-resume", "handwritten", { outcome: "SAVED", atMs: 3000 }),
  text("outcome-before-events", "handwritten", { outcome: "SAVED", atMs: 0 }),
  text("ready-form", "handwritten", null, { saveQuestions: false }),
  text("stream-drop-no-end", "handwritten", { outcome: "SAVED", atMs: 5000 }, { streamClosedAtMs: 3500 }),
];

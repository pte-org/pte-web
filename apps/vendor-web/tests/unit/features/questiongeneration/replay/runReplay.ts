import { readFileSync } from "node:fs";
import type { QuestionGenerationLiveEvent } from "@pte/api-client";
import {
  CHART_REPLAY_MS,
  PIECE_FLY_MS,
  PIECE_GAP_MS,
  PIECE_SETTLE_MS,
  STEP_DWELL_MS,
} from "../../../../../features/questiongeneration/assemblyConstants";
import {
  advance,
  endPlayhead,
  extendScript,
  frameOf,
  nextReleased,
  settleOutcome,
  START_PLAYHEAD,
  type Frame,
  type FrameContext,
  type ItemScript,
  type Playhead,
  type ReplaySettings,
  type Script,
} from "../../../../../features/questiongeneration/replay";
import { EMPTY_SCRIPT } from "../../../../../features/questiongeneration/replay";
import type { FixtureMeta } from "./fixtureRegistry";
import { doneViolation, frameViolations } from "./invariants";

export const TICK_MS = 50;
const AFTER_FIXTURE_MS = 2000;
const PIECE_CYCLE_MS = PIECE_GAP_MS + PIECE_FLY_MS + PIECE_SETTLE_MS;
const MS_PER_SECOND = 1000;
const HELD_TICKS_BEFORE_CONTINUE = 2;

export interface TimedEvent {
  atMs: number;
  event: QuestionGenerationLiveEvent;
}

export interface RunMode {
  name: string;
  charsPerSecond: number;
  /** Press "show all" whenever text is being typed. */
  revealAll?: boolean;
  /** Play with "pause after each step" on; the runner presses Continue after a moment. */
  pause?: boolean;
  /** The question was opened already finished: jump to the end when it is first built. */
  skip?: boolean;
  tickMs?: number;
  /** Replaces the time the job record reports the outcome (to try an outcome that comes early). */
  outcomeAtMs?: number;
}

export interface RunResult {
  violations: string[];
  frames: Frame[];
  finalFrame: Frame | undefined;
  /** The time, in the replay, at which the frame became `done` (null if it never did). */
  doneAtMs: number | null;
  budgetMs: number;
}

export const MODES: readonly RunMode[] = [
  { name: "default", charsPerSecond: 30 },
  { name: "fast", charsPerSecond: 60 },
  { name: "reveal-all", charsPerSecond: 30, revealAll: true },
  { name: "pause", charsPerSecond: 60, pause: true },
  { name: "skip", charsPerSecond: 30, skip: true },
];

export function loadFixture(name: string): TimedEvent[] {
  const url = new URL(`../../../../fixtures/replay/${name}.ndjson`, import.meta.url);
  return readFileSync(url, "utf8")
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => JSON.parse(line) as TimedEvent);
}

/** Time the replay needs at most: all the text at the pace, the pieces, the steps and the chart, with some spare. */
function budgetOf(item: ItemScript | undefined, mode: RunMode, lastEventMs: number): number {
  const chars = (item?.steps ?? []).reduce(
    (sum, step) => sum + (step.kind === "write" || step.kind === "review" ? step.text.length : 0),
    0,
  );
  const steps = item?.steps.length ?? 0;
  return (
    lastEventMs +
    (chars / mode.charsPerSecond) * MS_PER_SECOND +
    12 * PIECE_CYCLE_MS +
    steps * STEP_DWELL_MS +
    CHART_REPLAY_MS +
    AFTER_FIXTURE_MS
  );
}

const contextOf = (meta: FixtureMeta): FrameContext => ({ needs: meta.needs, needsMedia: meta.needsMedia });

/** Plays a fixture through the engine in virtual time and checks every frame against the invariants. */
export function runFixture(meta: FixtureMeta, mode: RunMode): RunResult {
  const events = loadFixture(meta.name);
  const lastEventMs = events.at(-1)?.atMs ?? 0;
  const context = contextOf(meta);
  const tick = mode.tickMs ?? TICK_MS;
  const settings: ReplaySettings = {
    charsPerSecond: mode.charsPerSecond,
    pauseEachStep: mode.pause === true,
    revealAll: false,
  };
  const outcome = meta.outcome ? { ...meta.outcome, atMs: mode.outcomeAtMs ?? meta.outcome.atMs } : null;
  const fullScript = events.reduce(
    (script, { event }) => extendScript(script, event, { saveQuestions: meta.saveQuestions }),
    EMPTY_SCRIPT,
  );
  const budgetMs = budgetOf(fullScript.items[0], mode, Math.max(lastEventMs, outcome?.atMs ?? 0));

  let script: Script = EMPTY_SCRIPT;
  let playhead: Playhead = START_PLAYHEAD;
  let delivered = 0;
  let outcomeSet = false;
  let mounted = false;
  let heldTicks = 0;
  let previousStep: number | null = null;
  const violations: string[] = [];
  const frames: Frame[] = [];
  let doneAtMs: number | null = null;

  for (let now = 0; now <= budgetMs; now += tick) {
    while (delivered < events.length && (events[delivered]?.atMs ?? Infinity) <= now) {
      const next = events[delivered]?.event;
      if (next) script = extendScript(script, next, { saveQuestions: meta.saveQuestions });
      delivered++;
    }
    const closed = meta.streamClosedAtMs !== undefined && now >= meta.streamClosedAtMs;
    if (outcome && !outcomeSet && now >= outcome.atMs) {
      outcomeSet = true;
      script = settleOutcome(script, 0, outcome.outcome, script.streamEnded ? "end" : closed ? "closed-terminal" : "pending");
    } else if (outcome && outcomeSet && closed && script.items[0]?.pendingOutcome) {
      script = settleOutcome(script, 0, outcome.outcome, "closed-terminal");
    }
    const item = script.items[0];
    if (!item || item.steps.length === 0) continue;
    if (!mounted) {
      mounted = true;
      if (mode.skip && meta.openedFinished && item.ended) playhead = endPlayhead(item, context);
    }
    settings.revealAll = mode.revealAll === true && (frames.at(-1)?.typing ?? true);
    playhead = advance(playhead, item, tick, settings, context);
    const frame = frameOf(item, playhead, settings, context);
    violations.push(
      ...frameViolations({ frame, item, previousStep }).map((problem) => `${meta.name}/${mode.name}@${now}ms: ${problem}`),
    );
    previousStep = frame.stepIndex;
    frames.push(frame);
    if (frame.done && doneAtMs === null) doneAtMs = now;
    heldTicks = frame.held ? heldTicks + 1 : 0;
    if (heldTicks >= HELD_TICKS_BEFORE_CONTINUE) {
      playhead = { ...playhead, released: nextReleased(playhead, item) };
      heldTicks = 0;
    }
  }
  const finalFrame = frames.at(-1);
  const expectDone = outcome !== null || !meta.saveQuestions;
  violations.push(...doneViolation(finalFrame, expectDone).map((problem) => `${meta.name}/${mode.name}: ${problem}`));
  return { violations, frames, finalFrame, doneAtMs, budgetMs };
}

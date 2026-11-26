import { describe, expect, it } from "vitest";
import {
  PIECE_FLY_MS,
  PIECE_GAP_MS,
  PIECE_SETTLE_MS,
  STEP_DWELL_MS,
  THINKING_REVEAL_AFTER_MS,
} from "../../../../../features/questiongeneration/assemblyConstants";
import {
  advance,
  endPlayhead,
  frameOf,
  nextReleased,
  START_PLAYHEAD,
} from "../../../../../features/questiongeneration/replay";
import { begin, check, draft, stage, thinking, token, verdict } from "./helpers";
import { CONTEXT, SETTINGS, play, scriptOf } from "./playHelpers";

const TEXT = "x".repeat(300);
const writing = [check("PROMPT"), begin("GENERATOR"), token("GENERATOR", TEXT)] as const;
const full = [
  ...writing,
  check("WRITE"),
  draft(1),
  check("JSON"),
  begin("REVIEWER"),
  token("REVIEWER", "fine"),
  verdict(true),
] as const;

const typed = (item: ReturnType<typeof scriptOf>, ms: number, cps: number): number => {
  const frame = frameOf(item, play(item, ms, 50, { ...SETTINGS, charsPerSecond: cps }), SETTINGS, CONTEXT);
  return frame.view.generator?.text.length ?? 0;
};

describe("advance: typing", () => {
  const item = scriptOf(writing);

  it.each([15, 30, 60])("types at %i characters a second", (cps) => {
    const seconds = 4;
    expect(typed(item, STEP_DWELL_MS + seconds * 1000, cps)).toBe(seconds * cps);
  });

  it("continues from where it was when the pace changes", () => {
    const slow = play(item, STEP_DWELL_MS + 1000, 50, { ...SETTINGS, charsPerSecond: 30 });
    const faster = play(item, 1000, 50, { ...SETTINGS, charsPerSecond: 60 }, slow);

    expect(frameOf(item, faster, SETTINGS, CONTEXT).view.generator?.text.length).toBe(30 + 60);
  });

  it("is the same whether time arrives in 50 ms ticks or 1 s ticks", () => {
    for (const total of [500, 1500, 4000, 7000, 20000]) {
      expect(play(item, total, 50)).toEqual(play(item, total, 1000));
    }
  });

  it("changes nothing for 0 ms", () => {
    const here = play(item, 3000, 50);

    expect(advance(here, item, 0, SETTINGS, CONTEXT)).toEqual(here);
  });

  it("never leaves the first step before the last one is typed and never skips a step", () => {
    const whole = scriptOf(full);
    const big = advance(START_PLAYHEAD, whole, 5000, SETTINGS, CONTEXT);
    const small = play(whole, 5000, 50);

    expect(big).toEqual(small);
  });

  it("shows the whole text of the step at once on reveal all, without leaving the step", () => {
    const here = advance(START_PLAYHEAD, item, STEP_DWELL_MS + 100, SETTINGS, CONTEXT);
    const revealed = advance(here, item, 0, { ...SETTINGS, revealAll: true }, CONTEXT);
    const frame = frameOf(item, revealed, SETTINGS, CONTEXT);

    expect(frame.view.generator?.text).toBe(TEXT);
    expect(frame.stepIndex).toBe(here.step);
  });
});

describe("advance: the live edge", () => {
  it("waits at the last step it has and goes on when more steps arrive", () => {
    const early = scriptOf(writing);
    const waiting = play(early, 60_000, 500);

    expect(waiting.step).toBe(early.steps.length - 1);
    expect(frameOf(early, waiting, SETTINGS, CONTEXT).atLiveEdge).toBe(true);

    const later = scriptOf([...writing, check("JSON")]);
    const moved = play(later, 2000, 500, SETTINGS, waiting);

    expect(moved.step).toBe(waiting.step + 1);
  });

  it("types on when the text of the step grows", () => {
    const short = scriptOf([check("PROMPT"), begin("GENERATOR"), token("GENERATOR", "abc")]);
    const done = play(short, 5000, 100);
    const longer = scriptOf([check("PROMPT"), begin("GENERATOR"), token("GENERATOR", "abcdef")]);
    const more = play(longer, 1000, 100, SETTINGS, done);

    expect(frameOf(longer, more, SETTINGS, CONTEXT).view.generator?.text).toBe("abcdef");
  });
});

describe("advance: pause after each step", () => {
  const item = scriptOf(full);
  const pausing = { ...SETTINGS, pauseEachStep: true };

  it("stays at the end of a step until it is released, then goes one step and stops again", () => {
    const stuck = play(item, 30_000, 250, pausing);
    expect(stuck.step).toBe(0);
    expect(frameOf(item, stuck, pausing, CONTEXT).held).toBe(true);

    const released = { ...stuck, released: nextReleased(stuck, item) };
    const next = play(item, 30_000, 250, pausing, released);

    expect(next.step).toBe(1);
  });

  it("does not release steps that have not been written yet", () => {
    const edge = scriptOf(writing);
    const here = { ...play(edge, 60_000, 500, pausing), released: 1 };

    expect(nextReleased(here, edge)).toBe(1);
  });
});

describe("advance: the pieces", () => {
  const ready = [...full, stage("READY")] as const;
  const item = scriptOf(ready, false);
  const at = item.steps.findIndex((step) => step.kind === "assemble");
  const start = { ...START_PLAYHEAD, step: at, released: at + 1 };
  const frameAfter = (ms: number) => frameOf(item, play(item, ms, 50, SETTINGS, start), SETTINGS, CONTEXT);

  it("places a piece after a pause, a flight and a moment standing out", () => {
    expect(frameAfter(PIECE_GAP_MS - 50).flying).toBeNull();
    expect(frameAfter(PIECE_GAP_MS + 50).flying).toBe("prompt");
    expect(frameAfter(PIECE_GAP_MS + PIECE_FLY_MS + 50).settling).toBe("prompt");
    expect(frameAfter(PIECE_GAP_MS + PIECE_FLY_MS + 50).placed.has("prompt")).toBe(true);
  });

  it("goes on to the outcome once the last piece has settled", () => {
    const total = PIECE_GAP_MS + PIECE_FLY_MS + PIECE_SETTLE_MS;
    const frame = frameAfter(total + 100);

    expect(frame.step?.kind).toBe("outcome");
    expect(frame.done).toBe(true);
    expect(frame.placed.has("prompt")).toBe(true);
  });

  it("places no piece before the assemble step", () => {
    const early = frameOf(item, play(item, 2000, 50), SETTINGS, CONTEXT);

    expect(early.placed.size).toBe(0);
    expect(early.flying).toBeNull();
  });
});

describe("advance: thinking", () => {
  it("shows the train of thought only after it has been going on for a while", () => {
    const item = scriptOf([
      check("PROMPT"),
      begin("GENERATOR"),
      thinking("GENERATOR", "hmm hmm"),
      token("GENERATOR", "y".repeat(600)),
    ]);
    const at = (ms: number) =>
      frameOf(item, play(item, ms, 50), SETTINGS, CONTEXT).view.generator?.thinking;

    expect(at(STEP_DWELL_MS + THINKING_REVEAL_AFTER_MS - 100)).toBe("");
    expect(at(STEP_DWELL_MS + THINKING_REVEAL_AFTER_MS + 100)).toBe("hmm hmm");
  });
});

describe("endPlayhead", () => {
  it("is the last step with everything shown", () => {
    const item = scriptOf([...full, stage("READY")], false);
    const frame = frameOf(item, endPlayhead(item, CONTEXT), SETTINGS, CONTEXT);

    expect(frame.done).toBe(true);
    expect(frame.view.generator?.text).toBe(TEXT);
    expect(frame.placed.has("prompt")).toBe(true);
  });
});

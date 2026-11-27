import { describe, expect, it } from "vitest";
import {
  buildScript,
  chipOf,
  chipOfStep,
  endPlayhead,
  frameOf,
  settleOutcome,
  START_PLAYHEAD,
} from "../../../../../features/questiongeneration/replay";
import { INDEX, begin, check, draft, end, media, stage, token, verdict } from "./helpers";
import { CONTEXT, SETTINGS, play, scriptOf } from "./playHelpers";

const TEXT = "z".repeat(400);
const oneRound = [
  check("PROMPT"),
  begin("GENERATOR"),
  token("GENERATOR", TEXT),
  check("WRITE"),
  draft(1),
  check("JSON"),
  check("RULES"),
  begin("REVIEWER"),
  token("REVIEWER", "fine"),
  verdict(true),
] as const;

describe("frameOf: the bug the replay engine exists for", () => {
  it("keeps every chip and the stage at the step being typed while the server already says SAVED", () => {
    // The job record says SAVED long before the screen has typed the writer's answer.
    const script = buildScript(null, oneRound);
    const held = settleOutcome(script, INDEX, "SAVED", "pending").items[INDEX];
    const frame = frameOf(held, play(held as NonNullable<typeof held>, 800, 50), SETTINGS, CONTEXT);

    expect(frame.step?.kind).toBe("write");
    expect(frame.chip).toEqual({ rank: 1, stage: "GENERATING" });
    expect(frame.view.stage).toBe("GENERATING");
    expect(frame.outcome).toBeNull();
    expect(frame.done).toBe(false);
    expect(frame.steps.find((step) => step.id === "write")?.status).toBe("active");
    expect(frame.steps.find((step) => step.id === "save")?.status).toBe("waiting");
  });

  it("shows the outcome only when the playhead is on the outcome step", () => {
    const script = settleOutcome(buildScript(null, oneRound), INDEX, "SAVED", "end");
    const item = script.items[INDEX];
    const frames = [];
    let playhead = START_PLAYHEAD;
    for (let tick = 0; tick < 200; tick++) {
      playhead = play(item as NonNullable<typeof item>, 100, 50, SETTINGS, playhead);
      frames.push(frameOf(item, playhead, SETTINGS, CONTEXT));
    }

    for (const frame of frames) {
      expect(frame.outcome === null).toBe(frame.step?.kind !== "outcome");
    }
    expect(frames.at(-1)?.outcome).toBe("SAVED");
  });
});

describe("frameOf: one source for every part of the screen", () => {
  it("depends only on the step the playhead is on: a pending outcome changes no chip", () => {
    const base = scriptOf(oneRound);
    const held = settleOutcome({ items: { [INDEX]: base }, streamEnded: false }, INDEX, "FAILED", "pending").items[INDEX];
    const playhead = play(base, 5000, 50);

    expect(chipOf(frameOf(held, playhead, SETTINGS, CONTEXT))).toEqual(
      chipOf(frameOf(base, playhead, SETTINGS, CONTEXT)),
    );
  });

  it("ranks the chips from queued to outcome", () => {
    const item = scriptOf([...oneRound, media("audio-1"), stage("READY")], false);
    const ranks = item.steps.map((step) => chipOfStep(step).rank);

    expect(ranks).toEqual([...ranks].sort((left, right) => left - right));
    expect(chipOfStep(null)).toEqual({ rank: 0, stage: "QUEUED" });
  });

  it("makes the step bar, the stage and the chip agree on the same step", () => {
    const item = scriptOf(oneRound);
    const stageToId: Record<string, string> = {
      GENERATING: "write",
      VALIDATING: "validate",
      REVIEWING: "review",
    };
    for (let ms = 0; ms <= 20_000; ms += 250) {
      const frame = frameOf(item, play(item, ms, 50), SETTINGS, CONTEXT);
      const active = frame.steps.find((step) => step.status === "active");
      expect(frame.chip.stage).toBe(frame.view.stage);
      if (frame.step?.kind !== "prompt") expect(stageToId[frame.chip.stage]).toBe(active?.id);
    }
  });

  it("shows no field as ready on the exam screen before the review has passed", () => {
    const item = scriptOf(oneRound);
    const frame = frameOf(item, play(item, 3000, 50), SETTINGS, CONTEXT);

    expect(frame.step?.kind).toBe("write");
    expect(frame.pieces.filter((piece) => piece.ready)).toEqual([]);
    expect(frame.placed.size).toBe(0);
  });

  it("starts round 2 with V2 on the step bar and flags the review", () => {
    const item = scriptOf([
      ...oneRound.slice(0, -1),
      verdict(false),
      check("PROMPT"),
      begin("GENERATOR"),
      token("GENERATOR", "second"),
    ]);
    const frame = frameOf(item, endPlayhead(item, CONTEXT), SETTINGS, CONTEXT);

    expect(frame.steps.find((step) => step.id === "write")?.round).toBe(2);
    expect(frame.steps.find((step) => step.id === "review")?.flagged).toBe(true);
    expect(frame.view.generator?.attempt).toBe(2);
  });

  it("marks the step a failed question stopped at, not the save step", () => {
    const failed = settleOutcome(buildScript(null, oneRound), INDEX, "FAILED", "end").items[INDEX];
    const frame = frameOf(failed, endPlayhead(failed as NonNullable<typeof failed>, CONTEXT), SETTINGS, CONTEXT);

    expect(frame.steps.find((step) => step.id === "review")?.status).toBe("failed");
    expect(frame.steps.find((step) => step.id === "save")?.status).toBe("waiting");
    expect(frame.outcome).toBe("FAILED");
  });

  it("says it is at the live edge only while the script may still grow", () => {
    const open = scriptOf(oneRound);
    const closed = settleOutcome(buildScript(null, [...oneRound, end]), INDEX, "SAVED", "end").items[INDEX];

    expect(frameOf(open, endPlayhead(open, CONTEXT), SETTINGS, CONTEXT).atLiveEdge).toBe(true);
    expect(frameOf(closed, endPlayhead(closed as NonNullable<typeof closed>, CONTEXT), SETTINGS, CONTEXT).atLiveEdge).toBe(
      false,
    );
  });

  it("gives an empty frame for a question with no script yet", () => {
    const frame = frameOf(undefined, START_PLAYHEAD, SETTINGS, CONTEXT);

    expect(frame.step).toBeNull();
    expect(frame.chip.stage).toBe("QUEUED");
    expect(frame.done).toBe(false);
  });
});

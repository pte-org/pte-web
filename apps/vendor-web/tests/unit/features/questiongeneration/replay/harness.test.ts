import { describe, expect, it, vi } from "vitest";
import { START_PLAYHEAD, frameOf } from "../../../../../features/questiongeneration/replay";
import { FIXTURES } from "./fixtureRegistry";
import { doneViolation, frameViolations } from "./invariants";
import { CONTEXT, SETTINGS, play, scriptOf } from "./playHelpers";
import { MODES, loadFixture, runFixture } from "./runReplay";
import { begin, check, draft, token, verdict } from "./helpers";

describe("replay harness: every fixture keeps every invariant at every tick", () => {
  it("has at least eight fixtures, labelled by where they come from", () => {
    expect(FIXTURES.length).toBeGreaterThanOrEqual(8);
    const pending = FIXTURES.filter((fixture) => fixture.source === "todo-record").map((fixture) => fixture.name);
    if (pending.length > 0) {
      console.warn(`replay fixtures still to be recorded from a real run: ${pending.join(", ")}`);
    }
  });

  describe.each(FIXTURES)("$name", (meta) => {
    it.each(MODES.filter((mode) => mode.name !== "skip" || meta.openedFinished))(
      "mode $name",
      (mode) => {
        const result = runFixture(meta, mode);

        expect(result.violations).toEqual([]);
        expect(result.frames.length).toBeGreaterThan(0);
      },
    );
  });

  it("reaches the end of every fixture that has an outcome", () => {
    for (const meta of FIXTURES.filter((fixture) => fixture.outcome || !fixture.saveQuestions)) {
      const result = runFixture(meta, MODES[0] as (typeof MODES)[number]);

      expect(result.finalFrame?.done, meta.name).toBe(true);
      expect(result.doneAtMs, meta.name).not.toBeNull();
    }
  });

  it("jumps to the end at once for a question opened already finished", () => {
    const meta = FIXTURES.find((fixture) => fixture.openedFinished);
    const skip = runFixture(meta as NonNullable<typeof meta>, { name: "skip", charsPerSecond: 30, skip: true });

    expect(skip.doneAtMs).toBe(0);
  });

  it("makes the same final frame whether the replay ticks every 50 ms or every second", () => {
    for (const meta of FIXTURES.filter((fixture) => fixture.source !== "todo-record" || fixture.name === "cliproxy-fast")) {
      const fast = runFixture(meta, { name: "tick50", charsPerSecond: 30, tickMs: 50 });
      const slow = runFixture(meta, { name: "tick1000", charsPerSecond: 30, tickMs: 1000 });

      expect(slow.finalFrame?.done, meta.name).toBe(fast.finalFrame?.done);
      expect(slow.finalFrame?.outcome, meta.name).toBe(fast.finalFrame?.outcome);
    }
  });
});

describe("replay harness: the bug the user saw", () => {
  it("keeps the chip at the step being typed on the slow model even when the job record says SAVED at once", () => {
    // The recording is of a question started from the form; here the same stream belongs to a saved question whose
    // job record says SAVED at the very start, long before the slow model's answer arrives.
    const recorded = FIXTURES.find((fixture) => fixture.name === "capstone-slow") as NonNullable<
      (typeof FIXTURES)[number]
    >;
    const meta = { ...recorded, saveQuestions: true, outcome: { outcome: "SAVED" as const, atMs: 0 } };
    const result = runFixture(meta, { name: "saved-at-once", charsPerSecond: 30 });
    const early = result.frames.find((frame) => frame.step?.kind === "write" && frame.typing);

    expect(result.violations).toEqual([]);
    expect(early?.chip.stage).toBe("GENERATING");
    expect(early?.outcome).toBeNull();
    expect(result.finalFrame?.outcome).toBe("SAVED");
  });
});

describe("replay harness: the invariants catch what they are for", () => {
  const item = scriptOf([
    check("PROMPT"),
    begin("GENERATOR"),
    token("GENERATOR", "x".repeat(200)),
    check("WRITE"),
    draft(1),
    check("JSON"),
    begin("REVIEWER"),
    token("REVIEWER", "ok"),
    verdict(true),
  ]);
  const healthy = frameOf(item, play(item, 3000, 50), SETTINGS, CONTEXT);
  const facts = (frame: typeof healthy, previousStep: number | null = null) => ({ frame, item, previousStep });

  it("finds nothing wrong with a healthy frame", () => {
    expect(frameViolations(facts(healthy))).toEqual([]);
  });

  it("I1: reports a playhead that went back", () => {
    expect(frameViolations(facts(healthy, healthy.stepIndex + 1)).join()).toContain("I1");
  });

  it("I2: reports a chip ahead of the step, a stage ahead of it and a step bar ahead of it", () => {
    const chipAhead = { ...healthy, chip: { rank: 6, stage: "SAVED" } };
    const stageAhead = { ...healthy, view: { ...healthy.view, stage: "SAVED" as const } };
    const barAhead = {
      ...healthy,
      steps: healthy.steps.map((entry) => (entry.id === "save" ? { ...entry, status: "done" as const } : entry)),
    };

    expect(frameViolations(facts(chipAhead)).join()).toContain("I2");
    expect(frameViolations(facts(stageAhead)).join()).toContain("I2");
    expect(frameViolations(facts(barAhead)).join()).toContain("I2");
  });

  it("I3: reports an outcome shown before the outcome step", () => {
    expect(frameViolations(facts({ ...healthy, outcome: "SAVED" })).join()).toContain("I3");
  });

  it("I4: reports text that is not the start of the step's text", () => {
    const wrong = { ...healthy, view: { ...healthy.view, generator: { attempt: 1, text: "not the text" } } };

    expect(frameViolations(facts(wrong)).join()).toContain("I4");
  });

  it("I5: reports a piece on the exam screen before the question is assembled", () => {
    const early = { ...healthy, placed: new Set(["prompt" as const]) };

    expect(frameViolations(facts(early)).join()).toContain("I5");
  });

  it("I6: reports a replay that is not done when the budget ran out", () => {
    expect(doneViolation(healthy, true).join()).toContain("I6");
    expect(doneViolation({ ...healthy, done: true }, true)).toEqual([]);
  });

  it("I7: reports a playhead past the last step", () => {
    expect(frameViolations(facts({ ...healthy, stepIndex: item.steps.length + 2 })).join()).toContain("I7");
  });
});

describe("replay harness: fixtures are well formed", () => {
  it.each(FIXTURES)("$name is small and holds no credential", (meta) => {
    const events = loadFixture(meta.name);
    const text = JSON.stringify(events);

    expect(text.length).toBeLessThan(20_000);
    expect(text).not.toMatch(/Bearer|eyJ/);
    expect(events.map((entry) => entry.atMs)).toEqual([...events.map((entry) => entry.atMs)].sort((a, b) => a - b));
    vi.useRealTimers();
    expect(START_PLAYHEAD.step).toBe(0);
  });
});

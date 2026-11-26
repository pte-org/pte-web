import { describe, expect, it } from "vitest";
import { advance, frameOf, START_PLAYHEAD } from "../../../../../features/questiongeneration/replay";
import { begin, check, draft, token } from "./helpers";
import { CONTEXT, SETTINGS, scriptOf } from "./playHelpers";

/** Budget for one tick (advance and frameOf) on a script of 10,000 characters; the plan says under 1 ms (p95). */
const BUDGET_MS = 1;
const TICKS = 2000;
const P95 = 0.95;

/** A draft that grows as JSON, so the partial-JSON parse has real work to do on every tick. */
const json = (): string =>
  `{"passage":"${"lorem ipsum ".repeat(700)}","answerHintVi":"${"xin chao ".repeat(100)}","answerHintEn":"hello"}`;

describe("replay engine speed", () => {
  it("plays a tick of a 10,000 character script within the budget at the 95th percentile", () => {
    const text = json();
    const item = scriptOf([check("PROMPT"), begin("GENERATOR"), token("GENERATOR", text), draft(1)]);
    // Start deep into the text, where parsing the draft so far costs the most.
    let playhead = { ...START_PLAYHEAD, step: 1, charMilli: 9_000 * 1000, stepMs: 400_000 };
    const settings = { ...SETTINGS, charsPerSecond: 60 };
    const costs: number[] = [];
    for (let tick = 0; tick < TICKS; tick++) {
      const started = performance.now();
      playhead = advance(playhead, item, 16, settings, CONTEXT);
      frameOf(item, playhead, settings, CONTEXT);
      costs.push(performance.now() - started);
    }
    costs.sort((left, right) => left - right);

    expect(text.length).toBeGreaterThan(8000);
    expect(costs[Math.floor(TICKS * P95)] ?? Infinity).toBeLessThan(BUDGET_MS);
  });
});

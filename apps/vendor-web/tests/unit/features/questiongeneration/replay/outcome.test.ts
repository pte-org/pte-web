import { describe, expect, it } from "vitest";
import {
  buildScript,
  extendScript,
  settleOutcome,
  settlePending,
} from "../../../../../features/questiongeneration/replay";
import { INDEX, begin, check, end, token } from "./helpers";

const running = buildScript(null, [check("PROMPT"), begin("GENERATOR"), token("GENERATOR", "a")]);
const kinds = (script: typeof running): string[] => (script.items[INDEX]?.steps ?? []).map((step) => step.kind);

describe("settleOutcome", () => {
  it("only keeps a pending outcome in mind", () => {
    const held = settleOutcome(running, INDEX, "SAVED", "pending");

    expect(held.items[INDEX]?.pendingOutcome).toBe("SAVED");
    expect(held.items[INDEX]?.ended).toBe(false);
    expect(kinds(held)).not.toContain("outcome");
  });

  it("adds the outcome after the steps the stream delivered, once the stream has ended", () => {
    const held = settleOutcome(running, INDEX, "SAVED", "pending");
    const closed = extendScript(held, end, { saveQuestions: true });

    expect(kinds(closed)).toEqual(["prompt", "write", "assemble", "outcome"]);
    expect(closed.items[INDEX]?.ended).toBe(true);
    expect(closed.items[INDEX]?.pendingOutcome).toBeNull();
  });

  it("adds a saved outcome at once when the connection is closed and the job is over", () => {
    const closed = settleOutcome(running, INDEX, "SAVED", "closed-terminal");

    expect(kinds(closed)).toEqual(["prompt", "write", "assemble", "outcome"]);
  });

  it("does not assemble a question that failed or was cancelled", () => {
    expect(kinds(settleOutcome(running, INDEX, "FAILED", "end"))).toEqual(["prompt", "write", "outcome"]);
    expect(kinds(settleOutcome(running, INDEX, "CANCELLED", "end"))).toEqual(["prompt", "write", "outcome"]);
  });

  it("keeps the first outcome", () => {
    const saved = settleOutcome(running, INDEX, "SAVED", "end");

    expect(settleOutcome(saved, INDEX, "FAILED", "end")).toBe(saved);
  });

  it("settles every waiting outcome at once", () => {
    const two = settleOutcome(
      settleOutcome(running, INDEX, "SAVED", "pending"),
      1,
      "FAILED",
      "pending",
    );

    const settled = settlePending(two);

    expect(settled.items[INDEX]?.ended).toBe(true);
    expect(settled.items[1]?.ended).toBe(true);
  });

  it("creates the script of a question the stream never mentioned", () => {
    const closed = settleOutcome(running, 5, "FAILED", "closed-terminal");

    expect(closed.items[5]?.steps.map((step) => step.kind)).toEqual(["outcome"]);
  });
});

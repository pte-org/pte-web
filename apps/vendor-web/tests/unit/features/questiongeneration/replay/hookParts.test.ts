import { beforeEach, describe, expect, it } from "vitest";
import {
  clearPlayheads,
  loadPlayhead,
  outcomeOfStage,
  playheadKey,
  reasonFor,
  samePlayhead,
  savePlayhead,
  START_PLAYHEAD,
} from "../../../../../features/questiongeneration/replay";

describe("reasonFor: when the outcome the job record reports may join the script", () => {
  it("waits while the stream may still send steps", () => {
    expect(reasonFor({ streamEnded: false, closed: false, jobTerminal: false })).toBe("pending");
    expect(reasonFor({ streamEnded: false, closed: false, jobTerminal: true })).toBe("pending");
    expect(reasonFor({ streamEnded: false, closed: true, jobTerminal: false })).toBe("pending");
  });

  it("joins once the stream has ended", () => {
    expect(reasonFor({ streamEnded: true, closed: false, jobTerminal: false })).toBe("end");
    expect(reasonFor({ streamEnded: true, closed: true, jobTerminal: true })).toBe("end");
  });

  it("joins when the connection is closed and the job is over, though no end came", () => {
    expect(reasonFor({ streamEnded: false, closed: true, jobTerminal: true })).toBe("closed-terminal");
  });
});

describe("outcomeOfStage", () => {
  it("is an outcome only for the stages a job record ends a question with", () => {
    expect(outcomeOfStage("SAVED")).toBe("SAVED");
    expect(outcomeOfStage("FAILED")).toBe("FAILED");
    expect(outcomeOfStage("CANCELLED")).toBe("CANCELLED");
    expect(outcomeOfStage("GENERATING")).toBeNull();
    expect(outcomeOfStage("READY")).toBeNull();
  });
});

describe("the playhead store", () => {
  beforeEach(() => clearPlayheads(null));

  it("gives back where a question was left", () => {
    const key = playheadKey("job-1", 0);
    const here = { ...START_PLAYHEAD, step: 3, charMilli: 4000 };
    savePlayhead(key, here);

    expect(loadPlayhead(key)).toEqual(here);
    expect(loadPlayhead(playheadKey("job-1", 1))).toBeUndefined();
  });

  it("forgets the playheads of other jobs when another job is opened", () => {
    savePlayhead(playheadKey("job-1", 0), { ...START_PLAYHEAD, step: 2 });
    savePlayhead(playheadKey("job-2", 0), { ...START_PLAYHEAD, step: 5 });

    clearPlayheads("job-2");

    expect(loadPlayhead(playheadKey("job-1", 0))).toBeUndefined();
    expect(loadPlayhead(playheadKey("job-2", 0))?.step).toBe(5);
  });

  it("does not take a job whose id only starts the same for the same job", () => {
    savePlayhead(playheadKey("job-10", 0), { ...START_PLAYHEAD, step: 1 });

    clearPlayheads("job-1");

    expect(loadPlayhead(playheadKey("job-10", 0))).toBeUndefined();
  });
});

describe("samePlayhead", () => {
  it("tells a playhead that moved from one that stood still", () => {
    expect(samePlayhead(START_PLAYHEAD, { ...START_PLAYHEAD })).toBe(true);
    expect(samePlayhead(START_PLAYHEAD, { ...START_PLAYHEAD, charMilli: 1 })).toBe(false);
    expect(samePlayhead(START_PLAYHEAD, { ...START_PLAYHEAD, released: 1 })).toBe(false);
    expect(samePlayhead(START_PLAYHEAD, { ...START_PLAYHEAD, piecePhase: "fly" })).toBe(false);
  });
});

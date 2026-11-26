import { describe, expect, it } from "vitest";
import type { QuestionGenerationLiveItem } from "@pte/api-client";
import {
  FINAL_RANK,
  GATE_STEPS,
  gateLive,
  stageRank,
} from "../../../../features/questiongeneration/utils/stepGate";

const live = (change: Partial<QuestionGenerationLiveItem>): QuestionGenerationLiveItem => ({
  index: 0,
  stage: "GENERATING",
  activeAgent: "GENERATOR",
  generator: { attempt: 1, text: "{}" },
  reviewer: null,
  audioRef: null,
  imageRef: null,
  ...change,
});

const rankOf = (step: (typeof GATE_STEPS)[number]): number => GATE_STEPS.indexOf(step);

describe("stageRank", () => {
  it("orders the steps and puts every ending past them", () => {
    expect(stageRank("GENERATING")).toBeLessThan(stageRank("REVIEWING"));
    expect(stageRank("READY")).toBe(FINAL_RANK);
    expect(stageRank("FAILED")).toBe(FINAL_RANK);
  });
});

describe("gateLive", () => {
  const finished = live({
    stage: "READY",
    activeAgent: null,
    draft: { index: 0, attempt: 1, fields: { pteTaskType: "READ_ALOUD", promptText: "Text" } },
    reviewer: { attempt: 1, text: '{"pass":true}' },
    review: { index: 0, kind: "CONTENT", passed: true, fixSuggestion: null, notes: {} },
    audioRef: "audio-1",
  });

  it("leaves an item the screen has caught up with untouched", () => {
    const item = live({});
    expect(gateLive(item, rankOf("GENERATING"))).toBe(item);
  });

  it("holds a finished item on the writing step with nothing of the later steps", () => {
    const shown = gateLive(finished, rankOf("GENERATING"));
    expect(shown.stage).toBe("GENERATING");
    expect(shown.activeAgent).toBe("GENERATOR");
    expect(shown.draft).toBeNull();
    expect(shown.reviewer).toBeNull();
    expect(shown.review).toBeNull();
    expect(shown.audioRef).toBeNull();
  });

  it("shows the reviewer once the screen reaches the review step, but not the media", () => {
    const shown = gateLive(finished, rankOf("REVIEWING"));
    expect(shown.stage).toBe("REVIEWING");
    expect(shown.reviewer?.text).toBe('{"pass":true}');
    expect(shown.audioRef).toBeNull();
  });

  it("lets the media through on the media step", () => {
    expect(gateLive(finished, rankOf("RENDERING_MEDIA")).audioRef).toBe("audio-1");
  });
});

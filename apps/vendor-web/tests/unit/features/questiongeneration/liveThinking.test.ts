import { describe, expect, it } from "vitest";
import type { QuestionGenerationLiveItem } from "@pte/api-client";
import { agentThinking } from "../../../../features/questiongeneration/utils/liveThinking";

const live = (change: Partial<QuestionGenerationLiveItem>): QuestionGenerationLiveItem => ({
  index: 0,
  stage: "GENERATING",
  activeAgent: "GENERATOR",
  generator: null,
  reviewer: null,
  audioRef: null,
  imageRef: null,
  ...change,
});

describe("agentThinking", () => {
  it("reads the thoughts of the agent at work, and whether its answer has started", () => {
    const item = live({
      generator: { attempt: 1, text: "", thinking: "Plan five bars.", thinkingChars: 900 },
      reviewer: { attempt: 1, text: "{", thinking: "Check CEFR.", thinkingChars: 40 },
    });
    expect(agentThinking(item, "GENERATOR")).toEqual({
      text: "Plan five bars.",
      chars: 900,
      answering: false,
    });
    expect(agentThinking(item, "REVIEWER")?.answering).toBe(true);
  });

  it("is null for a model that streams no thoughts, an older server, or a media lane", () => {
    expect(agentThinking(live({ generator: { attempt: 1, text: "" } }), "GENERATOR")).toBeNull();
    expect(
      agentThinking(
        live({ generator: { attempt: 1, text: "", thinking: "", thinkingChars: 0 } }),
        "GENERATOR",
      ),
    ).toBeNull();
    expect(agentThinking(live({}), "AUDIO")).toBeNull();
    expect(agentThinking(undefined, null)).toBeNull();
  });
});

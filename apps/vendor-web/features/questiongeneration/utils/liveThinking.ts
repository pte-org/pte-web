import type { QuestionGenerationLiveItem } from "@pte/api-client";
import type { LiveLane } from "../liveConstants";

/** What the agent at work thinks in its current call, from the live feed. */
export interface LiveThinking {
  /** The end of its train of thought. */
  text: string;
  /** How many characters it thought in all. */
  chars: number;
  /** It has started writing its answer, so the thinking is over. */
  answering: boolean;
}

/**
 * The thoughts of the agent on `lane` (the writer or the reviewer), or null when that agent's model streamed none in
 * its current call; media lanes never think.
 */
export function agentThinking(
  live: QuestionGenerationLiveItem | undefined,
  lane: LiveLane | null,
): LiveThinking | null {
  const call = lane === "GENERATOR" ? live?.generator : lane === "REVIEWER" ? live?.reviewer : null;
  if (!call?.thinkingChars) return null;
  return {
    text: call.thinking ?? "",
    chars: call.thinkingChars,
    answering: call.text.length > 0,
  };
}

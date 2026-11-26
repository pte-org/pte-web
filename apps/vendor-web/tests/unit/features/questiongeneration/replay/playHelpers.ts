import {
  advance,
  buildScript,
  START_PLAYHEAD,
  type FrameContext,
  type ItemScript,
  type Playhead,
  type ReplaySettings,
  type Script,
} from "../../../../../features/questiongeneration/replay";
import type { QuestionGenerationLiveEvent } from "@pte/api-client";
import { INDEX } from "./helpers";

export const CONTEXT: FrameContext = {
  needs: { prompt: true, options: false, audio: false, image: false, reference: false },
  needsMedia: false,
};

export const SETTINGS: ReplaySettings = { charsPerSecond: 30, pauseEachStep: false, revealAll: false };

/** The script of one question from a list of events (the question form path: READY is its end). */
export function scriptOf(
  events: readonly QuestionGenerationLiveEvent[],
  saveQuestions = true,
): ItemScript {
  const script: Script = buildScript(null, events, { saveQuestions });
  const item = script.items[INDEX];
  if (!item) throw new Error("the events made no script");
  return item;
}

/** Plays `totalMs` of time in ticks of `tick` ms. */
export function play(
  item: ItemScript,
  totalMs: number,
  tick: number,
  settings: ReplaySettings = SETTINGS,
  from: Playhead = START_PLAYHEAD,
  context: FrameContext = CONTEXT,
): Playhead {
  let playhead = from;
  for (let elapsed = 0; elapsed < totalMs; elapsed += tick) {
    playhead = advance(playhead, item, Math.min(tick, totalMs - elapsed), settings, context);
  }
  return playhead;
}

import type {
  QuestionGenerationLiveCheck,
  QuestionGenerationLiveItem,
  QuestionGenerationLiveText,
} from "@pte/api-client";
import { CHART_REPLAY_MS, STEP_DWELL_MS, THINKING_REVEAL_AFTER_MS } from "../assemblyConstants";
import { MS_PER_SECOND } from "../typingConstants";
import { stageOfStep } from "./chip";
import type { FrameContext, Playhead } from "./frameTypes";
import type { ItemScript, MediaStep, ReviewStep, ScriptStep, WriteStep } from "./scriptTypes";

export const typedChars = (playhead: Playhead): number => Math.floor(playhead.charMilli / MS_PER_SECOND);

type Reached<T extends ScriptStep> = { step: T; at: number };

/** The steps of one kind the playhead has reached (it is on them or past them), oldest first. */
function reached<K extends ScriptStep["kind"]>(
  item: ItemScript,
  playhead: Playhead,
  kind: K,
): Reached<Extract<ScriptStep, { kind: K }>>[] {
  return item.steps
    .map((step, at) => ({ step, at }))
    .filter((entry) => entry.at <= playhead.step && entry.step.kind === kind) as Reached<
    Extract<ScriptStep, { kind: K }>
  >[];
}

/** The text of a step as far as the replay has typed it. */
export function shownText(text: string, at: number, playhead: Playhead): string {
  if (at < playhead.step) return text;
  return at === playhead.step ? text.slice(0, typedChars(playhead)) : "";
}

/** A step is shown in full when the playhead has left it, or is on it with all of its text typed. */
const textDone = (text: string, at: number, playhead: Playhead): boolean =>
  at < playhead.step || (at === playhead.step && typedChars(playhead) >= text.length);

/** Long enough on a media step for the chart to be drawn (a chart is revealed over `CHART_REPLAY_MS`). */
export function mediaDwellMs(step: MediaStep, context: FrameContext): number {
  return context.needs.image && step.imageRef ? CHART_REPLAY_MS : STEP_DWELL_MS;
}

const mediaDone = (step: MediaStep, at: number, playhead: Playhead, context: FrameContext): boolean =>
  at < playhead.step || (at === playhead.step && playhead.stepMs >= mediaDwellMs(step, context));

function liveText(
  entry: Reached<WriteStep> | Reached<ReviewStep> | undefined,
  count: number,
  playhead: Playhead,
): QuestionGenerationLiveText | null {
  if (!entry) return null;
  const thoughtShown =
    entry.at < playhead.step || (entry.at === playhead.step && playhead.stepMs >= THINKING_REVEAL_AFTER_MS);
  return {
    attempt: count,
    model: entry.step.model,
    text: shownText(entry.step.text, entry.at, playhead),
    thinking: thoughtShown ? entry.step.thinking : "",
    thinkingChars: thoughtShown ? entry.step.thinkingChars : 0,
  };
}

function checksOf(item: ItemScript, playhead: Playhead, round: number): QuestionGenerationLiveCheck[] {
  const checks: QuestionGenerationLiveCheck[] = [];
  item.steps.forEach((step, at) => {
    if (at > playhead.step || step.round !== round) return;
    if (step.kind === "prompt" && step.check) checks.push(step.check);
    if (step.kind === "write" && step.check && textDone(step.text, at, playhead)) checks.push(step.check);
    if (step.kind === "check") checks.push(step.check);
    if (step.kind === "review" && textDone(step.text, at, playhead)) checks.push(...Object.values(step.checks));
  });
  return checks;
}

/**
 * The live item as the replay has shown it so far. Everything the live view reads comes from here, so no part of
 * the screen can run ahead of the playhead: the stage, the text, the draft, the verdicts and the media are all cut
 * at the step the playhead is on.
 */
export function viewOf(item: ItemScript, playhead: Playhead, context: FrameContext): QuestionGenerationLiveItem {
  const current = item.steps[playhead.step] ?? null;
  const round = current && current.kind !== "assemble" && current.kind !== "outcome" ? current.round : item.round;
  const writes = reached(item, playhead, "write");
  const reviews = reached(item, playhead, "review");
  const medias = reached(item, playhead, "media").filter(
    (entry) => !entry.step.superseded && mediaDone(entry.step, entry.at, playhead, context),
  );
  const draftOwner = [...writes].reverse().find((entry) => entry.step.draft && textDone(entry.step.text, entry.at, playhead));
  const verdictOwner = [...reviews]
    .reverse()
    .find((entry) => entry.step.verdict && textDone(entry.step.text, entry.at, playhead));
  const imageReview = medias.find((entry) => entry.step.imageReview)?.step.imageReview ?? null;
  return {
    index: item.index,
    stage: stageOfStep(current) as QuestionGenerationLiveItem["stage"],
    activeAgent: current?.kind === "review" ? "REVIEWER" : "GENERATOR",
    generator: liveText(writes.at(-1), writes.length, playhead),
    reviewer: liveText(reviews.at(-1), reviews.length, playhead),
    audioRef: medias.at(-1)?.step.audioRef ?? null,
    imageRef: medias.at(-1)?.step.imageRef ?? null,
    draft: draftOwner?.step.draft ?? null,
    review: imageReview ?? verdictOwner?.step.verdict ?? null,
    checks: checksOf(item, playhead, round),
  };
}

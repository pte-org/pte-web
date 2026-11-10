import type {
  QuestionGenerationLiveAgent,
  QuestionGenerationLiveEvent,
  QuestionGenerationLiveItem,
  QuestionGenerationLiveText,
} from "@pte/api-client";
import { TERMINAL_ITEM_STAGES, type LaneStatus, type LiveLane } from "../liveConstants";

/** What the live view knows of each item, by index. */
export type LiveItems = Readonly<Record<number, QuestionGenerationLiveItem>>;

const emptyItem = (index: number): QuestionGenerationLiveItem => ({
  index, stage: null, activeAgent: null, generator: null, reviewer: null, audioRef: null, imageRef: null,
});

const agentKey = (agent: QuestionGenerationLiveAgent): "generator" | "reviewer" =>
  agent === "GENERATOR" ? "generator" : "reviewer";

function update(
  items: LiveItems,
  index: number,
  change: (item: QuestionGenerationLiveItem) => QuestionGenerationLiveItem,
): LiveItems {
  return { ...items, [index]: change(items[index] ?? emptyItem(index)) };
}

const appended = (text: QuestionGenerationLiveText | null, delta: string): QuestionGenerationLiveText =>
  ({ attempt: text?.attempt ?? 1, text: (text?.text ?? "") + delta });

/** The live state after one event of the stream. A snapshot replaces everything known before. */
export function applyLiveEvent(items: LiveItems, event: QuestionGenerationLiveEvent): LiveItems {
  switch (event.type) {
    case "snapshot":
      return Object.fromEntries(event.items.map((item) => [item.index, item]));
    case "begin":
      return update(items, event.index, (item) =>
        ({ ...item, activeAgent: event.agent, [agentKey(event.agent)]: { attempt: event.attempt, text: "" } }));
    case "token":
      return update(items, event.index, (item) =>
        ({ ...item, [agentKey(event.agent)]: appended(item[agentKey(event.agent)], event.delta) }));
    case "stage":
      return update(items, event.index, (item) => ({ ...item, stage: event.stage }));
    case "draft":
      return update(items, event.index, (item) =>
        ({ ...item, draft: { index: event.index, attempt: event.attempt, fields: event.fields } }));
    case "review":
      return update(items, event.index, (item) => ({
        ...item,
        review: { index: event.index, kind: event.kind, passed: event.passed, fixSuggestion: event.fixSuggestion,
          notes: event.notes },
      }));
    case "media":
      return update(items, event.index, (item) =>
        ({ ...item, audioRef: event.audioRef, imageRef: event.imageRef }));
    default:
      return items;
  }
}

const LANE_ORDER: readonly LiveLane[] = ["GENERATOR", "REVIEWER", "AUDIO", "SAVE"];

/** The place of a step in the run; an image is drawn where audio is spoken. */
const lanePosition = (lane: LiveLane): number => LANE_ORDER.indexOf(lane === "IMAGE" ? "AUDIO" : lane);

/** The step running now, from the stage and the agent that started last. */
function runningLane(item: QuestionGenerationLiveItem): LiveLane | null {
  switch (item.stage) {
    case "GENERATING":
    case "VALIDATING":
      return "GENERATOR";
    case "REVIEWING":
      return item.activeAgent === "GENERATOR" ? "GENERATOR" : "REVIEWER";
    case "RENDERING_MEDIA":
      return "AUDIO";
    default:
      return null;
  }
}

/**
 * Where one step of an item stands. `outcome` is the item's final stage from the job (SAVED, FAILED, CANCELLED) or
 * null while it runs; `reached` is the step it stopped at, so a failure marks that step and the later ones wait.
 */
export function laneStatus(lane: LiveLane, item: QuestionGenerationLiveItem | undefined,
  outcome: string | null, reached: LiveLane | null): LaneStatus {
  const position = lanePosition(lane);
  if (outcome === "SAVED") return "done";
  if (outcome === "FAILED" || outcome === "CANCELLED") {
    const stop = reached === null ? -1 : lanePosition(reached);
    if (position < stop) return "done";
    return position === stop && outcome === "FAILED" ? "failed" : "waiting";
  }
  const running = item ? runningLane(item) : null;
  if (running === null) return "waiting";
  const current = lanePosition(running);
  if (position === current) return "active";
  return position < current ? "done" : "waiting";
}

/**
 * The step an item was at when it stopped. The stream only reports the stages a worker started (saving and failing
 * come from the job), so an approved draft or a finished media means the item went on to be saved.
 */
export function reachedLane(item: QuestionGenerationLiveItem | undefined, reviewPassed: boolean): LiveLane | null {
  switch (item?.stage) {
    case "GENERATING":
    case "VALIDATING":
      return "GENERATOR";
    case "REVIEWING":
      return reviewPassed ? "SAVE" : "REVIEWER";
    case "RENDERING_MEDIA":
      return item.audioRef || item.imageRef ? "SAVE" : "AUDIO";
    default:
      return null;
  }
}

/** The item to show when the user has not picked one: the one being made, else the last one that started. */
export function followedIndex(stages: ReadonlyArray<{ index: number; stage: string }>): number {
  const running = stages.find((item) => item.stage !== "QUEUED" && !TERMINAL_ITEM_STAGES.includes(item.stage));
  if (running) return running.index;
  const started = stages.filter((item) => item.stage !== "QUEUED");
  return started.at(-1)?.index ?? stages[0]?.index ?? 0;
}

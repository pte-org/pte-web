import type {
  QuestionGenerationLiveAgent,
  QuestionGenerationLiveEvent,
  QuestionGenerationLiveItem,
  QuestionGenerationLiveText,
} from "@pte/api-client";
import { THINKING_TAIL_CHARS } from "../assemblyConstants";
import { TERMINAL_ITEM_STAGES } from "../liveConstants";

/** What the live view knows of each item, by index. */
export type LiveItems = Readonly<Record<number, QuestionGenerationLiveItem>>;

const emptyItem = (index: number): QuestionGenerationLiveItem => ({
  index,
  stage: null,
  activeAgent: null,
  generator: null,
  reviewer: null,
  audioRef: null,
  imageRef: null,
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

const appended = (
  text: QuestionGenerationLiveText | null,
  delta: string,
): QuestionGenerationLiveText => ({
  ...text,
  attempt: text?.attempt ?? 1,
  text: (text?.text ?? "") + delta,
});

/** Only the end of a train of thought is shown, so only the end is kept; the count keeps the whole of it. */
const thought = (
  text: QuestionGenerationLiveText | null,
  delta: string,
): QuestionGenerationLiveText => ({
  attempt: text?.attempt ?? 1,
  text: text?.text ?? "",
  thinking: ((text?.thinking ?? "") + delta).slice(-THINKING_TAIL_CHARS),
  thinkingChars: (text?.thinkingChars ?? 0) + delta.length,
});

/** The live state after one event of the stream. A snapshot replaces everything known before. */
export function applyLiveEvent(items: LiveItems, event: QuestionGenerationLiveEvent): LiveItems {
  switch (event.type) {
    case "snapshot":
      return Object.fromEntries(event.items.map((item) => [item.index, item]));
    case "begin":
      return update(items, event.index, (item) => ({
        ...item,
        activeAgent: event.agent,
        [agentKey(event.agent)]: { attempt: event.attempt, text: "" },
      }));
    case "token":
      return update(items, event.index, (item) => ({
        ...item,
        [agentKey(event.agent)]: appended(item[agentKey(event.agent)], event.delta),
      }));
    case "thinking":
      return update(items, event.index, (item) => ({
        ...item,
        [agentKey(event.agent)]: thought(item[agentKey(event.agent)], event.delta),
      }));
    case "stage":
      return update(items, event.index, (item) => ({ ...item, stage: event.stage }));
    case "draft":
      return update(items, event.index, (item) => ({
        ...item,
        draft: { index: event.index, attempt: event.attempt, fields: event.fields },
      }));
    case "review":
      return update(items, event.index, (item) => ({
        ...item,
        review: {
          index: event.index,
          kind: event.kind,
          passed: event.passed,
          fixSuggestion: event.fixSuggestion,
          notes: event.notes,
        },
      }));
    case "check": {
      const check = {
        index: event.index,
        step: event.step,
        status: event.status,
        facts: event.facts,
        details: event.details,
      };
      return update(items, event.index, (item) => {
        // A new prompt starts a new round of writing: the checks of the round before are dropped.
        const kept = check.step === "PROMPT" ? [] : (item.checks ?? []);
        const checks = kept.some((earlier) => earlier.step === check.step)
          ? kept.map((earlier) => (earlier.step === check.step ? check : earlier))
          : [...kept, check];
        // A new round: the media of the last one was refused and removed, so it is no longer loaded.
        return check.step === "PROMPT"
          ? { ...item, checks, audioRef: null, imageRef: null }
          : { ...item, checks };
      });
    }
    case "media":
      return update(items, event.index, (item) => ({
        ...item,
        audioRef: event.audioRef,
        imageRef: event.imageRef,
      }));
    default:
      return items;
  }
}

/** The item to show when the user has not picked one: the one being made, else the last one that started. */
export function followedIndex(stages: ReadonlyArray<{ index: number; stage: string }>): number {
  const running = stages.find(
    (item) => item.stage !== "QUEUED" && !TERMINAL_ITEM_STAGES.includes(item.stage),
  );
  if (running) return running.index;
  const started = stages.filter((item) => item.stage !== "QUEUED");
  return started.at(-1)?.index ?? stages[0]?.index ?? 0;
}

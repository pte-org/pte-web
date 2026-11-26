import type {
  QuestionGenerationLiveAgent,
  QuestionGenerationLiveCheck,
  QuestionGenerationLiveEvent,
  QuestionGenerationLiveItem,
} from "@pte/api-client";
import { mergeSnapshot } from "./mergeSnapshot";
import { settleOutcome, settlePending } from "./outcome";
import {
  lastOf,
  newCheck,
  newItem,
  newMedia,
  newPrompt,
  newReview,
  newWrite,
  replaceAt,
} from "./steps";
import {
  EMPTY_SCRIPT,
  type ItemScript,
  type MediaStep,
  type ReviewStep,
  type Script,
  type ScriptContext,
  type ScriptStep,
  type WriteStep,
} from "./scriptTypes";

const REVIEW_CHECKS: readonly string[] = ["REVIEW_PROMPT", "REVIEW_WRITE", "REVIEW_VERDICT"];

const withItem = (script: Script, item: ItemScript): Script => ({
  ...script,
  items: { ...script.items, [item.index]: item },
});

const withSteps = (item: ItemScript, steps: readonly ScriptStep[], round = item.round): ItemScript => ({
  ...item,
  steps,
  round,
});

const pushStep = (item: ItemScript, step: ScriptStep): ItemScript => withSteps(item, [...item.steps, step]);

/** A text step that is empty has not been begun yet; the first `begin` takes it instead of opening a second one. */
const isUnwritten = (step: WriteStep | ReviewStep): boolean => step.text === "" && step.thinkingChars === 0;

function openRound(item: ItemScript, check: QuestionGenerationLiveCheck): ItemScript {
  // A prompt step opened implicitly (an older server, or the writer began before its prompt) takes this check.
  const open = lastOf(item.steps, "prompt", item.round);
  if (open && !open.step.check && !lastOf(item.steps, "write", item.round)) {
    return withSteps(item, replaceAt(item.steps, open.at, { ...open.step, check }));
  }
  const round = item.round + 1;
  // The media of the round before was refused and removed when this round began.
  const earlier = lastOf(item.steps, "media", item.round);
  const steps = earlier
    ? replaceAt(item.steps, earlier.at, { ...earlier.step, superseded: true })
    : item.steps;
  return withSteps(item, [...steps, newPrompt(round, check)], round);
}

function ensureRound(item: ItemScript): ItemScript {
  return item.round > 0 ? item : withSteps(item, [...item.steps, newPrompt(1, null)], 1);
}

/** The write step tokens go to: the latest of the round, or a new first one. */
function currentWrite(item: ItemScript): { item: ItemScript; at: number; step: WriteStep } {
  const ready = ensureRound(item);
  const found = lastOf(ready.steps, "write", ready.round);
  if (found) return { item: ready, ...found };
  const next = pushStep(ready, newWrite(ready.round, 1));
  return { item: next, at: next.steps.length - 1, step: next.steps.at(-1) as WriteStep };
}

function currentReview(item: ItemScript): { item: ItemScript; at: number; step: ReviewStep } {
  const ready = ensureRound(item);
  const found = lastOf(ready.steps, "review", ready.round);
  if (found) return { item: ready, ...found };
  const next = pushStep(ready, newReview(ready.round, 1));
  return { item: next, at: next.steps.length - 1, step: next.steps.at(-1) as ReviewStep };
}

function currentMedia(item: ItemScript): { item: ItemScript; at: number; step: MediaStep } {
  const ready = ensureRound(item);
  const found = lastOf(ready.steps, "media", ready.round);
  if (found) return { item: ready, ...found };
  const next = pushStep(ready, newMedia(ready.round));
  return { item: next, at: next.steps.length - 1, step: next.steps.at(-1) as MediaStep };
}

function begin(item: ItemScript, agent: QuestionGenerationLiveAgent, model: string): ItemScript {
  const ready = ensureRound(item);
  if (agent === "GENERATOR") {
    const found = lastOf(ready.steps, "write", ready.round);
    if (!found) return pushStep(ready, { ...newWrite(ready.round, 1), model });
    if (isUnwritten(found.step)) return withSteps(ready, replaceAt(ready.steps, found.at, { ...found.step, model }));
    // Written again in the same round: a retry, or the fallback model answering after the first one failed.
    const steps = replaceAt(ready.steps, found.at, { ...found.step, superseded: true });
    return withSteps(ready, [...steps, { ...newWrite(ready.round, found.step.attempt + 1), model }]);
  }
  const found = lastOf(ready.steps, "review", ready.round);
  if (!found) return pushStep(ready, { ...newReview(ready.round, 1), model });
  if (isUnwritten(found.step)) return withSteps(ready, replaceAt(ready.steps, found.at, { ...found.step, model }));
  const steps = replaceAt(ready.steps, found.at, { ...found.step, superseded: true });
  return withSteps(ready, [...steps, { ...newReview(ready.round, found.step.attempt + 1), model }]);
}

const thought = (
  step: { thinking: string; thinkingChars: number },
  delta: string,
  tail: number,
): { thinking: string; thinkingChars: number } => ({
  thinking: (step.thinking + delta).slice(-tail),
  thinkingChars: step.thinkingChars + delta.length,
});

/** How much of a train of thought is kept; the count keeps the whole of it. */
export const THINKING_TAIL = 400;

function addText(
  item: ItemScript,
  agent: QuestionGenerationLiveAgent,
  delta: string,
  thinking: boolean,
): ItemScript {
  if (agent === "GENERATOR") {
    const current = currentWrite(item);
    const step: WriteStep = thinking
      ? { ...current.step, ...thought(current.step, delta, THINKING_TAIL) }
      : { ...current.step, text: current.step.text + delta };
    return withSteps(current.item, replaceAt(current.item.steps, current.at, step));
  }
  const current = currentReview(item);
  const step: ReviewStep = thinking
    ? { ...current.step, ...thought(current.step, delta, THINKING_TAIL) }
    : { ...current.step, text: current.step.text + delta };
  return withSteps(current.item, replaceAt(current.item.steps, current.at, step));
}

function addCheck(item: ItemScript, check: QuestionGenerationLiveCheck): ItemScript {
  if (check.step === "PROMPT") return openRound(item, check);
  if (check.step === "WRITE") {
    const current = currentWrite(item);
    return withSteps(current.item, replaceAt(current.item.steps, current.at, { ...current.step, check }));
  }
  if (REVIEW_CHECKS.includes(check.step)) {
    const current = currentReview(item);
    return withSteps(current.item, replaceAt(current.item.steps, current.at, {
        ...current.step,
        checks: { ...current.step.checks, [check.step]: check },
      }));
  }
  const ready = ensureRound(item);
  const existing = ready.steps.findIndex(
    (step) => step.kind === "check" && step.round === ready.round && step.check.step === check.step,
  );
  return existing >= 0
    ? withSteps(ready, replaceAt(ready.steps, existing, newCheck(ready.round, check)))
    : pushStep(ready, newCheck(ready.round, check));
}

function applyToItem(item: ItemScript, event: QuestionGenerationLiveEvent): ItemScript {
  switch (event.type) {
    case "begin":
      return begin(item, event.agent, event.model ?? "");
    case "token":
      return addText(item, event.agent, event.delta, false);
    case "thinking":
      return addText(item, event.agent, event.delta, true);
    case "check":
      return addCheck(item, {
        index: event.index,
        step: event.step,
        status: event.status,
        facts: event.facts,
        details: event.details,
      });
    case "draft": {
      const current = currentWrite(item);
      const draft = { index: event.index, attempt: event.attempt, fields: event.fields };
      return withSteps(current.item, replaceAt(current.item.steps, current.at, { ...current.step, draft }));
    }
    case "review": {
      const verdict = {
        index: event.index,
        kind: event.kind,
        passed: event.passed,
        fixSuggestion: event.fixSuggestion,
        notes: event.notes,
      };
      if (event.kind === "IMAGE") {
        const media = currentMedia(item);
        return withSteps(media.item, replaceAt(media.item.steps, media.at, { ...media.step, imageReview: verdict }));
      }
      const review = currentReview(item);
      return withSteps(review.item, replaceAt(review.item.steps, review.at, { ...review.step, verdict }));
    }
    case "media": {
      const media = currentMedia(item);
      const removed = event.audioRef === null && event.imageRef === null;
      return withSteps(media.item, replaceAt(media.item.steps, media.at, {
          ...media.step,
          audioRef: event.audioRef ?? media.step.audioRef,
          imageRef: event.imageRef ?? media.step.imageRef,
          superseded: removed ? true : media.step.superseded,
        }));
    }
    default:
      return item;
  }
}

const ITEM_EVENTS: readonly string[] = ["begin", "token", "thinking", "check", "draft", "review", "media", "stage", "item"];

/**
 * The script after one more event of the stream. A pure step of {@link buildScript}, used by the hook as events
 * arrive. A question that already has its outcome takes no more steps: a late event is dropped.
 */
export function extendScript(
  script: Script,
  event: QuestionGenerationLiveEvent,
  context: ScriptContext,
): Script {
  if (event.type === "snapshot") return mergeSnapshot(script, event.items, context);
  if (event.type === "end") return settlePending({ ...script, streamEnded: true });
  if (!ITEM_EVENTS.includes(event.type)) return script;
  const index = (event as { index: number }).index;
  const item = script.items[index] ?? newItem(index);
  if (item.ended) {
    context.onDropped?.(`${event.type} after the outcome of item ${index}`);
    return script;
  }
  if (event.type === "stage") {
    return event.stage === "READY" && !context.saveQuestions
      ? settleOutcome(script, index, "READY", "feed-ready")
      : script;
  }
  if (event.type === "item") return script;
  return withItem(script, applyToItem(item, event));
}

/**
 * The script of a job from what the stream sent: the snapshot (if the page opened on a running job) and the events
 * after it, in order. Pure: the same input always gives the same script.
 */
export function buildScript(
  snapshot: readonly QuestionGenerationLiveItem[] | null,
  events: readonly QuestionGenerationLiveEvent[],
  context: ScriptContext = { saveQuestions: true },
): Script {
  const start = snapshot ? mergeSnapshot(EMPTY_SCRIPT, snapshot, context) : EMPTY_SCRIPT;
  return events.reduce((script, event) => extendScript(script, event, context), start);
}

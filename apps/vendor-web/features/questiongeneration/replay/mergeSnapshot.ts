import type {
  QuestionGenerationLiveCheck,
  QuestionGenerationLiveItem,
} from "@pte/api-client";
import { settleOutcome } from "./outcome";
import { lastOf, newCheck, newItem, newMedia, newPrompt, newReview, newWrite, rankOf, replaceAt, stepKey } from "./steps";
import type {
  ItemScript,
  MediaStep,
  ReviewStep,
  Script,
  ScriptContext,
  ScriptStep,
  WriteStep,
} from "./scriptTypes";

/**
 * What a snapshot of one question says about its steps. A snapshot is the state at one moment, not a history, so
 * the steps are inferred from what it holds (G = the writer's calls, R = the reviewer's calls):
 *
 * | Situation                                                          | Steps inferred                              |
 * |--------------------------------------------------------------------|---------------------------------------------|
 * | G is null and nothing else is known                                | none: the question has not begun            |
 * | G = 1, checks hold the PROMPT                                      | round 1: prompt, write, the checks in order |
 * | a review (verdict or reviewer text) is present                     | the review of that round                    |
 * | round > 1 and the checks hold nothing after PROMPT or WRITE, with  | the draft and review belong to the round    |
 * | a draft of an earlier round                                        | before; the new round has prompt and write  |
 * | round > 1 and the checks hold JSON or later                        | the draft belongs to the current round      |
 * | rounds before the ones above have no data of their own             | one "previousRounds" step (a count)         |
 * | an audio or image reference is present                             | the media step of the current round         |
 * | the stage is READY and the job does not save its questions         | the outcome READY                           |
 *
 * The text of rounds before the current one is gone from a snapshot, so those rounds cannot be replayed.
 */
const TEXT_CHECKS: readonly string[] = ["PROMPT", "WRITE"];
const REVIEW_CHECKS: readonly string[] = ["REVIEW_PROMPT", "REVIEW_WRITE", "REVIEW_VERDICT"];

function snapshotSteps(live: QuestionGenerationLiveItem, knownRound: number | null): ScriptStep[] {
  const checks = live.checks ?? [];
  const writer = live.generator;
  if (!writer && checks.length === 0 && !live.draft && !live.review) return [];
  // G counts every call of the writer, retries and the fallback model included, so it can run ahead of the round.
  // A script that has already seen as many writes as G says knows the round better than G does.
  const round = knownRound ?? Math.max(writer?.attempt ?? 1, live.draft?.attempt ?? 1, 1);
  const afterWrite = checks.some((check) => !TEXT_CHECKS.includes(check.step));
  const older = round > 1 && !afterWrite && live.draft != null && live.draft.attempt < round;
  const draftRound = older ? live.draft?.attempt ?? round - 1 : round;
  const steps: ScriptStep[] = [];

  if (draftRound > 1) {
    steps.push({ key: stepKey("previousRounds", 0), kind: "previousRounds", round: 0, rounds: draftRound - 1 });
  }
  if (older) {
    steps.push({ ...newWrite(draftRound, 1), draft: live.draft ?? null });
    steps.push(reviewStep(live, draftRound, live.reviewer?.attempt === draftRound));
  }
  const promptCheck = checks.find((check) => check.step === "PROMPT") ?? null;
  steps.push(newPrompt(round, promptCheck));
  steps.push({
    ...newWrite(round, 1),
    model: writer?.model ?? "",
    text: writer?.text ?? "",
    thinking: writer?.thinking ?? "",
    thinkingChars: writer?.thinkingChars ?? 0,
    draft: older ? null : live.draft ?? null,
    check: checks.find((check) => check.step === "WRITE") ?? null,
  });
  if (older) return steps;

  for (const check of checks) {
    if (!TEXT_CHECKS.includes(check.step) && !REVIEW_CHECKS.includes(check.step)) {
      steps.push(newCheck(round, check));
    }
  }
  const hasReview =
    (live.reviewer?.text ?? "") !== "" ||
    live.review?.kind === "CONTENT" ||
    checks.some((check) => REVIEW_CHECKS.includes(check.step));
  if (hasReview) steps.push(reviewStep(live, round, true));
  if (live.audioRef || live.imageRef || live.review?.kind === "IMAGE") {
    steps.push({
      ...newMedia(round),
      audioRef: live.audioRef,
      imageRef: live.imageRef,
      imageReview: live.review?.kind === "IMAGE" ? live.review : null,
    });
  }
  return steps;
}

function reviewStep(live: QuestionGenerationLiveItem, round: number, ownText: boolean): ReviewStep {
  const reviewer = live.reviewer;
  const checks: Record<string, QuestionGenerationLiveCheck> = {};
  for (const check of live.checks ?? []) {
    if (REVIEW_CHECKS.includes(check.step)) checks[check.step] = check;
  }
  return {
    ...newReview(round, 1),
    model: ownText ? reviewer?.model ?? "" : "",
    text: ownText ? reviewer?.text ?? "" : "",
    thinking: ownText ? reviewer?.thinking ?? "" : "",
    thinkingChars: ownText ? reviewer?.thinkingChars ?? 0 : 0,
    verdict: live.review?.kind === "CONTENT" ? live.review : null,
    checks,
  };
}

/** A longer text that starts with the old one replaces it; anything else keeps the old: text only grows. */
const grown = (old: string, next: string): string =>
  next.length > old.length && next.startsWith(old) ? next : old;

function refreshWrite(old: WriteStep, from: WriteStep): WriteStep {
  return {
    ...old,
    model: old.model || from.model,
    text: grown(old.text, from.text),
    thinking: from.thinkingChars > old.thinkingChars ? from.thinking : old.thinking,
    thinkingChars: Math.max(old.thinkingChars, from.thinkingChars),
    draft: old.draft ?? from.draft,
    check: old.check ?? from.check,
  };
}

function refreshReview(old: ReviewStep, from: ReviewStep): ReviewStep {
  return {
    ...old,
    model: old.model || from.model,
    text: grown(old.text, from.text),
    thinking: from.thinkingChars > old.thinkingChars ? from.thinking : old.thinking,
    thinkingChars: Math.max(old.thinkingChars, from.thinkingChars),
    verdict: old.verdict ?? from.verdict,
    checks: { ...from.checks, ...old.checks },
  };
}

function refreshMedia(old: MediaStep, from: MediaStep): MediaStep {
  return {
    ...old,
    audioRef: old.audioRef ?? from.audioRef,
    imageRef: old.imageRef ?? from.imageRef,
    imageReview: old.imageReview ?? from.imageReview,
  };
}

/** Folds one inferred step into a question's script: it fills what is missing and never rewrites what is there. */
function mergeStep(item: ItemScript, step: ScriptStep): ItemScript {
  const slot = (() => {
    // A write or review is matched to the latest one of its round, whatever its attempt number.
    if (step.kind === "write" || step.kind === "review") return lastOf(item.steps, step.kind, step.round);
    const at = item.steps.findIndex((existing) => existing.key === step.key);
    return at >= 0 ? { step: item.steps[at] as ScriptStep, at } : null;
  })();
  if (slot) {
    const old = slot.step;
    let refreshed: ScriptStep = old;
    if (old.kind === "write" && step.kind === "write") refreshed = refreshWrite(old, step);
    else if (old.kind === "review" && step.kind === "review") refreshed = refreshReview(old, step);
    else if (old.kind === "media" && step.kind === "media") refreshed = refreshMedia(old, step);
    else if (old.kind === "prompt" && step.kind === "prompt") refreshed = { ...old, check: old.check ?? step.check };
    else if (old.kind === "check" && step.kind === "check") refreshed = step;
    else if (old.kind === "previousRounds" && step.kind === "previousRounds") {
      refreshed = { ...old, rounds: Math.max(old.rounds, step.rounds) };
    }
    return { ...item, steps: replaceAt(item.steps, slot.at, refreshed) };
  }
  const last = item.steps.at(-1);
  // Appended at the end only; a step that would fall before one already there is a past the script has moved on from.
  if (last && rankOf(step) < rankOf(last)) return item;
  return { ...item, steps: [...item.steps, step], round: Math.max(item.round, step.round) };
}

/**
 * The script after a snapshot of the stream (on connecting, and again when the connection is reopened). It never
 * resets what the script already holds: missing steps are appended, existing ones only fill in what they lack.
 */
export function mergeSnapshot(
  script: Script,
  items: readonly QuestionGenerationLiveItem[],
  context: ScriptContext,
): Script {
  let result = script;
  for (const live of items) {
    const base = result.items[live.index] ?? newItem(live.index);
    if (base.ended) continue;
    const writes = base.steps.filter((step) => step.kind === "write").length;
    const calls = live.generator?.attempt ?? 0;
    // A snapshot that counts fewer writer calls than the script has seen is older than the script: nothing in it is new.
    if (calls > 0 && calls < writes) continue;
    const knownRound = base.round > 0 && calls <= writes ? base.round : null;
    const merged = snapshotSteps(live, knownRound).reduce(mergeStep, base);
    result = { ...result, items: { ...result.items, [live.index]: merged } };
    if (live.stage === "READY" && !context.saveQuestions) {
      result = settleOutcome(result, live.index, "READY", "feed-ready");
    }
  }
  return result;
}

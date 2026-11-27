import type { ItemScript, Script, ScriptStep } from "./scriptTypes";

/**
 * A batch paused and resumed runs its unfinished questions again from the start, on a fresh stream whose counters
 * (rounds, writer calls) start over. The script keeps what it already showed and goes on after it: the counters of
 * the new run are read on top of what the earlier runs used ({@link ItemScript.runBase}).
 */

/** The writer calls a script has seen, all runs together. */
export const writesOf = (item: ItemScript): number =>
  item.steps.filter((step) => step.kind === "write").length;

/**
 * The step a run stopped in the middle of: a write without its draft, a review without its verdict, or media the
 * pipeline dropped. It is kept (the person saw it) but no longer stands for the question.
 */
function interrupted(step: ScriptStep, round: number): ScriptStep {
  if (step.round !== round) return step;
  if (step.kind === "write" && !step.draft) return { ...step, superseded: true };
  if (step.kind === "review" && !step.verdict) return { ...step, superseded: true };
  if (step.kind === "media") return { ...step, superseded: true };
  return step;
}

function resumeItem(item: ItemScript): ItemScript {
  if (item.ended || item.steps.length === 0) return item;
  return {
    ...item,
    steps: item.steps.map((step) => interrupted(step, item.round)),
    runBase: { round: item.round, writes: writesOf(item) },
    halted: undefined,
  };
}

/** A write without its draft or a review without its verdict in the current round: the text a stop cut off. */
const isCut = (step: ScriptStep, round: number): boolean =>
  step.round === round &&
  ((step.kind === "write" && !step.draft && !step.superseded) ||
    (step.kind === "review" && !step.verdict && !step.superseded));

function haltItem(item: ItemScript, everyOpen: boolean): ItemScript {
  if (item.ended || item.halted || item.steps.length === 0) return item;
  const cut = item.steps.some((step) => isCut(step, item.round));
  if (!cut && !everyOpen) return item;
  const steps = item.steps.map((step) => (isCut(step, item.round) ? { ...step, superseded: true } : step));
  return { ...item, steps, halted: true };
}

/**
 * The run of every question still open was stopped. The stream ended while they were written (a pause or a cancel
 * cut the text), or the job is known to wait for its turn again (`everyOpen`, also a question stopped before its
 * writer began). Its media is left alone at the end of a stream, since a saved question may still wait for its
 * outcome. The same script comes back when nothing changes.
 */
export function haltRun(script: Script, everyOpen = false): Script {
  let changed = false;
  const items: Record<number, ItemScript> = {};
  for (const [index, item] of Object.entries(script.items)) {
    const halted = haltItem(item, everyOpen);
    changed ||= halted !== item;
    items[Number(index)] = halted;
  }
  return changed ? { ...script, items } : script;
}

/**
 * The stream ended and opened again on a job that runs once more (a resumed pause): every question without an
 * outcome had its run stopped, and its next counters start after the ones already shown.
 */
export function startNewRun(script: Script): Script {
  const items: Record<number, ItemScript> = {};
  for (const [index, item] of Object.entries(script.items)) items[Number(index)] = resumeItem(item);
  return { ...script, items, streamEnded: false };
}

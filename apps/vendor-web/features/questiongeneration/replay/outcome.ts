import { newItem, stepKey } from "./steps";
import type { ItemOutcome, ItemScript, Script, ScriptStep } from "./scriptTypes";

/**
 * Why an outcome may be added now. The live feed never says a question was saved, failed or cancelled (only the job
 * record does), so an outcome is held back ("pending") until the stream has delivered everything before it:
 * - `end`: the stream said it has nothing more to send;
 * - `closed-terminal`: the connection is closed and the job is over, so nothing more will come;
 * - `feed-ready`: the feed itself reached READY, the last stage of a question that is not saved.
 */
export type SettleReason = "end" | "closed-terminal" | "feed-ready" | "pending";

const ASSEMBLED: readonly ItemOutcome[] = ["SAVED", "READY"];

function withItem(script: Script, item: ItemScript): Script {
  return { ...script, items: { ...script.items, [item.index]: item } };
}

function closed(item: ItemScript, outcome: ItemOutcome): ItemScript {
  const steps: ScriptStep[] = [...item.steps];
  if (ASSEMBLED.includes(outcome) && !steps.some((step) => step.kind === "assemble")) {
    steps.push({ key: stepKey("assemble", 0), kind: "assemble", round: 0 });
  }
  steps.push({ key: stepKey("outcome", 0), kind: "outcome", round: 0, outcome });
  return { ...item, steps, ended: true, pendingOutcome: null };
}

/**
 * Records how a question ended. A script that already has an outcome keeps it; a `pending` outcome is only kept in
 * mind until a later call settles it.
 */
export function settleOutcome(
  script: Script,
  index: number,
  outcome: ItemOutcome,
  reason: SettleReason,
): Script {
  const item = script.items[index] ?? newItem(index);
  if (item.ended) return script;
  if (reason === "pending") return withItem(script, { ...item, pendingOutcome: outcome });
  return withItem(script, closed(item, outcome));
}

/** The stream ended: every outcome that was waiting for it is added. */
export function settlePending(script: Script): Script {
  return Object.values(script.items).reduce(
    (current, item) =>
      !item.ended && item.pendingOutcome
        ? settleOutcome(current, item.index, item.pendingOutcome, "end")
        : current,
    script,
  );
}

/** What the hook knows when the job record reports how a question ended. */
export interface OutcomeState {
  /** The stream said it has nothing more to send. */
  streamEnded: boolean;
  /** The connection is closed and will not be opened again. */
  closed: boolean;
  /** The job itself is over, so nothing more will be written for it. */
  jobTerminal: boolean;
}

/** Why the outcome the job record reports may be added to the script now, or `pending` if it must wait. */
export function reasonFor({ streamEnded, closed, jobTerminal }: OutcomeState): SettleReason {
  if (streamEnded) return "end";
  if (closed && jobTerminal) return "closed-terminal";
  return "pending";
}

/** The stages a job record reports for a question that has ended, as outcomes. */
export function outcomeOfStage(stage: string): ItemOutcome | null {
  return stage === "SAVED" || stage === "FAILED" || stage === "CANCELLED" ? stage : null;
}

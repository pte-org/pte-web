import type { Question } from "@/features/questionbank/types";

/** Only a draft the server says this person may delete can be picked for the bulk delete. */
export const isBulkDeletable = (question: Pick<Question, "status" | "canDeleteDraft">): boolean =>
  question.status === "draft" && question.canDeleteDraft === true;

/** The ids of the deletable drafts among the questions shown. */
export const deletableIds = (questions: ReadonlyArray<Pick<Question, "id" | "status" | "canDeleteDraft">>): string[] =>
  questions.filter(isBulkDeletable).map((question) => question.id);

/** The selection with one id added or removed. */
export function toggleId(selected: ReadonlySet<string>, id: string): ReadonlySet<string> {
  const next = new Set(selected);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

/** Every id of the page selected, or none when they all already are. */
export function toggleAll(selected: ReadonlySet<string>, pageIds: readonly string[]): ReadonlySet<string> {
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  return allSelected ? new Set() : new Set(pageIds);
}

export interface BulkDeleteResult {
  deleted: number;
  failed: number;
}

/**
 * Deletes the drafts one after another, so one refusal (already submitted, no longer allowed) does not stop the rest,
 * and counts what happened.
 */
export async function deleteEach(ids: readonly string[], deleteOne: (id: string) => Promise<unknown>): Promise<BulkDeleteResult> {
  let deleted = 0;
  for (const id of ids) {
    try {
      await deleteOne(id);
      deleted += 1;
    } catch {
      // Counted as failed below; the next draft is still tried.
    }
  }
  return { deleted, failed: ids.length - deleted };
}

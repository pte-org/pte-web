import type { ScoreTemplateItemDraft } from "./types";

/**
 * A comparable string of everything the editor can change. Two equal snapshots mean there is
 * nothing unsaved, whatever happened in between (an edit that was later undone is not dirty).
 */
export function createDraftSnapshot(name: string, items: ScoreTemplateItemDraft[]): string {
  return JSON.stringify({ name, items });
}

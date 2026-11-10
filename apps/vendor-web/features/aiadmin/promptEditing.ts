import type { PromptVersionResponse } from "@pte/api-client";
import { canAuthorAcademic, canReviewAcademic, isPlatformAdmin } from "../auth/permissions";

const EDITABLE_STATUSES: readonly string[] = ["DRAFT", "REJECTED"];

/** A new list with `value` in place of the entry at `index`. */
export function replaceAt<T>(items: readonly T[], index: number, value: T): T[] {
  return items.map((item, position) => (position === index ? value : item));
}

export function removeAt<T>(items: readonly T[], index: number): T[] {
  return items.filter((_item, position) => position !== index);
}

/** The items in the order of `orderedIds` (what a drag and drop reports); an item not named keeps its place at the end. */
export function reorderByIds<T extends { id: string }>(items: readonly T[], orderedIds: readonly string[]): T[] {
  const rank = (item: T): number => {
    const position = orderedIds.indexOf(item.id);
    return position === -1 ? orderedIds.length : position;
  };
  return [...items].sort((first, second) => rank(first) - rank(second));
}

/** A section id from its title that no other section uses; ids stay stable when a title is edited later. */
export function newSectionId(title: string, taken: readonly string[]): string {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section";
  let candidate = base;
  for (let suffix = 2; taken.includes(candidate); suffix += 1) candidate = `${base}-${suffix}`;
  return candidate;
}

export interface PromptActions {
  edit: boolean;
  submit: boolean;
  approve: boolean;
  reject: boolean;
  discard: boolean;
  /** Sending for approval needs a passing test on the current content, which an admin may skip. */
  submitNeedsTest: boolean;
}

/** Whether a user may write a proposal at all: any academic author (the server also checks who owns an open one). */
export const mayPropose = (caller: PromptCaller): boolean => canAuthorAcademic(caller.roles);

export interface PromptCaller {
  publicId: string;
  roles: readonly string[];
}

/** Scoring and chatbot prompts have no test: a change to them is sent for approval as it is. */
/** The chart image reviewer has no test: the test sends text, and that reviewer needs a picture. */
const UNTESTED_KEYS: readonly string[] = ["CHART_IMAGE_REVIEWER"];

export const hasPromptTest = (category: string, key?: string): boolean =>
  category !== "SCORING" && category !== "CHATBOT" && !(key !== undefined && UNTESTED_KEYS.includes(key));

/** What a user may do with a version; the server decides again, this only decides which buttons to show. */
export function promptActions(version: PromptVersionResponse, caller: PromptCaller): PromptActions {
  const admin = isPlatformAdmin(caller.roles);
  const owner = caller.publicId === version.authorUserPublicId;
  const editor = canAuthorAcademic(caller.roles) && (owner || canReviewAcademic(caller.roles));
  const reviewer = canReviewAcademic(caller.roles) && (admin || !owner);
  const editable = EDITABLE_STATUSES.includes(version.status);
  const testPassed = version.test?.passed === true && version.test.current;
  return {
    edit: editor && editable,
    submit: editor && version.status === "DRAFT",
    approve: canReviewAcademic(caller.roles) && (version.status === "PENDING" ? reviewer : admin && version.status === "DRAFT"),
    reject: reviewer && version.status === "PENDING",
    discard: editor && editable,
    submitNeedsTest: !admin && !testPassed && hasPromptTest(version.category, version.key),
  };
}

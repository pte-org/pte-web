import { EDITABLE_STATUSES } from "./versionConstants";
import { versionActions } from "./versionEditing";

export type VersionRowAction = "VIEW" | "EDIT" | "CLONE" | "SUBMIT" | "REVIEW" | "DISCARD";

/**
 * The actions of one row in the version list, in the order of the menu. A draft or rejected version that the user may
 * edit opens in the editor; any other opens to read. A version that is not a draft can seed a new draft, which is
 * the only way to change an active or past version. A draft can be sent for review or discarded, and a pending one is
 * reviewed in the editor, where the changes and the sample scores are shown before it is activated.
 */
export function versionRowActions(status: string, roles: readonly string[]): VersionRowAction[] {
  const mayEdit = versionActions("DRAFT", roles, false).edit;
  const mayReview = versionActions("PENDING", roles, false).activate;
  const actions: VersionRowAction[] = [mayEdit && EDITABLE_STATUSES.includes(status) ? "EDIT" : "VIEW"];
  if (mayEdit && status !== "DRAFT") actions.push("CLONE");
  if (mayEdit && status === "DRAFT") actions.push("SUBMIT", "DISCARD");
  if (mayReview && status === "PENDING") actions.push("REVIEW");
  return actions;
}

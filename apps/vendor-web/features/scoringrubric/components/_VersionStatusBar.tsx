import type { ReactElement } from "react";
import { ActionMenu, Badge, Button, type BadgeVariant, type ActionMenuItem } from "@pte/ui";
import type { RubricVersionResponse, RubricStatusRequest } from "@pte/api-client";
import type { RubricEditText, VersionActions } from "../versionTypes";

interface VersionStatusBarProps {
  version: RubricVersionResponse;
  actions: VersionActions;
  dirty: boolean;
  busy: boolean;
  valid: boolean;
  text: RubricEditText;
  onSave: () => void;
  onAction: (action: RubricStatusRequest["action"]) => void;
  /** Starts a new draft from this version; offered in the "..." menu to those who may edit. */
  onClone?: () => void;
}

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  DRAFT: "neutral",
  PENDING: "warning",
  ACTIVE: "success",
  REJECTED: "danger",
  RETIRED: "neutral",
};

/**
 * The bar above the editor. It shows one main action for the state of the version (activate when the user may,
 * otherwise submit for review); the rarer ones (discard, a new version, a second route to submit) sit in a menu.
 */
export const VersionStatusBar = ({ version, actions, dirty, busy, valid, text: T, onSave, onAction, onClone }: VersionStatusBarProps): ReactElement => {
  const mainAction: RubricStatusRequest["action"] | null = actions.activate ? "ACTIVATE" : actions.submit ? "SUBMIT" : null;
  const mainLabel = mainAction === "ACTIVATE" ? T.activate : T.submit;
  const menu: ActionMenuItem[] = [
    { label: T.submit, onSelect: () => onAction("SUBMIT"), hidden: !(actions.submit && mainAction !== "SUBMIT"), disabled: busy || dirty },
    { label: T.clone, onSelect: onClone, hidden: !onClone, disabled: busy || dirty },
    { label: T.discard, onSelect: () => onAction("DISCARD"), hidden: !actions.discard, disabled: busy, danger: true },
  ].filter((item) => !item.hidden);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium">{T.title} {version.versionNo}</span>
      <Badge variant={STATUS_VARIANT[version.status] ?? "neutral"}>{version.status}</Badge>
      {dirty && <Badge variant="warning">{T.notSaved}</Badge>}
      <div className="ml-auto flex items-center gap-2">
        {actions.edit && (
          <Button variant="secondary" onClick={onSave} disabled={busy || !valid || (!dirty && version.status !== "REJECTED")}>
            {T.save}
          </Button>
        )}
        {actions.reject && (
          <Button variant="ghost" onClick={() => onAction("REJECT")} disabled={busy}>{T.reject}</Button>
        )}
        {mainAction && (
          <Button onClick={() => onAction(mainAction)} disabled={busy || dirty}>{mainLabel}</Button>
        )}
        {menu.length > 0 && <ActionMenu items={menu} label={T.moreActions} />}
      </div>
    </div>
  );
};

import type { ReactElement } from "react";
import { ActionMenu, Badge, Button, PageHeader, formatShortDateTime, useLocale, type ActionMenuItem } from "@pte/ui";
import type { RubricVersionResponse, RubricStatusRequest } from "@pte/api-client";
import type { RubricEditText, VersionActions } from "../versionTypes";
import { statusLabel, statusVariant } from "../versionStatus";

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

/**
 * The page header: the version's name with its status beside it, when it last changed under it, and the actions on the
 * right. One main action for the state of the version (activate when the user may, otherwise submit for review); the
 * rarer ones (a new version, a second route to submit, discard) sit in a menu, the destructive one set apart.
 */
export const VersionStatusBar = ({ version, actions, dirty, busy, valid, text: T, onSave, onAction, onClone }: VersionStatusBarProps): ReactElement => {
  const { locale } = useLocale();
  const mainAction: RubricStatusRequest["action"] | null = actions.activate ? "ACTIVATE" : actions.submit ? "SUBMIT" : null;
  const mainLabel = mainAction === "ACTIVATE" ? T.activate : T.submit;
  const safe: ActionMenuItem[] = [
    { label: T.submit, onSelect: () => onAction("SUBMIT"), hidden: !(actions.submit && mainAction !== "SUBMIT"), disabled: busy || dirty },
    { label: T.clone, onSelect: onClone, hidden: !onClone, disabled: busy || dirty },
  ].filter((item) => !item.hidden);
  const menu: ActionMenuItem[] = [
    ...safe,
    ...(actions.discard ? [...(safe.length > 0 ? [{ separator: true as const }] : []), { label: T.discard, onSelect: () => onAction("DISCARD"), disabled: busy, danger: true }] : []),
  ];
  const lang = locale === "vi" ? "vi" : "en";

  return (
    <div className="flex flex-col gap-2">
      <PageHeader
        title={`${T.title} ${version.versionNo}`}
        titleBadge={
          <span className="inline-flex items-center gap-2">
            <Badge variant={statusVariant(version.status)}>{statusLabel(version.status, T)}</Badge>
            {dirty && <Badge variant="warning">{T.notSaved}</Badge>}
          </span>
        }
        actions={
          <>
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
          </>
        }
      />
      {version.updatedAt && (
        <p className="text-sm text-[var(--ink-secondary)]">
          {T.lastUpdated} {formatShortDateTime(version.updatedAt, lang)}{version.updatedByName ? ` · ${T.by} ${version.updatedByName}` : ""}
        </p>
      )}
    </div>
  );
};

import type { ReactElement } from "react";
import { Badge, Button } from "@pte/ui";
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
}
export const VersionStatusBar = ({ version, actions, dirty, busy, valid, text: T, onSave, onAction }: VersionStatusBarProps): ReactElement => (
  <div className="flex flex-wrap items-center gap-3">
    <Badge>{T.status}: {version.status}</Badge>
    {actions.edit && <Button onClick={onSave} disabled={busy || !valid || (!dirty && version.status !== "REJECTED")}>{T.save}</Button>}
    {actions.submit && <Button onClick={() => onAction("SUBMIT")} disabled={busy || dirty}>{T.submit}</Button>}
    {actions.activate && <Button onClick={() => onAction("ACTIVATE")} disabled={busy || dirty}>{T.activate}</Button>}
    {actions.reject && <Button onClick={() => onAction("REJECT")} disabled={busy}>{T.reject}</Button>}
    {actions.discard && <Button variant="ghost" onClick={() => onAction("DISCARD")} disabled={busy}>{T.discard}</Button>}
  </div>
);

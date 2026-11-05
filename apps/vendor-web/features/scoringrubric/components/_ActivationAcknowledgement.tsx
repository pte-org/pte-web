"use client";
import { useState, type ReactElement } from "react";
import { Button, Checkbox } from "@pte/ui";
import type { RubricDiffResponse, RubricStatusRequest } from "@pte/api-client";
import { canConfirmActivation } from "../versionEditing";
import type { RubricEditText } from "../versionTypes";
import { VersionDiffPanel } from "./_VersionDiffPanel";

interface AcknowledgementProps { diff: RubricDiffResponse; pending: boolean; text: RubricEditText; onConfirm: (request: RubricStatusRequest) => void }
export const ActivationAcknowledgement = ({ diff, pending, text: T, onConfirm }: AcknowledgementProps): ReactElement => {
  const [checked, setChecked] = useState(false);
  return <div className="space-y-4"><VersionDiffPanel diff={diff} text={T} />
    <Checkbox label={T.confirm} checked={checked} disabled={pending} onChange={(event) => setChecked(event.target.checked)} />
    <Button disabled={!canConfirmActivation(checked, diff.diffDigest, pending)} onClick={() => onConfirm({ action: "ACTIVATE",
      expectedActiveVersionPublicId: diff.expectedActiveVersionPublicId, confirmedDiffDigest: diff.diffDigest })}>{T.activate}</Button>
  </div>;
};

"use client";

import { useState, type ReactElement } from "react";
import { getUserFacingApiErrorMessage, type AiStatusLimits } from "@pte/api-client";
import { Button, DashboardPanel, DescriptionList, UnsavedChangesDialog, UnsavedChangesGuard, useLeaveAfterSave, useToast } from "@pte/ui";
import { useRouter } from "next/navigation";
import { useUpdateGenerationLimits } from "../api";
import { GENERATION_LIMITS, type AiAdminCopy } from "../constants";
import { useLimitsEditing } from "../hooks/useLimitsEditing";
import { LimitEditor } from "./_LimitEditor";

interface AiLimitsPanelProps {
  limits: AiStatusLimits;
  copy: AiAdminCopy;
}

/**
 * The generation limits. Read-only until Edit; Save stores every changed limit at once. Leaving the edit with unsaved
 * changes asks whether to save first; the dialog's close button keeps the person editing.
 */
export const AiLimitsPanel = ({ limits, copy }: AiLimitsPanelProps): ReactElement => {
  const edit = useLimitsEditing(limits);
  const update = useUpdateGenerationLimits();
  const { showToast } = useToast();
  const [leaving, setLeaving] = useState(false);
  const leaveAfterSave = useLeaveAfterSave();
  const router = useRouter();

  const save = (): void => {
    if (edit.changes.length === 0) {
      edit.stop();
      return;
    }
    update.mutate(edit.changes.map(({ limit, value }) => ({ settingKey: limit.settingKey, value })), {
      onSuccess: () => {
        setLeaving(false);
        edit.stop();
        showToast(copy.LIMIT_SAVED, { tone: "success" });
        leaveAfterSave.settle();
      },
      onError: (error) => showToast(getUserFacingApiErrorMessage(error, copy.LIMIT_ERROR), { tone: "error" }),
    });
  };
  const exit = (): void => (edit.changes.length > 0 || edit.anyInvalid ? setLeaving(true) : edit.stop());
  const discard = (): void => {
    setLeaving(false);
    edit.stop();
  };

  const actions = edit.editing ? (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="secondary" onClick={exit} disabled={update.isPending}>{copy.LIMIT_EXIT}</Button>
      <Button size="sm" onClick={save} isLoading={update.isPending}
        disabled={edit.anyInvalid || edit.changes.length === 0}>{copy.LIMIT_SAVE}</Button>
    </div>
  ) : (
    <Button size="sm" onClick={edit.start}>{copy.LIMIT_EDIT}</Button>
  );

  return (
    <DashboardPanel title={copy.LIMITS_PANEL} actions={actions}>
      <DescriptionList
        variant="inline"
        items={GENERATION_LIMITS.map((limit) => ({
          label: copy[limit.label],
          value: edit.editing ? (
            <LimitEditor limit={limit} copy={copy} value={edit.drafts[limit.field] ?? String(limits[limit.field])}
              invalid={edit.invalid(limit)} onChange={(value) => edit.setDraft(limit.field, value)}
              hint={limit.field === "maxCallsPerItem" ? copy.MAX_CALLS_HINT : undefined} />
          ) : limits[limit.field],
        }))}
      />
      <UnsavedChangesDialog open={leaving} isSaving={update.isPending} onSaveAndLeave={save} onLeave={discard}
        onStay={() => setLeaving(false)} />
      <UnsavedChangesGuard isDirty={edit.editing && edit.changes.length > 0} isSaving={update.isPending}
        onSaveAndLeave={(proceed) => leaveAfterSave.request(proceed, save)} onNavigate={(href) => router.push(href)} />
    </DashboardPanel>
  );
};

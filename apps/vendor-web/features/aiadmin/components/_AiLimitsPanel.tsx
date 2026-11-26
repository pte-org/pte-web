"use client";

import { useState, type ReactElement } from "react";
import { getUserFacingApiErrorMessage, type AiStatusLimits } from "@pte/api-client";
import { Button, DashboardPanel, PencilIcon, UnsavedChangesDialog, UnsavedChangesGuard, useLeaveAfterSave, useToast } from "@pte/ui";
import { useRouter } from "next/navigation";
import { useUpdateGenerationLimits } from "../api";
import { GENERATION_LIMITS, type AiAdminCopy, type GenerationLimit } from "../constants";
import { useLimitsEditing } from "../hooks/useLimitsEditing";
import { LimitEditor } from "./_LimitEditor";

interface AiLimitsPanelProps {
  limits: AiStatusLimits;
  copy: AiAdminCopy;
}

/** A limit as a big number with its unit beside it; a daily limit of 0 means no limit and says so in words. */
const LimitValue = ({ limit, value, copy }: { limit: GenerationLimit; value: number; copy: AiAdminCopy }): ReactElement =>
  value === 0 && limit.min === 0 ? (
    <span className="text-lg font-semibold text-[var(--ink-primary)]">{copy.UNLIMITED}</span>
  ) : (
    <span>
      <span className="text-2xl font-semibold tabular-nums text-[var(--ink-primary)]">{value}</span>{" "}
      <span className="text-sm text-[var(--ink-secondary)]">{copy[limit.unit].replace("{count}", "").trim()}</span>
    </span>
  );

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
    <Button size="sm" variant="secondary" leftIcon={<PencilIcon className="h-3.5 w-3.5" />} onClick={edit.start}>
      {copy.LIMIT_EDIT}
    </Button>
  );

  return (
    <DashboardPanel title={copy.LIMITS_PANEL} actions={actions}>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-0 lg:divide-x lg:divide-[var(--shell-border)]">
        {GENERATION_LIMITS.map((limit) => (
          <div key={limit.field} className="min-w-0 lg:px-6 lg:first:pl-0 lg:last:pr-0">
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">{copy[limit.label]}</dt>
            <dd className="mt-1.5">
              {edit.editing ? (
                <LimitEditor limit={limit} copy={copy} value={edit.drafts[limit.field] ?? String(limits[limit.field])}
                  invalid={edit.invalid(limit)} onChange={(value) => edit.setDraft(limit.field, value)} />
              ) : (
                <LimitValue limit={limit} value={limits[limit.field]} copy={copy} />
              )}
            </dd>
          </div>
        ))}
      </dl>
      {/* The allowance's explanation is one sentence for the whole strip, not for the one narrow cell it belongs to. */}
      {edit.editing && <p className="mt-4 text-xs text-[var(--ink-muted)]">{copy.MAX_CALLS_HINT}</p>}
      <UnsavedChangesDialog open={leaving} isSaving={update.isPending} onSaveAndLeave={save} onLeave={discard}
        onStay={() => setLeaving(false)} />
      <UnsavedChangesGuard isDirty={edit.editing && edit.changes.length > 0} isSaving={update.isPending}
        onSaveAndLeave={(proceed) => leaveAfterSave.request(proceed, save)} onNavigate={(href) => router.push(href)} />
    </DashboardPanel>
  );
};

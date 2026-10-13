"use client";

import { useMemo, useState, type FormEvent, type ReactElement } from "react";
import {
  getUserFacingApiErrorMessage,
  type PatchExamDraftRequest,
  type PatchExamPolicyRequest,
  type PatchExamScheduleRequest,
} from "@pte/api-client";
import {
  Alert,
  Button,
  ConfirmDialog,
  DescriptionList,
  Select,
  useLocale,
  useToast,
} from "@pte/ui";
import {
  useTransitionExamStatus,
  useUpdateExamDraft,
  useUpdateExamPolicy,
  useUpdateExamSchedule,
  type ExamStatusTransitionTarget,
} from "../api";
import { EXAM_EDITOR_TEXT, SESSION_STATUS_LABELS, SESSION_STATUS_TRANSITIONS } from "../constants";
import { useExamEditTimingWarning } from "../hooks/useExamEditTimingWarning";
import type { ExamSession } from "../types";
import { ExamDraftFields } from "./ExamDraftFields";
import { ExamPolicyFields } from "./ExamPolicyFields";
import { ExamScheduleFields } from "./ExamScheduleFields";
import {
  draftFormFromSession,
  policyFormFromSession,
  scheduleFormFromSession,
  type DraftFormValues,
  type PolicyFormValues,
  type ScheduleFormValues,
} from "./ExamEditTypes";

interface ExamEditFormProps {
  session: ExamSession;
  onCancel: () => void;
  onSaved: () => void;
}

export const ExamEditForm = ({ session, onCancel, onSaved }: ExamEditFormProps): ReactElement => {
  const { t } = useLocale();
  const { showToast } = useToast();
  const draftUpdate = useUpdateExamDraft(session.id);
  const policyUpdate = useUpdateExamPolicy(session.id);
  const scheduleUpdate = useUpdateExamSchedule(session.id);
  const statusUpdate = useTransitionExamStatus(session.id);
  const isDraft = session.status === "DRAFT";
  const isScheduled = session.status === "SCHEDULED";
  const [draftForm, setDraftForm] = useState(() => draftFormFromSession(session));
  const [policyForm, setPolicyForm] = useState(() => policyFormFromSession(session));
  const [scheduleForm, setScheduleForm] = useState(() => scheduleFormFromSession(session));
  const [selectedStatus, setSelectedStatus] = useState<ExamSession["status"]>(session.status);
  const [submitted, setSubmitted] = useState(false);
  const [confirmCloseReminder, setConfirmCloseReminder] = useState(false);
  useExamEditTimingWarning(session);

  const isPending =
    draftUpdate.isPending ||
    policyUpdate.isPending ||
    scheduleUpdate.isPending ||
    statusUpdate.isPending;
  const mutationError =
    draftUpdate.error ?? policyUpdate.error ?? scheduleUpdate.error ?? statusUpdate.error;
  const error = mutationError
    ? getUserFacingApiErrorMessage(
        mutationError,
        t("tenant.examDetails.saveFailed", EXAM_EDITOR_TEXT.SAVE_FAILED),
      )
    : null;
  const draftInitial = useMemo(() => draftFormFromSession(session), [session]);
  const policyInitial = useMemo(() => policyFormFromSession(session), [session]);
  const scheduleInitial = useMemo(() => scheduleFormFromSession(session), [session]);
  const draftDirty = JSON.stringify(draftForm) !== JSON.stringify(draftInitial);
  const policyDirty = JSON.stringify(policyForm) !== JSON.stringify(policyInitial);
  const scheduleDirty = JSON.stringify(scheduleForm) !== JSON.stringify(scheduleInitial);
  const dataDirty = isDraft ? draftDirty : scheduleDirty || (isScheduled && policyDirty);
  const statusDirty = selectedStatus !== session.status;
  const dirty = dataDirty || statusDirty;
  const statusOptions = useMemo(() => {
    const availableStatuses = SESSION_STATUS_TRANSITIONS[session.status] as readonly string[];
    return Object.entries(SESSION_STATUS_LABELS).map(([value, fallback]) => ({
      value,
      label: t(`tenant.examStatus.${value.toLowerCase()}`, fallback),
      disabled: !availableStatuses.includes(value),
    }));
  }, [session.status, t]);

  const updateDraft = <K extends keyof DraftFormValues>(
    field: K,
    value: DraftFormValues[K],
  ): void => {
    setDraftForm((current) => ({ ...current, [field]: value }));
  };
  const updatePolicy = <K extends keyof PolicyFormValues>(
    field: K,
    value: PolicyFormValues[K],
  ): void => {
    setPolicyForm((current) => ({ ...current, [field]: value }));
  };
  const updateSchedule = <K extends keyof ScheduleFormValues>(
    field: K,
    value: ScheduleFormValues[K],
  ): void => {
    setScheduleForm((current) => ({ ...current, [field]: value }));
  };

  const validSchedule = (): boolean => {
    if (!scheduleForm.closesAt) return false;
    if (!isScheduled) return new Date(scheduleForm.closesAt) > new Date(session.opensAt);
    return Boolean(
      scheduleForm.name.trim() &&
      scheduleForm.opensAt &&
      new Date(scheduleForm.closesAt) > new Date(scheduleForm.opensAt),
    );
  };

  const handleSaved = (): void => {
    showToast(t("tenant.examDetails.saved", EXAM_EDITOR_TEXT.SAVED), { tone: "success" });
    onSaved();
  };

  const commitSave = async (): Promise<void> => {
    if (isDraft) {
      const valid = Boolean(
        draftForm.name.trim() &&
        draftForm.opensAt &&
        draftForm.closesAt &&
        draftForm.closesAt > draftForm.opensAt &&
        /^\d+$/.test(draftForm.capacity) &&
        Number(draftForm.capacity) > 0 &&
        /^\d+$/.test(draftForm.maxRetriesPerStudent) &&
        Number(draftForm.maxRetriesPerStudent) <= 9 &&
        draftForm.selectedSkills.length > 0,
      );
      if (!valid) return;
      const payload: PatchExamDraftRequest = {
        name: draftForm.name.trim(),
        opensAt: new Date(draftForm.opensAt).toISOString(),
        closesAt: new Date(draftForm.closesAt).toISOString(),
        capacity: Number(draftForm.capacity),
        maxRetriesPerStudent: Number(draftForm.maxRetriesPerStudent),
        selectedSkills: draftForm.selectedSkills,
        expectedVersion: session.draftVersion,
        seriesKey: draftForm.seriesKey.trim() || null,
      };
      if (session.formMode !== null) payload.formMode = draftForm.formMode || undefined;
      if (session.reusePolicy !== null) payload.reusePolicy = draftForm.reusePolicy || undefined;
      if (dataDirty) await draftUpdate.mutateAsync(payload);
    } else {
      if (!validSchedule()) return;
      if (scheduleDirty) {
        const payload: PatchExamScheduleRequest = {
          closesAt: new Date(scheduleForm.closesAt).toISOString(),
          expectedVersion: session.draftVersion,
        };
        if (isScheduled) {
          payload.name = scheduleForm.name.trim();
          payload.opensAt = new Date(scheduleForm.opensAt).toISOString();
        }
        await scheduleUpdate.mutateAsync(payload);
      }
      if (isScheduled && policyDirty) {
        const payload: PatchExamPolicyRequest = {
          replayPolicyType: policyForm.replayPolicyType,
          replayPolicyLimit:
            policyForm.replayPolicyType === "LIMITED" ? Number(policyForm.replayPolicyLimit) : null,
          deviceCheckRequired: policyForm.deviceCheckRequired,
          proctorRequired: policyForm.proctorRequired,
          answerIntegrityLevel: policyForm.answerIntegrityLevel,
        };
        await policyUpdate.mutateAsync(payload);
      }
    }
    if (statusDirty) await statusUpdate.mutateAsync(selectedStatus as ExamStatusTransitionTarget);
    handleSaved();
  };

  const save = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setSubmitted(true);
    if (isDraft && !draftForm.name.trim()) return;
    if (!isDraft && !validSchedule()) return;
    const closeTimeNotExtended =
      !isDraft &&
      selectedStatus !== "CLOSED" &&
      selectedStatus !== "CANCELLED" &&
      scheduleForm.closesAt <= scheduleInitial.closesAt &&
      (session.status === "OPEN" || new Date(session.opensAt).getTime() <= Date.now());
    if (closeTimeNotExtended) {
      setConfirmCloseReminder(true);
      return;
    }
    try {
      await commitSave();
    } catch {
      // Mutation errors are rendered from the mutation state above.
    }
  };

  return (
    <>
      <form className="flex flex-col gap-5" onSubmit={save} noValidate>
        {error && <Alert tone="error">{error}</Alert>}
        <div className="max-w-sm">
          <Select
            label={t("tenant.examDetails.status", EXAM_EDITOR_TEXT.STATUS)}
            value={selectedStatus}
            options={statusOptions}
            onChange={(event) => setSelectedStatus(event.target.value as ExamSession["status"])}
          />
        </div>
        {isDraft ? (
          <ExamDraftFields
            form={draftForm}
            session={session}
            submitted={submitted}
            onChange={updateDraft}
          />
        ) : (
          <>
            <ExamScheduleFields
              form={scheduleForm}
              status={session.status}
              submitted={submitted}
              onChange={updateSchedule}
            />
            {isScheduled && (
              <ExamPolicyFields form={policyForm} submitted={submitted} onChange={updatePolicy} />
            )}
          </>
        )}
        <DescriptionList
          variant="inline"
          items={[
            {
              label: t("tenant.examDetails.code", EXAM_EDITOR_TEXT.CODE),
              value: session.sessionCode,
            },
          ]}
        />
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isPending}>
            {t("tenant.examDetails.cancelEdit", EXAM_EDITOR_TEXT.CANCEL)}
          </Button>
          <Button type="submit" isLoading={isPending} disabled={!dirty}>
            {t("tenant.examDetails.save", EXAM_EDITOR_TEXT.SAVE)}
          </Button>
        </div>
      </form>
      <ConfirmDialog
        open={confirmCloseReminder}
        title={t(
          "tenant.examDetails.closeTimeReminderTitle",
          EXAM_EDITOR_TEXT.CLOSE_TIME_REMINDER_TITLE,
        )}
        description={t(
          "tenant.examDetails.closeTimeReminderDescription",
          EXAM_EDITOR_TEXT.CLOSE_TIME_REMINDER_DESCRIPTION,
        )}
        confirmLabel={t(
          "tenant.examDetails.closeTimeReminderConfirm",
          EXAM_EDITOR_TEXT.CLOSE_TIME_REMINDER_CONFIRM,
        )}
        cancelLabel={t(
          "tenant.examDetails.closeTimeReminderCancel",
          EXAM_EDITOR_TEXT.CLOSE_TIME_REMINDER_CANCEL,
        )}
        isConfirming={isPending}
        onConfirm={() => {
          setConfirmCloseReminder(false);
          void commitSave().catch(() => undefined);
        }}
        onClose={() => setConfirmCloseReminder(false)}
      />
    </>
  );
};

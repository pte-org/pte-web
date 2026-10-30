"use client";

import { useMemo, useState, type FormEvent, type ReactElement } from "react";
import {
  type PatchExamDraftRequest,
  type PatchExamPolicyRequest,
  type PatchExamScheduleRequest,
} from "@pte/api-client";
import { Alert, Button, DescriptionList, Select, useLocale, useToast } from "@pte/ui";
import {
  useTransitionExamStatus,
  useUpdateExamDraft,
  useUpdateExamPolicy,
  useUpdateExamSchedule,
  type ExamStatusTransitionTarget,
} from "../api";
import {
  EXAM_EDITOR_TEXT,
  OFFICIAL_EXAM_LOCKDOWN_MODE,
  SESSION_STATUS_LABELS,
  SESSION_STATUS_TRANSITIONS,
  SINGLE_SITTING_RETRIES,
} from "../constants";
import { useExamEditTimingWarning } from "../hooks/useExamEditTimingWarning";
import { useExamMutationErrorToast } from "../hooks/useExamMutationErrorToast";
import type { ExamSession } from "../types";
import { getExamScheduleTimingState } from "../utils/examScheduleTiming";
import { ExamDraftFields } from "./ExamDraftFields";
import { ExamPolicyFields } from "./ExamPolicyFields";
import { ExamScheduleFields } from "./ExamScheduleFields";
import {
  ExamScheduleTimingGuard,
  type ExamScheduleTimingConfirmation,
} from "./ExamScheduleTimingGuard";
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
  const isReady = session.status === "READY";
  const isScheduled = session.status === "SCHEDULED";
  const [draftForm, setDraftForm] = useState(() => draftFormFromSession(session));
  const [policyForm, setPolicyForm] = useState(() => policyFormFromSession(session));
  const [scheduleForm, setScheduleForm] = useState(() => scheduleFormFromSession(session));
  const [selectedStatus, setSelectedStatus] = useState<ExamSession["status"]>(session.status);
  const [submitted, setSubmitted] = useState(false);
  const [closeTimeConfirmation, setCloseTimeConfirmation] =
    useState<ExamScheduleTimingConfirmation>(null);
  useExamEditTimingWarning(session);

  const isPending =
    draftUpdate.isPending ||
    policyUpdate.isPending ||
    scheduleUpdate.isPending ||
    statusUpdate.isPending;
  const mutationError =
    draftUpdate.error ?? policyUpdate.error ?? scheduleUpdate.error ?? statusUpdate.error;
  useExamMutationErrorToast(mutationError);
  const draftInitial = useMemo(() => draftFormFromSession(session), [session]);
  const policyInitial = useMemo(() => policyFormFromSession(session), [session]);
  const scheduleInitial = useMemo(() => scheduleFormFromSession(session), [session]);
  const scheduleTimingState = getExamScheduleTimingState(
    session,
    scheduleInitial.closesAt,
    scheduleForm.closesAt,
  );
  const draftDirty = JSON.stringify(draftForm) !== JSON.stringify(draftInitial);
  const policyDirty = JSON.stringify(policyForm) !== JSON.stringify(policyInitial);
  const scheduleDirty = JSON.stringify(scheduleForm) !== JSON.stringify(scheduleInitial);
  const dataDirty = isDraft ? draftDirty : isScheduled && (scheduleDirty || policyDirty);
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
    if (isReady) return true;
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
    const currentTimingState = getExamScheduleTimingState(
      session,
      scheduleInitial.closesAt,
      scheduleForm.closesAt,
    );
    if (
      currentTimingState === "CLOSE_TIME_SHORTENED" ||
      currentTimingState === "CLOSE_TIME_NOT_IN_FUTURE"
    ) {
      return;
    }

    if (isDraft) {
      const valid = Boolean(
        draftForm.name.trim() &&
        draftForm.opensAt &&
        draftForm.closesAt &&
        draftForm.closesAt > draftForm.opensAt &&
        /^\d+$/.test(draftForm.capacity) &&
        Number(draftForm.capacity) > 0 &&
        draftForm.selectedSkills.length > 0,
      );
      if (!valid) return;
      const payload: PatchExamDraftRequest = {
        name: draftForm.name.trim(),
        opensAt: new Date(draftForm.opensAt).toISOString(),
        closesAt: new Date(draftForm.closesAt).toISOString(),
        capacity: Number(draftForm.capacity),
        maxRetriesPerStudent: SINGLE_SITTING_RETRIES,
        selectedSkills: draftForm.selectedSkills,
        expectedVersion: session.draftVersion,
        seriesKey: draftForm.seriesKey.trim() || null,
        lockdownMode: OFFICIAL_EXAM_LOCKDOWN_MODE,
      };
      if (session.reusePolicy !== null) payload.reusePolicy = draftForm.reusePolicy || undefined;
      if (dataDirty) await draftUpdate.mutateAsync(payload);
    } else if (!isReady) {
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

    const currentTimingState = getExamScheduleTimingState(
      session,
      scheduleInitial.closesAt,
      scheduleForm.closesAt,
    );
    if (
      currentTimingState === "CLOSE_TIME_SHORTENED" ||
      currentTimingState === "CLOSE_TIME_NOT_IN_FUTURE"
    ) {
      return;
    }

    const shouldConfirmTiming = selectedStatus !== "CLOSED" && selectedStatus !== "CANCELLED";
    if (shouldConfirmTiming && currentTimingState === "CLOSE_TIME_EXTENDED") {
      setCloseTimeConfirmation("EXTENDED");
      return;
    }
    if (shouldConfirmTiming && currentTimingState === "CLOSE_TIME_UNCHANGED") {
      setCloseTimeConfirmation("UNCHANGED");
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
        <ExamScheduleTimingGuard
          state={scheduleTimingState}
          confirmation={closeTimeConfirmation}
          previousClosesAt={scheduleInitial.closesAt}
          nextClosesAt={scheduleForm.closesAt}
          isConfirming={isPending}
          onConfirm={() => {
            setCloseTimeConfirmation(null);
            void commitSave().catch(() => undefined);
          }}
          onClose={() => setCloseTimeConfirmation(null)}
        />
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
        ) : isReady ? (
          <Alert tone="info">
            {t("tenant.examDetails.readyStatusHelp", EXAM_EDITOR_TEXT.READY_STATUS_HELP)}
          </Alert>
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
    </>
  );
};

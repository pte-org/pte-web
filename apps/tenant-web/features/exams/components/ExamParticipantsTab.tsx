"use client";

import { type ReactElement } from "react";
import { Alert, Button, CollapsibleSection, useLocale } from "@pte/ui";
import { StudentRosterTable } from "@/features/examoperations/components";
import { SESSION_DETAIL_TEXT } from "../constants";
import type { ExamSession } from "../types";
import { proctorAssignmentLock, studentRosterLock } from "../utils/participantLock";
import { ProctorAssignmentSection } from "./ProctorAssignmentSection";

interface ExamParticipantsTabProps {
  session: ExamSession;
  sessionPublicId: string;
  onOpenStudentAssignment: () => void;
}

const T = SESSION_DETAIL_TEXT;

export const ExamParticipantsTab = ({
  session,
  sessionPublicId,
  onOpenStudentAssignment,
}: ExamParticipantsTabProps): ReactElement => {
  const { t } = useLocale();
  // Mirrors the API: the roster only changes before the exam runs or after it ends.
  // Students can only be added or removed before the exam runs; after it closes they could never sit it.
  const studentLock = studentRosterLock(session.status);
  const audienceLocked = studentLock !== null;
  const lockedNotice = {
    PREPARING: t("tenant.participants.lockedNotice", T.AUDIENCE_LOCKED_NOTICE),
    STARTED: t("tenant.participants.studentsLockedStarted", T.STUDENTS_LOCKED_STARTED),
    ENDED: t("tenant.participants.studentsLockedEnded", T.STUDENTS_LOCKED_ENDED),
  }[studentLock ?? "PREPARING"];

  const proctorLock = proctorAssignmentLock(session.status);
  const proctorLockedNotice =
    proctorLock === "STARTED"
      ? t("tenant.participants.proctorsLockedStarted", T.PROCTORS_LOCKED_STARTED)
      : proctorLock === "ENDED"
        ? t("tenant.participants.proctorsLockedEnded", T.PROCTORS_LOCKED_ENDED)
        : undefined;

  return (
    <div className="flex flex-col gap-5">
      <CollapsibleSection
        title={t("tenant.participants.students", T.STUDENTS_SECTION)}
        className="rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] p-5"
        contentClassName="flex flex-col gap-5"
        actions={
          <Button
            size="sm"
            onClick={onOpenStudentAssignment}
            disabled={audienceLocked}
            title={audienceLocked ? lockedNotice : undefined}
          >
            {t("tenant.participants.addStudents", T.ADD_EXISTING_STUDENTS)}
          </Button>
        }
      >
        {audienceLocked && <Alert tone="warning">{lockedNotice}</Alert>}
        <StudentRosterTable sessionPublicId={sessionPublicId} canRemove={!audienceLocked} />
      </CollapsibleSection>

      <ProctorAssignmentSection
        sessionPublicId={sessionPublicId}
        assignLockedNotice={proctorLockedNotice}
      />
    </div>
  );
};

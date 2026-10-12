"use client";

import type { ReactElement } from "react";
import { Alert, Button, CollapsibleSection, useLocale } from "@pte/ui";
import { StudentRosterTable } from "@/features/examoperations/components";
import { SESSION_DETAIL_TEXT } from "../constants";
import type { ExamSession } from "../types";
import { ClassAssignmentSection } from "./ClassAssignmentSection";
import { ProctorAssignmentSection } from "./ProctorAssignmentSection";

interface ExamParticipantsTabProps {
  session: ExamSession;
  sessionPublicId: string;
  onOpenStudentAssignment: () => void;
  onOpenStudentImport: () => void;
}

const T = SESSION_DETAIL_TEXT;

export const ExamParticipantsTab = ({
  session,
  sessionPublicId,
  onOpenStudentAssignment,
  onOpenStudentImport,
}: ExamParticipantsTabProps): ReactElement => {
  const { t } = useLocale();
  const audienceLocked = session.status !== "SCHEDULED";
  const lockedNotice = t("tenant.participants.lockedNotice", T.AUDIENCE_NOT_SCHEDULED_NOTICE);

  return (
    <div className="flex flex-col gap-5">
      <CollapsibleSection
        title={t("tenant.participants.classes", T.CLASSES_SECTION)}
        className="rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] p-5"
        contentClassName="flex flex-col gap-3"
      >
        <ClassAssignmentSection
          sessionPublicId={sessionPublicId}
          canModify={session.status === "SCHEDULED"}
        />
      </CollapsibleSection>

      <CollapsibleSection
        title={t("tenant.participants.students", T.STUDENTS_SECTION)}
        className="rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] p-5"
        contentClassName="flex flex-col gap-5"
        actions={
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              size="sm"
              onClick={onOpenStudentAssignment}
              disabled={audienceLocked}
              title={audienceLocked ? lockedNotice : undefined}
            >
              {t("tenant.participants.addStudents", T.ADD_EXISTING_STUDENTS)}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={onOpenStudentImport}
              disabled={audienceLocked}
              title={audienceLocked ? lockedNotice : undefined}
            >
              {t("tenant.participants.importStudents", T.IMPORT_EXISTING_STUDENTS)}
            </Button>
          </div>
        }
      >
        {audienceLocked && <Alert tone="warning">{lockedNotice}</Alert>}
        <StudentRosterTable sessionPublicId={sessionPublicId} />
      </CollapsibleSection>

      <ProctorAssignmentSection sessionPublicId={sessionPublicId} />
    </div>
  );
};

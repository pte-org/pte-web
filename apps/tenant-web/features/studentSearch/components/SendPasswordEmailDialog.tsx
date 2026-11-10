"use client";

import type { ReactElement } from "react";
import { ConfirmDialog, useLocale, useToast } from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { useSendUserCredentials } from "@/features/userManagement";
import { STUDENT_ROSTER_FILTER_TEXT as TEXT } from "../constants";
import type { SendPasswordEmailTarget } from "../utils/sendPasswordEmail";

interface SendPasswordEmailDialogProps {
  student: SendPasswordEmailTarget | null;
  onClose: () => void;
}

/** Confirms, then e-mails the student a fresh temporary password. The password itself is never shown. */
export const SendPasswordEmailDialog = ({
  student,
  onClose,
}: SendPasswordEmailDialogProps): ReactElement => {
  const { t } = useLocale();
  const { showToast } = useToast();
  const send = useSendUserCredentials();

  const confirm = (): void => {
    if (!student) return;
    send.mutate(student.studentPublicId, {
      onSuccess: () => {
        showToast(
          t(
            "tenant.students.sendPasswordEmailSuccess",
            TEXT.sendPasswordEmailSuccess(student.email),
            { email: student.email },
          ),
          { tone: "success" },
        );
        onClose();
      },
      onError: (error) => {
        showToast(errorMessage(error) ?? "", { tone: "error" });
        onClose();
      },
    });
  };

  return (
    <ConfirmDialog
      open={student !== null}
      title={t("tenant.students.sendPasswordEmailConfirmTitle", TEXT.sendPasswordEmailConfirmTitle)}
      description={
        student
          ? t(
              "tenant.students.sendPasswordEmailConfirmDescription",
              TEXT.sendPasswordEmailConfirmDescription(student.fullName, student.email),
              { name: student.fullName, email: student.email },
            )
          : ""
      }
      confirmLabel={t("tenant.students.sendPasswordEmailConfirm", TEXT.sendPasswordEmailConfirm)}
      cancelLabel={t("tenant.students.cancel", TEXT.cancel)}
      isConfirming={send.isPending}
      onConfirm={confirm}
      onClose={onClose}
    />
  );
};

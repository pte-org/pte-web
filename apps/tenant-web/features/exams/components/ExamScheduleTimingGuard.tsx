"use client";

import type { ReactElement } from "react";
import { Alert, ConfirmDialog, useLocale } from "@pte/ui";
import { EXAM_EDITOR_TEXT } from "../constants";
import {
  formatExamScheduleDateTime,
  type ExamScheduleTimingState,
} from "../utils/examScheduleTiming";

export type ExamScheduleTimingConfirmation = "UNCHANGED" | "EXTENDED" | null;

interface ExamScheduleTimingGuardProps {
  state: ExamScheduleTimingState;
  confirmation: ExamScheduleTimingConfirmation;
  previousClosesAt: string;
  nextClosesAt: string;
  isConfirming: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ExamScheduleTimingGuard = ({
  state,
  confirmation,
  previousClosesAt,
  nextClosesAt,
  isConfirming,
  onConfirm,
  onClose,
}: ExamScheduleTimingGuardProps): ReactElement | null => {
  const { locale, t } = useLocale();
  const previousClose = formatExamScheduleDateTime(previousClosesAt, locale);
  const nextClose = formatExamScheduleDateTime(nextClosesAt, locale);
  const isShortened = state === "CLOSE_TIME_SHORTENED";
  const isNotInFuture = state === "CLOSE_TIME_NOT_IN_FUTURE";
  const hasConfirmation = confirmation !== null;

  if (!isShortened && !isNotInFuture && !hasConfirmation) return null;

  const alertTitle = isShortened
    ? t("tenant.examDetails.closeTimeShortenedTitle", EXAM_EDITOR_TEXT.CLOSE_TIME_SHORTENED_TITLE)
    : t(
        "tenant.examDetails.closeTimeNotInFutureTitle",
        EXAM_EDITOR_TEXT.CLOSE_TIME_NOT_IN_FUTURE_TITLE,
      );
  const alertDescription = isShortened
    ? t(
        "tenant.examDetails.closeTimeShortenedDescription",
        EXAM_EDITOR_TEXT.CLOSE_TIME_SHORTENED_DESCRIPTION,
        { previous: previousClose, next: nextClose },
      )
    : t(
        "tenant.examDetails.closeTimeNotInFutureDescription",
        EXAM_EDITOR_TEXT.CLOSE_TIME_NOT_IN_FUTURE_DESCRIPTION,
      );
  const isExtension = confirmation === "EXTENDED";
  const dialogTitle = isExtension
    ? t("tenant.examDetails.closeTimeExtensionTitle", EXAM_EDITOR_TEXT.CLOSE_TIME_EXTENSION_TITLE)
    : t("tenant.examDetails.closeTimeReminderTitle", EXAM_EDITOR_TEXT.CLOSE_TIME_REMINDER_TITLE);
  const dialogDescription = isExtension
    ? t(
        "tenant.examDetails.closeTimeExtensionDescription",
        EXAM_EDITOR_TEXT.CLOSE_TIME_EXTENSION_DESCRIPTION,
        { previous: previousClose, next: nextClose },
      )
    : t(
        "tenant.examDetails.closeTimeReminderDescription",
        EXAM_EDITOR_TEXT.CLOSE_TIME_REMINDER_DESCRIPTION,
      );
  const confirmLabel = isExtension
    ? t(
        "tenant.examDetails.closeTimeExtensionConfirm",
        EXAM_EDITOR_TEXT.CLOSE_TIME_EXTENSION_CONFIRM,
      )
    : t(
        "tenant.examDetails.closeTimeReminderConfirm",
        EXAM_EDITOR_TEXT.CLOSE_TIME_REMINDER_CONFIRM,
      );

  return (
    <>
      {(isShortened || isNotInFuture) && (
        <Alert tone="warning" title={alertTitle}>
          {alertDescription}
        </Alert>
      )}
      <ConfirmDialog
        open={hasConfirmation}
        tone="warning"
        title={dialogTitle}
        description={dialogDescription}
        confirmLabel={confirmLabel}
        cancelLabel={t(
          "tenant.examDetails.closeTimeReminderCancel",
          EXAM_EDITOR_TEXT.CLOSE_TIME_REMINDER_CANCEL,
        )}
        isConfirming={isConfirming}
        onConfirm={onConfirm}
        onClose={onClose}
      />
    </>
  );
};

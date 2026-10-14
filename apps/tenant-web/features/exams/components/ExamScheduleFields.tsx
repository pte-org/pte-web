"use client";

import type { ReactElement } from "react";
import { DateTimeInput, Input, useLocale } from "@pte/ui";
import { EXAM_EDITOR_TEXT } from "../constants";
import type { ExamSession } from "../types";
import type { ScheduleFormValues } from "./ExamEditTypes";

interface ExamScheduleFieldsProps {
  form: ScheduleFormValues;
  status: ExamSession["status"];
  submitted: boolean;
  onChange: <K extends keyof ScheduleFormValues>(field: K, value: ScheduleFormValues[K]) => void;
}

export const ExamScheduleFields = ({
  form,
  status,
  submitted,
  onChange,
}: ExamScheduleFieldsProps): ReactElement => {
  const { t } = useLocale();
  const isScheduled = status === "SCHEDULED";
  const closeBeforeOpen = Boolean(form.opensAt && form.closesAt && form.closesAt <= form.opensAt);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {isScheduled && (
        <Input
          label={t("tenant.examDetails.name", EXAM_EDITOR_TEXT.NAME)}
          value={form.name}
          error={
            submitted && !form.name.trim()
              ? t("tenant.examDetails.nameRequired", EXAM_EDITOR_TEXT.NAME_REQUIRED)
              : undefined
          }
          onChange={(event) => onChange("name", event.target.value)}
        />
      )}
      {isScheduled && (
        <DateTimeInput
          label={t("tenant.examDetails.opensAt", EXAM_EDITOR_TEXT.OPENS_AT)}
          value={form.opensAt}
          error={
            submitted && !form.opensAt
              ? t("tenant.examDetails.openRequired", EXAM_EDITOR_TEXT.OPEN_REQUIRED)
              : undefined
          }
          onChange={(event) => onChange("opensAt", event.target.value)}
        />
      )}
      <DateTimeInput
        label={t("tenant.examDetails.closesAt", EXAM_EDITOR_TEXT.CLOSES_AT)}
        value={form.closesAt}
        error={
          submitted
            ? !form.closesAt
              ? t("tenant.examDetails.closeRequired", EXAM_EDITOR_TEXT.CLOSE_REQUIRED)
              : closeBeforeOpen
                ? t("tenant.examDetails.closeAfterOpen", EXAM_EDITOR_TEXT.CLOSE_AFTER_OPEN)
                : undefined
            : undefined
        }
        onChange={(event) => onChange("closesAt", event.target.value)}
      />
    </div>
  );
};

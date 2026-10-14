"use client";

import type { ReactElement } from "react";
import { Checkbox, Input, Select, useLocale } from "@pte/ui";
import { EXAM_EDITOR_TEXT } from "../constants";
import type { PolicyFormValues } from "./ExamEditTypes";
import type { ReplayPolicyType, AnswerIntegrityLevel } from "@pte/api-client";

interface ExamPolicyFieldsProps {
  form: PolicyFormValues;
  submitted: boolean;
  onChange: <K extends keyof PolicyFormValues>(field: K, value: PolicyFormValues[K]) => void;
}

export const ExamPolicyFields = ({
  form,
  submitted,
  onChange,
}: ExamPolicyFieldsProps): ReactElement => {
  const { t } = useLocale();
  const replayOptions = [
    {
      value: "UNLIMITED",
      label: t("tenant.examDetails.replayUnlimited", EXAM_EDITOR_TEXT.REPLAY_UNLIMITED),
    },
    {
      value: "LIMITED",
      label: t("tenant.examDetails.replayLimited", EXAM_EDITOR_TEXT.REPLAY_LIMITED),
    },
  ] as const;
  const integrityOptions = [
    {
      value: "STANDARD",
      label: t("tenant.examDetails.answerStandard", EXAM_EDITOR_TEXT.ANSWER_STANDARD),
    },
    {
      value: "STRICT",
      label: t("tenant.examDetails.answerStrict", EXAM_EDITOR_TEXT.ANSWER_STRICT),
    },
  ] as const;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          label={t("tenant.examDetails.replayPolicy", EXAM_EDITOR_TEXT.REPLAY_POLICY)}
          value={form.replayPolicyType}
          options={replayOptions}
          onChange={(event) => onChange("replayPolicyType", event.target.value as ReplayPolicyType)}
        />
        {form.replayPolicyType === "LIMITED" && (
          <Input
            type="number"
            min={1}
            step={1}
            label={t("tenant.examDetails.replayLimit", EXAM_EDITOR_TEXT.REPLAY_LIMIT)}
            value={form.replayPolicyLimit}
            error={
              submitted &&
              (!/^\d+$/.test(form.replayPolicyLimit) || Number(form.replayPolicyLimit) < 1)
                ? t(
                    "tenant.examDetails.replayLimitRequired",
                    EXAM_EDITOR_TEXT.REPLAY_LIMIT_REQUIRED,
                  )
                : undefined
            }
            onChange={(event) => onChange("replayPolicyLimit", event.target.value)}
          />
        )}
        <Select
          label={t("tenant.examDetails.answerIntegrity", EXAM_EDITOR_TEXT.ANSWER_INTEGRITY)}
          value={form.answerIntegrityLevel}
          options={integrityOptions}
          onChange={(event) =>
            onChange("answerIntegrityLevel", event.target.value as AnswerIntegrityLevel)
          }
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Checkbox
          label={t("tenant.examDetails.deviceCheck", EXAM_EDITOR_TEXT.DEVICE_CHECK)}
          checked={form.deviceCheckRequired}
          onChange={(event) => onChange("deviceCheckRequired", event.target.checked)}
        />
        <Checkbox
          label={t("tenant.examDetails.proctorRequired", EXAM_EDITOR_TEXT.PROCTOR_REQUIRED)}
          checked={form.proctorRequired}
          onChange={(event) => onChange("proctorRequired", event.target.checked)}
        />
      </div>
    </div>
  );
};

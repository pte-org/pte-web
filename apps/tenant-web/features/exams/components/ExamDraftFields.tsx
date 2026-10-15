"use client";

import type { ReactElement } from "react";
import { DateTimeInput, Input, Checkbox, Select, useLocale } from "@pte/ui";
import {
  EXAM_EDITOR_TEXT,
  EXAM_SKILL_OPTIONS,
  FORM_MODE_OPTIONS,
  REUSE_POLICY_OPTIONS,
} from "../constants";
import type { ExamSession } from "../types";
import type { DraftFormValues } from "./ExamEditTypes";

interface ExamDraftFieldsProps {
  form: DraftFormValues;
  session: ExamSession;
  submitted: boolean;
  onChange: <K extends keyof DraftFormValues>(field: K, value: DraftFormValues[K]) => void;
}

export const ExamDraftFields = ({
  form,
  session,
  submitted,
  onChange,
}: ExamDraftFieldsProps): ReactElement => {
  const { t } = useLocale();
  const closeBeforeOpen = Boolean(form.opensAt && form.closesAt && form.closesAt <= form.opensAt);
  const localizedSkills = EXAM_SKILL_OPTIONS.map((option) => ({
    ...option,
    label: t(`tenant.createExam.skill.${option.value}`, option.label),
  }));
  const localizedFormModes = FORM_MODE_OPTIONS.map((option) => ({
    ...option,
    label: t(
      option.value === "SHARED_FORM"
        ? "tenant.createExam.FORM_SHARED"
        : "tenant.createExam.FORM_UNIQUE",
      option.label,
    ),
  }));
  const localizedReusePolicies = REUSE_POLICY_OPTIONS.map((option) => ({
    ...option,
    label: t(
      option.value === "ALLOW"
        ? "tenant.createExam.REUSE_ALLOW"
        : option.value === "EXCLUDE_STARTED_IN_SERIES"
          ? "tenant.createExam.REUSE_STARTED"
          : option.value === "EXCLUDE_ASSIGNED_IN_SERIES"
            ? "tenant.createExam.REUSE_ASSIGNED"
            : "tenant.createExam.REUSE_OVERLAP",
      option.label,
    ),
  }));

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
        <Input
          type="number"
          min={1}
          step={1}
          label={t("tenant.examDetails.capacity", EXAM_EDITOR_TEXT.CAPACITY)}
          value={form.capacity}
          error={
            submitted && (!/^\d+$/.test(form.capacity) || Number(form.capacity) < 1)
              ? t("tenant.examDetails.capacityInvalid", EXAM_EDITOR_TEXT.CAPACITY_INVALID)
              : undefined
          }
          onChange={(event) => onChange("capacity", event.target.value)}
        />
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
        <Input
          type="number"
          min={0}
          max={9}
          step={1}
          label={t("tenant.examDetails.retriesPerStudent", EXAM_EDITOR_TEXT.RETRIES)}
          value={form.maxRetriesPerStudent}
          error={
            submitted &&
            (!/^\d+$/.test(form.maxRetriesPerStudent) || Number(form.maxRetriesPerStudent) > 9)
              ? t("tenant.examDetails.retriesInvalid", EXAM_EDITOR_TEXT.RETRIES_INVALID)
              : undefined
          }
          onChange={(event) => onChange("maxRetriesPerStudent", event.target.value)}
        />
        {session.formMode !== null && (
          <Select
            label={t("tenant.examDetails.formMode", EXAM_EDITOR_TEXT.FORM_MODE)}
            value={form.formMode || undefined}
            options={localizedFormModes}
            onChange={(event) =>
              onChange("formMode", event.target.value as DraftFormValues["formMode"])
            }
          />
        )}
        {session.reusePolicy !== null && (
          <Select
            label={t("tenant.examDetails.reusePolicy", EXAM_EDITOR_TEXT.REUSE_POLICY)}
            value={form.reusePolicy || undefined}
            options={localizedReusePolicies}
            onChange={(event) =>
              onChange("reusePolicy", event.target.value as DraftFormValues["reusePolicy"])
            }
          />
        )}
        {session.reusePolicy !== null && form.reusePolicy !== "ALLOW" && (
          <Input
            label={t("tenant.examDetails.series", EXAM_EDITOR_TEXT.SERIES)}
            value={form.seriesKey}
            onChange={(event) => onChange("seriesKey", event.target.value)}
          />
        )}
      </div>
      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-semibold text-[var(--ink-primary)]">
          {t("tenant.examDetails.skillsIncluded", EXAM_EDITOR_TEXT.SKILLS)}
        </legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {localizedSkills.map((option) => (
            <Checkbox
              key={option.value}
              label={option.label}
              checked={form.selectedSkills.includes(option.value)}
              onChange={(event) => {
                const next = event.target.checked
                  ? [...form.selectedSkills, option.value]
                  : form.selectedSkills.filter((skill) => skill !== option.value);
                onChange("selectedSkills", next);
              }}
            />
          ))}
        </div>
        {submitted && form.selectedSkills.length === 0 && (
          <p className="text-sm text-[var(--blush-action)]">
            {t("tenant.examDetails.skillsRequired", EXAM_EDITOR_TEXT.SKILLS_REQUIRED)}
          </p>
        )}
      </fieldset>
    </div>
  );
};

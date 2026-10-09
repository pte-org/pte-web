"use client";

import type { ReactElement } from "react";
import { DashboardCard, useLocale } from "@pte/ui";
import {
  EXAM_MODE_LABELS,
  EXAM_SKILL_OPTIONS,
  SESSION_DETAIL_TEXT,
} from "../constants";
import type { ExamSession } from "../types";
import { getExamPolicyLabel } from "../utils/examPolicy";

interface ExamSettingsTabProps {
  session: ExamSession;
}

const T = SESSION_DETAIL_TEXT;

function formatDateTime(value: string, locale: "vi" | "en"): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export const ExamSettingsTab = ({ session }: ExamSettingsTabProps): ReactElement => {
  const { locale, t } = useLocale();
  const modeLabel = session.examMode ? EXAM_MODE_LABELS[session.examMode] : T.LEGACY_MODE;
  const skillsLabel =
    session.selectedSkills.length > 0
      ? session.selectedSkills
          .map((skill) => EXAM_SKILL_OPTIONS.find((option) => option.value === skill)?.label ?? skill)
          .join(", ")
      : T.LEGACY_SKILLS;

  return (
    <div className="flex flex-col gap-5">
      <DashboardCard className="motion-safe:animate-pte-fade-up">
        <h2 className="text-base font-semibold text-[var(--ink-primary)]">{T.CONFIGURATION_SECTION}</h2>
        <dl className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
              {T.MODE_LABEL}
            </dt>
            <dd className="mt-2 text-sm font-medium text-[var(--ink-primary)]">{modeLabel}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
              {T.SKILLS_LABEL}
            </dt>
            <dd className="mt-2 text-sm font-medium text-[var(--ink-primary)]">{skillsLabel}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
              {T.RETRIES_LABEL}
            </dt>
            <dd className="mt-2 text-sm font-medium text-[var(--ink-primary)]">
              {T.TOTAL_ATTEMPTS(session.maxRetriesPerStudent)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
              {T.SECURITY_POLICY_LABEL}
            </dt>
            <dd className="mt-2 text-sm font-medium text-[var(--ink-primary)]">
              {getExamPolicyLabel(session.examMode, session.policy?.lockdownMode)}
            </dd>
          </div>
        </dl>
      </DashboardCard>

      <DashboardCard className="motion-safe:animate-pte-fade-up">
        <h2 className="text-base font-semibold text-[var(--ink-primary)]">
          {t("tenant.examDetails.schedule", "Schedule")}
        </h2>
        <dl className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
              {t("tenant.examDetails.opensAt", "Opens at")}
            </dt>
            <dd className="mt-2 text-sm font-medium text-[var(--ink-primary)]">
              {formatDateTime(session.opensAt, locale)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
              {t("tenant.examDetails.closesAt", "Closes at")}
            </dt>
            <dd className="mt-2 text-sm font-medium text-[var(--ink-primary)]">
              {formatDateTime(session.closesAt, locale)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
              {t("tenant.examDetails.capacity", "Capacity")}
            </dt>
            <dd className="mt-2 text-sm font-medium text-[var(--ink-primary)]">{session.capacity}</dd>
          </div>
        </dl>
      </DashboardCard>
    </div>
  );
};

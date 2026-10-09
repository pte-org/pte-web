"use client";

import { useState, type ReactElement } from "react";
import { Alert, Badge, Button, DashboardCard, useLocale } from "@pte/ui";
import {
  EXAM_MODE_LABELS,
  EXAM_SKILL_OPTIONS,
  SESSION_DETAIL_TEXT,
  SESSION_STATUS_VARIANT,
} from "../constants";
import type { ExamSession } from "../types";
import { getExamPolicyLabel } from "../utils/examPolicy";

export interface ExamOverviewLifecycle {
  lifecycleError: string | undefined;
  onOpen: () => void;
  onClose: () => void;
  onCancel: () => void;
  canOpen: boolean;
  canClose: boolean;
  canCancel: boolean;
  openPending: boolean;
  closePending: boolean;
  cancelPending: boolean;
}

interface ExamOverviewTabProps {
  session: ExamSession;
  lifecycle: ExamOverviewLifecycle;
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

export const ExamOverviewTab = ({ session, lifecycle }: ExamOverviewTabProps): ReactElement => {
  const { locale, t } = useLocale();
  const [copyState, setCopyState] = useState<"copied" | "failed" | null>(null);

  const copySessionCode = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(session.sessionCode);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  };

  const modeLabel = session.examMode
    ? t(
        session.examMode === "PRACTICE"
          ? "tenant.createExam.MODE_PRACTICE"
          : "tenant.createExam.MODE_REAL",
        EXAM_MODE_LABELS[session.examMode],
      )
    : t("tenant.examDetails.legacyMode", T.LEGACY_MODE);
  const skillsLabel =
    session.selectedSkills.length > 0
      ? session.selectedSkills
          .map((skill) => {
            const fallback =
              EXAM_SKILL_OPTIONS.find((option) => option.value === skill)?.label ?? skill;
            return t(`tenant.createExam.skill.${skill}`, fallback);
          })
          .join(", ")
      : t("tenant.examDetails.legacySkills", T.LEGACY_SKILLS);
  const retries = session.maxRetriesPerStudent;
  const totalAttempts = retries + 1;
  const retriesLabel = t("tenant.examDetails.totalAttempts", T.TOTAL_ATTEMPTS(retries), {
    retries,
    total: totalAttempts,
    retriesLabel: retries === 1 ? "retry" : "retries",
    attemptLabel: totalAttempts === 1 ? "attempt" : "attempts",
  });
  const statusLabel = t(`tenant.examStatus.${session.status.toLowerCase()}`, session.status);
  const hasLifecycleActions = lifecycle.canOpen || lifecycle.canClose || lifecycle.canCancel;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <DashboardCard className="motion-safe:animate-pte-fade-up">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
                {t("tenant.examDetails.examCode", T.SESSION_CODE_SECTION)}
              </p>
              <code className="mt-3 block break-all rounded-lg bg-[var(--surface-subtle)] px-3 py-2 text-sm text-[var(--ink-primary)]">
                {session.sessionCode}
              </code>
            </div>
            <Button size="sm" variant="secondary" onClick={() => void copySessionCode()}>
              {t("tenant.examDetails.copyCode", T.COPY_SESSION_CODE)}
            </Button>
          </div>
          {copyState === "copied" && (
            <p role="status" className="mt-3 text-xs text-[var(--mint-action)]">
              {t("tenant.examDetails.codeCopied", T.SESSION_CODE_COPIED)}
            </p>
          )}
          {copyState === "failed" && (
            <p role="alert" className="mt-3 text-xs text-[var(--blush-action)]">
              {t("tenant.examDetails.codeCopyFailed", T.SESSION_CODE_COPY_FAILED)}
            </p>
          )}
        </DashboardCard>

        <DashboardCard className="motion-safe:animate-pte-fade-up">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
                {t("tenant.examOverview.status", "Status")}
              </p>
              <p className="mt-2 text-sm text-[var(--ink-secondary)]">
                {t("tenant.examDetails.mode", T.MODE_LABEL)}
              </p>
              <p className="mt-1 text-base font-semibold text-[var(--ink-primary)]">{modeLabel}</p>
            </div>
            <Badge variant={SESSION_STATUS_VARIANT[session.status]}>{statusLabel}</Badge>
          </div>
          <div className="mt-4 border-t border-[var(--divider)] pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
              {t("tenant.examDetails.examWindow", "Exam window")}
            </p>
            <p className="mt-2 text-sm text-[var(--ink-primary)]">
              {formatDateTime(session.opensAt, locale)}
              <span className="px-2 text-[var(--ink-muted)]">—</span>
              {formatDateTime(session.closesAt, locale)}
            </p>
          </div>
        </DashboardCard>
      </div>

      {(hasLifecycleActions || lifecycle.lifecycleError) && (
        <DashboardCard className="motion-safe:animate-pte-fade-up">
          <div className="flex flex-wrap items-center gap-3">
            {lifecycle.canOpen && (
              <Button
                size="sm"
                variant="primary"
                onClick={lifecycle.onOpen}
                isLoading={lifecycle.openPending}
              >
                {t("tenant.examOverview.open", "Open exam")}
              </Button>
            )}
            {lifecycle.canClose && (
              <Button
                size="sm"
                variant="secondary"
                onClick={lifecycle.onClose}
                isLoading={lifecycle.closePending}
              >
                {t("tenant.examOverview.close", "Close exam")}
              </Button>
            )}
            {lifecycle.canCancel && (
              <Button
                size="sm"
                variant="danger"
                onClick={lifecycle.onCancel}
                isLoading={lifecycle.cancelPending}
              >
                {t("tenant.examOverview.cancel", "Cancel exam")}
              </Button>
            )}
          </div>
          {lifecycle.lifecycleError && (
            <div role="alert" className="mt-3">
              <Alert tone="error">{lifecycle.lifecycleError}</Alert>
            </div>
          )}
        </DashboardCard>
      )}

      <DashboardCard className="motion-safe:animate-pte-fade-up">
        <dl className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
              {t("tenant.examDetails.skillsIncluded", T.SKILLS_LABEL)}
            </dt>
            <dd className="mt-2 text-sm font-medium text-[var(--ink-primary)]">{skillsLabel}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
              {t("tenant.examDetails.retriesPerStudent", T.RETRIES_LABEL)}
            </dt>
            <dd className="mt-2 text-sm font-medium text-[var(--ink-primary)]">{retriesLabel}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
              {t("tenant.examDetails.capacity", "Capacity")}
            </dt>
            <dd className="mt-2 text-sm font-medium text-[var(--ink-primary)]">
              {session.capacity}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
              {t("tenant.examDetails.securityPolicy", T.SECURITY_POLICY_LABEL)}
            </dt>
            <dd className="mt-2 text-sm font-medium text-[var(--ink-primary)]">
              {getExamPolicyLabel(session.examMode, session.policy?.lockdownMode, t)}
            </dd>
          </div>
        </dl>
      </DashboardCard>
    </div>
  );
};

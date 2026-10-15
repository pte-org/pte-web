"use client";

import type { ReactElement } from "react";
import { Alert, LoadingState, useLocale } from "@pte/ui";
import { useAttemptReport } from "../api/attemptReport";
import { ATTEMPT_SCORE_TEXT as T } from "../constants/attemptReviews";

interface AttemptScoreSummaryProps {
  attemptPublicId: string;
}

interface ScoreCardProps {
  label: string;
  score: number | null;
  sufficient: boolean;
  insufficientLabel: string;
}

const ScoreCard = ({ label, score, sufficient, insufficientLabel }: ScoreCardProps): ReactElement => (
  <div className="rounded-md bg-[var(--surface-subtle)] p-4">
    <div className="text-xs font-medium uppercase tracking-wide text-[var(--ink-secondary)]">
      {label}
    </div>
    <div className="mt-2 text-2xl font-semibold text-[var(--ink-primary)]">
      {sufficient && score !== null ? score : T.NO_SCORE}
    </div>
    {!sufficient && <div className="mt-1 text-xs text-[var(--ink-muted)]">{insufficientLabel}</div>}
  </div>
);

/** One student's overall and per-skill scores, shown above the answers of that attempt. */
export const AttemptScoreSummary = ({ attemptPublicId }: AttemptScoreSummaryProps): ReactElement => {
  const { t } = useLocale();
  const { data: report, isLoading, isError } = useAttemptReport(attemptPublicId);

  const skillLabel = (skill: string): string =>
    t(`tenant.attemptScore.skill.${skill}`, T.SKILL_LABELS[skill] ?? skill);
  const insufficientLabel = t("tenant.attemptScore.insufficient", T.INSUFFICIENT);

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-[var(--ink-primary)]">
          {t("tenant.attemptScore.title", T.TITLE)}
        </h3>
        {report && !report.published && (
          <span className="text-xs font-medium text-[var(--ink-secondary)]">
            {t("tenant.attemptScore.provisional", T.PROVISIONAL)}
          </span>
        )}
      </div>
      {isLoading && <LoadingState rows={1} />}
      {isError && <Alert tone="error">{t("tenant.attemptScore.error", T.ERROR)}</Alert>}
      {report && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {report.overall && (
            <ScoreCard
              label={t("tenant.attemptScore.overall", T.OVERALL)}
              score={report.overall.score}
              sufficient={report.overall.sufficientData}
              insufficientLabel={insufficientLabel}
            />
          )}
          {report.communicativeSkills.map((skill) => (
            <ScoreCard
              key={skill.skill}
              label={skillLabel(skill.skill)}
              score={skill.score}
              sufficient={skill.sufficientData}
              insufficientLabel={insufficientLabel}
            />
          ))}
        </div>
      )}
      {report?.includesUnselectedAiScores && (
        <p className="text-xs text-[var(--ink-secondary)]">
          {t("tenant.attemptScore.unselectedAiNote", T.UNSELECTED_AI_NOTE)}
        </p>
      )}
      {report && !report.overall && (
        <p className="text-xs text-[var(--ink-secondary)]">
          {t("tenant.attemptScore.overallNote", T.OVERALL_NOTE)}
        </p>
      )}
    </section>
  );
};

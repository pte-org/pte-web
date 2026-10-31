"use client";

import type { ReactElement } from "react";
import { DashboardCard, useLocale } from "@pte/ui";
import { SESSION_DETAIL_TEXT } from "../constants";
import { AttemptsSection } from "./AttemptsSection";
import { ReportPublicationPanel } from "./ReportPublicationPanel";
import { ReportPublicationStatusChip } from "./ReportPublicationStatusChip";
import { ScoringOverviewPanel } from "./ScoringOverviewPanel";
import { StartAiScoringButton } from "./StartAiScoringButton";

interface ExamSubmissionsTabProps {
  sessionPublicId: string;
  sessionStatus: string;
}

export const ExamSubmissionsTab = ({
  sessionPublicId,
  sessionStatus,
}: ExamSubmissionsTabProps): ReactElement => {
  const { t } = useLocale();
  return (
    <div className="flex flex-col gap-5">
      <ReportPublicationStatusChip
        sessionPublicId={sessionPublicId}
        sessionStatus={sessionStatus}
      />
      <DashboardCard className="motion-safe:animate-pte-fade-up">
        <h2 className="text-base font-semibold text-[var(--ink-primary)]">
          {t("tenant.answers.sectionTitle", SESSION_DETAIL_TEXT.ANSWERS_SECTION)}
        </h2>
        <div className="mt-5 flex flex-col gap-4">
          <ScoringOverviewPanel sessionPublicId={sessionPublicId} />
          <StartAiScoringButton sessionPublicId={sessionPublicId} />
          <AttemptsSection sessionPublicId={sessionPublicId} />
        </div>
      </DashboardCard>
      <ReportPublicationPanel sessionPublicId={sessionPublicId} sessionStatus={sessionStatus} />
    </div>
  );
};

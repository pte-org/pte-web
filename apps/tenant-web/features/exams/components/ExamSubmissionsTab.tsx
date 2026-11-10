"use client";

import type { ReactElement } from "react";
import { DashboardCard } from "@pte/ui";
import { AttemptsSection } from "./AttemptsSection";
import { ReportPublicationPanel } from "./ReportPublicationPanel";
import { ScoringOverviewPanel } from "./ScoringOverviewPanel";

interface ExamSubmissionsTabProps {
  sessionPublicId: string;
  sessionStatus: string;
}

export const ExamSubmissionsTab = ({
  sessionPublicId,
  sessionStatus,
}: ExamSubmissionsTabProps): ReactElement => {
  return (
    <div className="flex flex-col gap-5">
      <DashboardCard className="motion-safe:animate-pte-fade-up">
        <div className="flex flex-col gap-4">
          <ScoringOverviewPanel sessionPublicId={sessionPublicId} />
          <AttemptsSection sessionPublicId={sessionPublicId} />
        </div>
      </DashboardCard>
      <ReportPublicationPanel sessionPublicId={sessionPublicId} sessionStatus={sessionStatus} />
    </div>
  );
};

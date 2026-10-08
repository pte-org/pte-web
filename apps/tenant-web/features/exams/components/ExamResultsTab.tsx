"use client";

import type { ReactElement } from "react";
import { HostScoreReviewPanel } from "./HostScoreReviewPanel";
import { ReportPublicationPanel } from "./ReportPublicationPanel";
import { GradingCohortSection } from "./GradingCohortSection";

interface ExamResultsTabProps {
  sessionPublicId: string;
  sessionStatus: string;
}

export const ExamResultsTab = ({
  sessionPublicId,
  sessionStatus,
}: ExamResultsTabProps): ReactElement => (
  <div className="flex flex-col gap-5 motion-safe:animate-pte-fade-up">
    <HostScoreReviewPanel sessionPublicId={sessionPublicId} />
    <GradingCohortSection sessionPublicId={sessionPublicId} sessionStatus={sessionStatus} />
    <ReportPublicationPanel sessionPublicId={sessionPublicId} sessionStatus={sessionStatus} />
  </div>
);

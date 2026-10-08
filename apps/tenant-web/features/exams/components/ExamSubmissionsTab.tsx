"use client";

import type { ReactElement } from "react";
import { DashboardCard } from "@pte/ui";
import { SESSION_DETAIL_TEXT } from "../constants";
import { AnswersSection } from "./AnswersSection";

interface ExamSubmissionsTabProps {
  sessionPublicId: string;
}

export const ExamSubmissionsTab = ({ sessionPublicId }: ExamSubmissionsTabProps): ReactElement => (
  <DashboardCard className="motion-safe:animate-pte-fade-up">
    <h2 className="text-base font-semibold text-[var(--ink-primary)]">
      {SESSION_DETAIL_TEXT.ANSWERS_SECTION}
    </h2>
    <div className="mt-5">
      <AnswersSection sessionPublicId={sessionPublicId} />
    </div>
  </DashboardCard>
);

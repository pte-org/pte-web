"use client";

import type { ReactElement } from "react";
import { ExaminerAssignmentSection } from "./ExaminerAssignmentSection";

interface ExaminerTabProps {
  sessionPublicId: string;
  sessionStatus: string;
}

export const ExaminerTab = ({ sessionPublicId, sessionStatus }: ExaminerTabProps): ReactElement => (
  <div className="motion-safe:animate-pte-fade-up">
    <ExaminerAssignmentSection sessionPublicId={sessionPublicId} sessionStatus={sessionStatus} />
  </div>
);

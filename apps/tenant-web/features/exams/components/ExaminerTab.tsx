"use client";

import type { ReactElement } from "react";
import { ExaminerAssignmentSection } from "./ExaminerAssignmentSection";

interface ExaminerTabProps {
  sessionPublicId: string;
}

export const ExaminerTab = ({ sessionPublicId }: ExaminerTabProps): ReactElement => (
  <div className="motion-safe:animate-pte-fade-up">
    <ExaminerAssignmentSection sessionPublicId={sessionPublicId} />
  </div>
);

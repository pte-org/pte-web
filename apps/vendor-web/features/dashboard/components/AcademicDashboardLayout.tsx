"use client";

import type { ReactElement } from "react";
import type { AdminDashboardResponse } from "@pte/api-client";
import { QuestionBankPanel } from "./QuestionBankPanel";

export interface AcademicDashboardLayoutProps {
  dashboard: AdminDashboardResponse;
  onRetry: () => void;
}

/**
 * Compact content-only overview rendered for academic management/staff roles.
 * Omits all operational tenant and billing widgets.
 */
export const AcademicDashboardLayout = ({
  dashboard,
  onRetry,
}: AcademicDashboardLayoutProps): ReactElement => {
  return (
    <div className="flex flex-col gap-6">
      <QuestionBankPanel section={dashboard.questionBank} onRetry={onRetry} />
    </div>
  );
};

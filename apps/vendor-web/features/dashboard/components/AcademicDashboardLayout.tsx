"use client";

import type { ReactElement } from "react";
import type { AdminDashboardResponse, CurrentUser } from "@pte/api-client";
import { AdminDashboardHeader } from "./AdminDashboardHeader";
import { QuestionBankPanel } from "./QuestionBankPanel";

export interface AcademicDashboardLayoutProps {
  dashboard: AdminDashboardResponse;
  currentUser?: CurrentUser;
  onRetry: () => void;
}

/**
 * Compact content-only overview rendered for academic management/staff roles.
 * Omits all operational tenant and billing widgets.
 */
export const AcademicDashboardLayout = ({
  dashboard,
  currentUser,
  onRetry,
}: AcademicDashboardLayoutProps): ReactElement => {
  return (
    <div className="flex flex-col gap-6">
      <AdminDashboardHeader currentUser={currentUser} isAcademicOnly={true} />
      <QuestionBankPanel section={dashboard.questionBank} onRetry={onRetry} />
    </div>
  );
};

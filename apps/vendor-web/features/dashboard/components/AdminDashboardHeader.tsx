"use client";

import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Button, PageHeader } from "@pte/ui";
import type { CurrentUser } from "@pte/api-client";
import { ADMIN_DASHBOARD_ROUTES } from "../constants";
import { useAdminDashboardText } from "../hooks/useAdminDashboardText";
import { getGreeting } from "../utils/greeting";

export interface AdminDashboardHeaderProps {
  currentUser?: CurrentUser;
  isAcademicOnly?: boolean;
  onAddTenant?: () => void;
}

export const AdminDashboardHeader = ({
  currentUser,
  isAcademicOnly = false,
  onAddTenant,
}: AdminDashboardHeaderProps): ReactElement => {
  const router = useRouter();
  const { messages, format } = useAdminDashboardText();

  const greeting = getGreeting(currentUser?.fullName, undefined, messages.greetingFallbackUser);
  const title = format(greeting.key, { name: greeting.name });

  const actions = isAcademicOnly ? (
    <Button
      variant="primary"
      size="sm"
      onClick={() => router.push(ADMIN_DASHBOARD_ROUTES.questions)}
    >
      {messages.quickActionReviewQuestions}
    </Button>
  ) : (
    <div className="flex flex-wrap items-center gap-2">
      {onAddTenant && (
        <Button variant="primary" size="sm" onClick={onAddTenant}>
          + {messages.addTenant}
        </Button>
      )}
      <Button
        variant="secondary"
        size="sm"
        onClick={() => router.push(ADMIN_DASHBOARD_ROUTES.applications)}
      >
        {messages.quickActionViewApplications}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => router.push(ADMIN_DASHBOARD_ROUTES.supportTickets)}
      >
        {messages.quickActionViewTickets}
      </Button>
    </div>
  );

  return <PageHeader title={title} actions={actions} />;
};

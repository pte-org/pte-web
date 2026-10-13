"use client";

import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Button, PageHeader } from "@pte/ui";
import { HOST_DASHBOARD_ROUTES } from "../constants";
import { useHostDashboardText } from "../hooks/useHostDashboardText";

/** Page title with the quick actions; each one opens an existing screen where the work is done. */
export const HostDashboardHeader = (): ReactElement => {
  const { messages } = useHostDashboardText();
  const router = useRouter();

  return (
    <PageHeader
      title={messages.title}
      actions={
        <>
          <Button onClick={() => router.push(HOST_DASHBOARD_ROUTES.students)}>{messages.quickAddLearners}</Button>
          <Button variant="secondary" onClick={() => router.push(HOST_DASHBOARD_ROUTES.exams)}>
            {messages.quickCreateExam}
          </Button>
          <Button variant="secondary" onClick={() => router.push(HOST_DASHBOARD_ROUTES.billing)}>
            {messages.quickBilling}
          </Button>
        </>
      }
    />
  );
};

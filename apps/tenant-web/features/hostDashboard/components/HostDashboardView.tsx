"use client";

import type { ReactElement } from "react";
import { getUserFacingApiErrorMessage } from "@pte/api-client";
import { Button, DashboardLoadingState, ErrorState } from "@pte/ui";
import { LearnersOverview } from "@/features/examoperations/components";
import { useHostDashboard } from "../api";
import { useHostDashboardText } from "../hooks/useHostDashboardText";
import { HostDashboardGrid } from "./HostDashboardGrid";
import { HostDashboardHeader } from "./HostDashboardHeader";

/**
 * Host overview: header, the dashboard widgets from the single aggregate request and, last and
 * full width, the learners roster (it keeps its own request).
 */
export const HostDashboardView = (): ReactElement => {
  const { messages } = useHostDashboardText();
  const { data, error, isPending, isFetching, refetch } = useHostDashboard();
  const onRetry = (): void => {
    void refetch();
  };

  return (
    <div className="flex flex-col gap-6">
      <HostDashboardHeader />
      {isPending ? (
        <DashboardLoadingState variant="overview" label={messages.loadingLabel} />
      ) : data ? (
        <HostDashboardGrid dashboard={data} onRetry={onRetry} />
      ) : (
        <ErrorState
          title={messages.errorTitle}
          description={getUserFacingApiErrorMessage(error, messages.errorDescription)}
          action={
            <Button variant="danger" appearance="outline" isLoading={isFetching} onClick={onRetry}>
              {messages.retry}
            </Button>
          }
        />
      )}
      <LearnersOverview />
    </div>
  );
};

"use client";

import type { ReactElement } from "react";
import { getUserFacingApiErrorMessage } from "@pte/api-client";
import { Button, DashboardLoadingState, ErrorState } from "@pte/ui";
import { useHostDashboard } from "../api";
import { useHostDashboardText } from "../hooks/useHostDashboardText";
import { HostDashboardGrid } from "./HostDashboardGrid";

/**
 * Host overview: dashboard widgets from the single aggregate request.
 */
export const HostDashboardView = (): ReactElement => {
  const { messages } = useHostDashboardText();
  const { data, error, isPending, isFetching, refetch } = useHostDashboard();
  const onRetry = (): void => {
    void refetch();
  };

  return (
    <div className="flex flex-col gap-6">
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
    </div>
  );
};

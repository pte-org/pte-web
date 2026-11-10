"use client";

import { useCallback, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import type { ProctorScope } from "@pte/api-client";
import { PageHeader } from "@pte/ui";
import { useProctorWorkspaceOverview } from "../api";
import { useClientTimezone, useMidnightBoundaryRefresh } from "../hooks/useClientTimezone";
import { useProctorWorkspaceText } from "../hooks/useProctorWorkspaceText";
import { PROCTOR_QUERY_KEYS } from "../queryKeys";
import { ProctorPrioritySessions } from "./ProctorPrioritySessions";
import { ProctorWorkspaceOverview } from "./ProctorWorkspaceOverview";

export const ProctorOverviewView = (): ReactElement => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const text = useProctorWorkspaceText();
  const { timezone, isResolved } = useClientTimezone();
  const overviewQuery = useProctorWorkspaceOverview(timezone);
  const handleMidnight = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: PROCTOR_QUERY_KEYS.all });
  }, [queryClient]);

  useMidnightBoundaryRefresh({
    dayEnd: overviewQuery.data?.dayEnd,
    timezone,
    onMidnight: handleMidnight,
  });

  const handleSelectScope = useCallback(
    (scope: ProctorScope) => router.push(`/proctor/sessions?scope=${scope}`),
    [router],
  );

  return (
    <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader title={text.overviewTitle} />
      <ProctorWorkspaceOverview
        counts={overviewQuery.data?.counts}
        asOf={overviewQuery.data?.asOf}
        timezone={overviewQuery.data?.timezone ?? timezone ?? undefined}
        isLoading={overviewQuery.isLoading || !isResolved}
        isError={overviewQuery.isError}
        onRetry={() => void overviewQuery.refetch()}
        selectedScope="ALL"
        onSelectScope={handleSelectScope}
      />
      {!overviewQuery.isError && (
        <ProctorPrioritySessions
          sessions={overviewQuery.data?.prioritySessions ?? []}
          timezone={overviewQuery.data?.timezone ?? timezone ?? undefined}
          isLoading={overviewQuery.isLoading || !isResolved}
          onViewToday={() => handleSelectScope("TODAY")}
        />
      )}
    </div>
  );
};

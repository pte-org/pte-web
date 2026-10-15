"use client";

import { useCallback, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import type { ExaminerQueueStatus } from "@pte/api-client";
import { PageHeader } from "@pte/ui";
import { useExaminerOverview } from "./api";
import { ExaminerPriorityWork } from "./components/ExaminerPriorityWork";
import { ExaminerWorkspaceOverview } from "./components/ExaminerWorkspaceOverview";
import { useExaminerWorkspaceText } from "./hooks/useExaminerWorkspaceText";

export const ExaminerOverviewView = (): ReactElement => {
  const router = useRouter();
  const text = useExaminerWorkspaceText();
  const overview = useExaminerOverview();

  const handleSelectStatus = useCallback(
    (status: ExaminerQueueStatus): void => {
      router.push(`/examiner/work?status=${status}`);
    },
    [router],
  );

  const handleOpenAttempt = useCallback(
    (sessionPublicId: string, attemptPublicId: string): void => {
      router.push(`/examiner/work/${sessionPublicId}/${attemptPublicId}`);
    },
    [router],
  );

  return (
    <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title={text.overviewTitle}
        subtitle={text.overviewSubtitle}
      />

      <ExaminerWorkspaceOverview
        counts={overview.data?.counts}
        progress={overview.data?.progress}
        asOf={overview.data?.asOf}
        isLoading={overview.isLoading}
        isError={overview.isError}
        error={overview.error}
        onRetry={() => void overview.refetch()}
        selectedStatus="ALL"
        onSelectStatus={handleSelectStatus}
        onRefresh={() => void overview.refetch()}
      />

      <ExaminerPriorityWork
        items={overview.data?.priorityItems ?? overview.data?.priorityQueue ?? []}
        isLoading={overview.isLoading}
        onOpenAttempt={handleOpenAttempt}
      />
    </div>
  );
};

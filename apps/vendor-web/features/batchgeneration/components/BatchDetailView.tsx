"use client";

import type { ReactElement } from "react";
import { usePathname } from "next/navigation";
import { Alert, DashboardLoadingState, useDashboardBreadcrumbLabel } from "@pte/ui";
import { useBatchQuestions, useQuestionGenerationBatch } from "../api";
import { useBatchMessages } from "../messages/useBatchMessages";
import { batchErrorMessage } from "../utils/batchError";
import { BatchDetailContent } from "./_BatchDetailContent";

interface BatchDetailViewProps {
  batchId: string;
}

/** One batch: progress, lanes and jobs on the left; the job being watched (or the results) on the right. */
export const BatchDetailView = ({ batchId }: BatchDetailViewProps): ReactElement => {
  const messages = useBatchMessages();
  const pathname = usePathname();
  const { data: batch, isLoading, error } = useQuestionGenerationBatch(batchId);
  const { data: slots = [] } = useBatchQuestions(batchId, batch);
  useDashboardBreadcrumbLabel(pathname, batch ? messages.detailTitle : undefined);

  if (isLoading) return <DashboardLoadingState variant="table" />;
  if (error || !batch) {
    return <Alert tone="error">{batchErrorMessage(error, messages, "detailLoadError")}</Alert>;
  }
  return <BatchDetailContent batch={batch} slots={slots} messages={messages} />;
};

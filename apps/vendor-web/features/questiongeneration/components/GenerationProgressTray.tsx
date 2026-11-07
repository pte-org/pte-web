"use client";

import { useMemo, useState } from "react";
import { useGenerationPolling } from "../hooks/useGenerationPolling";
import { generationMessages } from "../messages/en";
import { useCancelQuestionGenerationJob } from "../api";
import {
  DashboardPanel,
  StepTimeline,
  ConfirmDialog,
  Button,
  useToast,
} from "@pte/ui";
import type { Step } from "@pte/ui";
import type {
  QuestionGenerationJobResponse,
  QuestionGenerationItemResponse,
} from "@pte/api-client";
import { getFailureReasonTranslation } from "../utils/failureCodeTranslator";

interface GenerationProgressTrayProps {
  jobId: string | null;
  onJobComplete?: (job: QuestionGenerationJobResponse) => void;
  onReviewClick?: (jobId: string) => void;
}

/**
 * Collapsible tray showing current generation job progress
 * Displays overall progress bar, item-level steps, and action buttons
 */
export const GenerationProgressTray = ({
  jobId,
  onJobComplete,
  onReviewClick,
}: GenerationProgressTrayProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const { job, isLoading, error } = useGenerationPolling(jobId, {
    onComplete: (status) => {
      if (status === "COMPLETED" && job) {
        onJobComplete?.(job);
      }
    },
  });

  const { mutate: cancelJob, isPending: isCancelling } = useCancelQuestionGenerationJob();
  const { showToast } = useToast();

  if (!job) {
    return null;
  }

  const isComplete = ["COMPLETED", "FAILED", "CANCELLED"].includes(job.status);
  const progress = Math.round(
    ((job.succeededCount + job.failedCount) / job.requestedCount) * 100,
  );

  const itemSteps: Step[] = useMemo(
    () =>
      job.items.map((item) => ({
        id: `item-${item.index}`,
        label: `Question ${item.index + 1}`,
        status:
          item.stage === "FAILED"
            ? "failed"
            : item.stage === "SAVED"
              ? "done"
              : item.stage === "QUEUED"
                ? "pending"
                : "active",
        failureReason:
          item.failureCode && item.stage === "FAILED"
            ? getFailureReasonTranslation(item.failureCode)
            : null,
      })),
    [job.items],
  );

  const handleCancel = (): void => {
    if (jobId) {
      cancelJob(jobId, {
        onSuccess: () => {
          showToast("Generation cancelled");
          setShowCancelConfirm(false);
        },
      });
    }
  };

  return (
    <>
      <DashboardPanel
        title={`${generationMessages.generatingTitle}: ${job.taskType}`}
      >
        <div className="space-y-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            type="button"
            className="text-sm text-gray-600 hover:text-gray-900 mb-2"
          >
            {isExpanded
              ? generationMessages.collapseButton
              : generationMessages.expandButton}
          </button>

          {isExpanded && (
            <div className="space-y-4">
              {/* Overall Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">
                    {job.succeededCount} ✓ {job.failedCount} ✗
                  </span>
                  <span className="text-sm text-gray-600">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      job.status === "FAILED" ? "bg-red-500" : "bg-green-500"
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Item Steps Timeline */}
              <StepTimeline
                steps={itemSteps}
                orientation="horizontal"
                showFailureReasons={true}
              />

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t">
                {!isComplete && (
                  <Button
                    onClick={() => setShowCancelConfirm(true)}
                    size="sm"
                    disabled={isCancelling}
                  >
                    {generationMessages.cancelGenerationButton}
                  </Button>
                )}
                {isComplete && job.succeededCount > 0 && (
                  <Button
                    onClick={() => onReviewClick?.(jobId || "")}
                    size="sm"
                  >
                    {generationMessages.reviewQuestionsButton.replace(
                      "{count}",
                      String(job.succeededCount),
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DashboardPanel>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        open={showCancelConfirm}
        title={generationMessages.cancelConfirmTitle}
        description={generationMessages.cancelConfirmMessage}
        confirmLabel={generationMessages.cancelConfirmButton}
        cancelLabel={generationMessages.cancelCancelButton}
        tone="warning"
        isConfirming={isCancelling}
        onConfirm={handleCancel}
        onClose={() => setShowCancelConfirm(false)}
      />
    </>
  );
};

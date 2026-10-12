"use client";

import type { ReactElement } from "react";
import type { ExaminerQueueItemResponse } from "@pte/api-client";
import { Badge, Button, Skeleton } from "@pte/ui";
import { useExaminerWorkspaceText } from "../hooks/useExaminerWorkspaceText";

export interface ExaminerPriorityWorkProps {
  items: ExaminerQueueItemResponse[];
  isLoading: boolean;
  onOpenAttempt: (sessionPublicId: string, attemptPublicId: string) => void;
}

function shortId(value: string): string {
  return value.slice(0, 8).toUpperCase();
}

export function ExaminerPriorityWork({
  items,
  isLoading,
  onOpenAttempt,
}: ExaminerPriorityWorkProps): ReactElement {
  const text = useExaminerWorkspaceText();

  const priorityItems = items.slice(0, 5);

  const getBlockingText = (reason: string | null | undefined): string => {
    if (!reason) return "";
    if (reason === "WAITING_FOR_HOST_FREEZE") {
      return text.waitingForHostFreeze;
    }
    return `${text.blockedReasonPrefix}${reason}`;
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-base font-semibold text-slate-900">{text.priorityTitle}</h3>
        <p className="text-xs text-slate-500">{text.prioritySubtitle}</p>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : priorityItems.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
            {text.priorityEmpty}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {priorityItems.map((item) => {
              const isZeroEligible = item.eligibleAnswerCount === 0;
              const isActionable = !isZeroEligible;
              const blockingLabel = getBlockingText(item.blockingReason);

              return (
                <div
                  key={`${item.sessionPublicId}:${item.attemptPublicId}`}
                  className="flex flex-col justify-between gap-3 py-3.5 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-slate-900">
                        {text.attemptLabel} #{shortId(item.attemptPublicId)}
                      </span>
                      {item.status === "IN_PROGRESS" ? (
                        <Badge variant="warning">{text.statusInProgress}</Badge>
                      ) : item.status === "COMPLETED" ? (
                        <Badge variant="success">{text.statusCompleted}</Badge>
                      ) : (
                        <Badge variant="neutral">{text.statusPending}</Badge>
                      )}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>
                        {text.sessionLabel} #{shortId(item.sessionPublicId)}
                      </span>
                      <span>
                        {text.progressLabel}: {item.submittedAnswerCount}/{item.eligibleAnswerCount}
                      </span>
                      {isZeroEligible && (
                        <span className="text-slate-400 italic">{text.noEligibleWork}</span>
                      )}
                      {blockingLabel && (
                        <span className="text-amber-700 font-medium">{blockingLabel}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isActionable ? (
                      <Button
                        variant={item.status === "IN_PROGRESS" ? "primary" : "secondary"}
                        size="sm"
                        onClick={() => onOpenAttempt(item.sessionPublicId, item.attemptPublicId)}
                      >
                        {item.status === "IN_PROGRESS"
                          ? text.continueMarking
                          : text.startMarking}
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-400">{text.noEligibleWork}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

import type { ReactElement } from "react";
import { useLocale } from "@pte/ui";
import { taskTypeLabel } from "@/features/hostTemplates/utils/taskTypeLabel";
import type { SupportTicketDetail } from "../types";

interface ReportedQuestionProps {
  ticket: SupportTicketDetail;
}

/** The question a content complaint is about; hidden for any other ticket. */
export const ReportedQuestion = ({ ticket }: ReportedQuestionProps): ReactElement | null => {
  const { t } = useLocale();
  if (ticket.entityType !== "QUESTION" || !ticket.entityId) return null;

  const context = ticket.entityContext;
  return (
    <div className="mt-4 border-t border-[var(--shell-border)] pt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
        {t("tenant.support.reportedQuestion", "Reported question")}
      </p>
      <div className="mt-2 rounded-lg border border-[var(--shell-border)] p-3 text-sm">
        {context ? (
          <>
            {context.taskTypeKey && (
              <span className="font-medium text-[var(--ink-primary)]">{taskTypeLabel(context.taskTypeKey)}</span>
            )}
            {context.promptSnippet && (
              <span className="mt-1 block whitespace-pre-wrap text-[var(--ink-secondary)]">
                {context.promptSnippet}
              </span>
            )}
          </>
        ) : (
          <span className="text-[var(--ink-muted)]">
            {t("tenant.support.questionUnavailable", "This question no longer exists.")}
          </span>
        )}
      </div>
    </div>
  );
};

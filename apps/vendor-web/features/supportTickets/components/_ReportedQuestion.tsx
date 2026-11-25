import type { ReactElement } from "react";
import Link from "next/link";
import { ADMIN_TICKET_DETAIL_TEXT as RAW_ADMIN_TICKET_DETAIL_TEXT } from "../constants";
import type { SupportTicketDetail } from "../types";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { taskTypeLabel } from "@/features/questionbank/components/_questionTableColumns";

interface ReportedQuestionProps {
  ticket: SupportTicketDetail;
}

/** The question a content complaint is about, linking to it in the question bank; hidden for other tickets. */
export const ReportedQuestion = ({ ticket }: ReportedQuestionProps): ReactElement | null => {
  const T = useAdminCopy(RAW_ADMIN_TICKET_DETAIL_TEXT);
  if (ticket.entityType !== "QUESTION" || !ticket.entityId) return null;

  const context = ticket.entityContext;
  return (
    <div className="mt-4">
      <dt className="text-sm font-medium text-gray-600">{T.REPORTED_QUESTION_LABEL}</dt>
      <dd className="mt-1">
        {context ? (
          <Link
            href={`/admin/questions/${ticket.entityId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg border border-gray-200 p-3 text-sm hover:bg-gray-50"
          >
            {context.taskTypeKey && (
              <span className="font-medium text-gray-900">{taskTypeLabel(context.taskTypeKey)}</span>
            )}
            {context.promptSnippet && (
              <span className="mt-1 block whitespace-pre-wrap text-gray-700">{context.promptSnippet}</span>
            )}
            <span className="mt-2 block text-xs font-medium text-blue-600">{T.OPEN_IN_QUESTION_BANK} →</span>
          </Link>
        ) : (
          <span className="text-sm text-gray-500">{T.QUESTION_UNAVAILABLE}</span>
        )}
      </dd>
    </div>
  );
};

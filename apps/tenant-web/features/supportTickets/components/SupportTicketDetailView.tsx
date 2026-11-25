"use client";

import { usePathname } from "next/navigation";

import type { ReactElement } from "react";
import { Alert, LoadingState, useDashboardBreadcrumbLabel, useLocale } from "@pte/ui";
import { SUPPORT_TICKETS_TEXT as T, SUPPORT_TICKET_BREADCRUMB_ID_LENGTH } from "../constants";
import { taskTypeLabel } from "@/features/hostTemplates/utils/taskTypeLabel";
import { useSupportTicket } from "../api";
import { TicketCategoryBadge } from "./_TicketCategoryBadge";
import { TicketStatusBadge } from "./_TicketStatusBadge";
import { NoteThread } from "./_NoteThread";

interface SupportTicketDetailViewProps {
  ticketPublicId: string;
}

export const SupportTicketDetailView = ({
  ticketPublicId,
}: SupportTicketDetailViewProps): ReactElement => {
  const { data: ticket, isLoading, isError } = useSupportTicket(ticketPublicId);
  const pathname = usePathname();
  const { locale, t } = useLocale();
  useDashboardBreadcrumbLabel(pathname, ticket ? t("common.supportTicketBreadcrumb", undefined,
    { id: ticket.publicId.slice(0, SUPPORT_TICKET_BREADCRUMB_ID_LENGTH).toUpperCase() }) : undefined);

  if (isLoading) return <LoadingState rows={6} />;
  if (isError || !ticket) {
    return <Alert tone="error">{t("tenant.support.detail.loadFailed", "Failed to load ticket.")}</Alert>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-card">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {t("tenant.support.category", "Category")}
            </dt>
            <dd className="mt-1">
              <TicketCategoryBadge category={ticket.category} />
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {t("tenant.support.status", "Status")}
            </dt>
            <dd className="mt-1">
              <TicketStatusBadge status={ticket.status} />
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {t("tenant.support.description", "Description")}
            </dt>
            <dd className="mt-1 text-sm text-gray-800">{ticket.description}</dd>
          </div>
          {ticket.entityType === "QUESTION" && ticket.entityId && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {t("tenant.support.reportedQuestion", "Reported question")}
              </dt>
              <dd className="mt-1 rounded-lg border border-gray-200 p-3 text-sm">
                {ticket.entityContext ? (
                  <>
                    {ticket.entityContext.taskTypeKey && (
                      <span className="font-medium text-gray-900">
                        {taskTypeLabel(ticket.entityContext.taskTypeKey)}
                      </span>
                    )}
                    {ticket.entityContext.promptSnippet && (
                      <span className="mt-1 block whitespace-pre-wrap text-gray-700">
                        {ticket.entityContext.promptSnippet}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-gray-500">
                    {t("tenant.support.questionUnavailable", "This question no longer exists.")}
                  </span>
                )}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {t("tenant.support.submitted", T.CREATED_AT)}
            </dt>
            <dd className="mt-1 text-sm text-gray-700">
              {new Date(ticket.createdAt).toLocaleString(locale === "vi" ? "vi-VN" : "en-GB")}
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-900">{t("tenant.support.detail.notes", T.NOTES_SECTION)}</h2>
        <NoteThread notes={ticket.notes} />
      </div>
    </div>
  );
};

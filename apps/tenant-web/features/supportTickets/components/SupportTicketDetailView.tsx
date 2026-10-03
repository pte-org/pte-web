"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { Alert, LoadingState, PageHeader } from "@pte/ui";
import { ENTITY_TYPE_LABELS, SUPPORT_TICKETS_TEXT as T } from "../constants";
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

  if (isLoading) return <LoadingState rows={6} />;
  if (isError || !ticket) {
    return <Alert tone="error">Failed to load ticket.</Alert>;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={T.TICKET_DETAILS}
        subtitle={`#${ticket.publicId.slice(0, 8)}`}
        actions={
          <Link
            href="/host/support-tickets"
            className="text-sm font-medium text-action hover:underline"
          >
            ← {T.BACK}
          </Link>
        }
      />

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-card">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Category</dt>
            <dd className="mt-1">
              <TicketCategoryBadge category={ticket.category} />
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Status</dt>
            <dd className="mt-1">
              <TicketStatusBadge status={ticket.status} />
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Description
            </dt>
            <dd className="mt-1 text-sm text-gray-800">{ticket.description}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {T.CREATED_AT}
            </dt>
            <dd className="mt-1 text-sm text-gray-700">
              {new Date(ticket.createdAt).toLocaleString()}
            </dd>
          </div>
          {ticket.entityType && (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {T.ENTITY_SECTION}
              </dt>
              <dd className="mt-1 text-sm text-gray-700">
                {ENTITY_TYPE_LABELS[ticket.entityType as keyof typeof ENTITY_TYPE_LABELS] ?? ticket.entityType}
                <span className="ml-2 font-mono text-xs text-gray-400">{ticket.entityId}</span>
              </dd>
            </div>
          )}
        </dl>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-900">{T.NOTES_SECTION}</h2>
        <NoteThread notes={ticket.notes} />
      </div>
    </div>
  );
};

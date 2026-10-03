"use client";

import { type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getTenant } from "@pte/api-client";
import { Alert, LoadingState, PageHeader, useToast } from "@pte/ui";
import { apiClient } from "@/lib/apiClient";
import { ADMIN_TICKET_DETAIL_TEXT as T, CATEGORY_LABELS } from "../constants";
import {
  useAdminSupportTicket,
  useAddTicketNote,
  useUpdateTicketStatus,
} from "../api";
import type { TicketStatus } from "../types";
import { AddNoteForm } from "./_AddNoteForm";
import { NoteThread } from "./_NoteThread";
import { StatusPanel } from "./_StatusPanel";
import { TicketCategoryBadge } from "./_TicketCategoryBadge";

interface AdminSupportTicketDetailViewProps {
  ticketPublicId: string;
}

export const AdminSupportTicketDetailView = ({
  ticketPublicId,
}: AdminSupportTicketDetailViewProps): ReactElement => {
  const router = useRouter();
  const { showToast } = useToast();

  const { data: ticket, isLoading, isError } = useAdminSupportTicket(ticketPublicId);
  const updateStatus = useUpdateTicketStatus(ticketPublicId);
  const addNote = useAddTicketNote(ticketPublicId);

  const { data: tenant } = useQuery({
    queryKey: ["tenant", ticket?.tenantId],
    queryFn: () => getTenant(apiClient, ticket!.tenantId),
    enabled: !!ticket?.tenantId,
  });

  const handleTransition = (next: TicketStatus): void => {
    updateStatus.mutate(
      { status: next },
      {
        onSuccess: () => showToast(T.UPDATE_STATUS_SUCCESS, { tone: "success" }),
      },
    );
  };

  const handleAddNote = (content: string): void => {
    addNote.mutate(
      { content },
      {
        onSuccess: () => showToast(T.ADD_NOTE_SUCCESS, { tone: "success" }),
      },
    );
  };

  if (isLoading) return <LoadingState rows={6} />;
  if (isError || !ticket) return <Alert tone="error">{T.NOT_FOUND}</Alert>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/support-tickets")}
          className="text-sm font-medium text-action hover:underline"
        >
          {T.BACK}
        </button>
      </div>

      <PageHeader
        title={T.TICKET_TITLE(ticket.publicId.slice(0, 8))}
        subtitle={CATEGORY_LABELS[ticket.category]}
      />

      <StatusPanel
        status={ticket.status}
        onTransition={handleTransition}
        isLoading={updateStatus.isPending}
      />

      <section className="rounded-lg border border-gray-100 bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-gray-900">{T.SECTION_INFO}</h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InfoRow label={T.TENANT_LABEL} value={tenant?.name ?? ticket.tenantId} />
          <InfoRow
            label={T.CATEGORY_LABEL}
            value={<TicketCategoryBadge category={ticket.category} />}
          />
          {ticket.entityType && (
            <InfoRow label={T.ENTITY_TYPE_LABEL} value={ticket.entityType} />
          )}
          <InfoRow label={T.SUBMITTED_LABEL} value={new Date(ticket.createdAt).toLocaleString()} />
          <InfoRow label={T.UPDATED_LABEL} value={new Date(ticket.updatedAt).toLocaleString()} />
        </dl>
        <div className="mt-4">
          <dt className="text-sm font-medium text-gray-600">{T.DESCRIPTION_LABEL}</dt>
          <dd className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{ticket.description}</dd>
        </div>
      </section>

      <section className="rounded-lg border border-gray-100 bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-gray-900">{T.SECTION_NOTES}</h2>
        <div className="flex flex-col gap-4">
          <NoteThread notes={ticket.notes} />
          <AddNoteForm onSubmit={handleAddNote} isSubmitting={addNote.isPending} />
        </div>
      </section>
    </div>
  );
};

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}

const InfoRow = ({ label, value, mono }: InfoRowProps): ReactElement => (
  <div>
    <dt className="text-sm font-medium text-gray-600">{label}</dt>
    <dd className={`mt-1 text-sm text-gray-700 ${mono ? "font-mono" : ""}`}>{value}</dd>
  </div>
);

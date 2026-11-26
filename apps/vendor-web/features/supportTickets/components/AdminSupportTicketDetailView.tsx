"use client";

import { usePathname } from "next/navigation";

import { type ReactElement } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTenant, getUserFacingApiErrorMessage } from "@pte/api-client";
import {
  Alert,
  Button,
  LoadingState,
  PageHeader,
  formatShortDateTime,
  useDashboardBreadcrumbLabel,
  useLocale,
  useToast,
} from "@pte/ui";
import { apiClient } from "@/lib/apiClient";
import {
  ADMIN_TICKET_DETAIL_TEXT as RAW_ADMIN_TICKET_DETAIL_TEXT,
  SUPPORT_TICKET_BREADCRUMB_ID_LENGTH,
  STATUS_TRANSITIONS,
  TRANSITION_LABELS as RAW_TRANSITION_LABELS,
} from "../constants";
import { useAdminSupportTicket, useAddTicketNote, useUpdateTicketStatus } from "../api";
import type { TicketStatus } from "../types";
import { AddNoteForm } from "./_AddNoteForm";
import { NoteThread } from "./_NoteThread";
import { ReportedQuestion } from "./_ReportedQuestion";
import { TicketInfoPanel } from "./_TicketInfoPanel";
import { TicketStatusBadge } from "./_TicketStatusBadge";
import { useAdminCopy } from "@/features/i18n/adminCopy";

interface AdminSupportTicketDetailViewProps {
  ticketPublicId: string;
}

const PANEL = "rounded-lg border border-[var(--shell-border)] bg-[var(--surface-card)] p-5 shadow-card";
const PANEL_TITLE = "mb-4 border-b border-[var(--shell-border)] pb-3 text-base font-semibold text-[var(--ink-primary)]";

export const AdminSupportTicketDetailView = ({
  ticketPublicId,
}: AdminSupportTicketDetailViewProps): ReactElement => {
  const T = useAdminCopy(RAW_ADMIN_TICKET_DETAIL_TEXT);
  const transitionLabels = useAdminCopy(RAW_TRANSITION_LABELS);
  const { showToast } = useToast();

  const { data: ticket, isLoading, isError } = useAdminSupportTicket(ticketPublicId);
  const pathname = usePathname();
  const { locale, t } = useLocale();
  const title = ticket
    ? t("common.supportTicketBreadcrumb", undefined, {
        id: ticket.publicId.slice(0, SUPPORT_TICKET_BREADCRUMB_ID_LENGTH).toUpperCase(),
      })
    : undefined;
  useDashboardBreadcrumbLabel(pathname, title);
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
        onError: (error) =>
          showToast(getUserFacingApiErrorMessage(error, T.UPDATE_STATUS_ERROR), { tone: "error" }),
      },
    );
  };

  const handleAddNote = (content: string): void => {
    addNote.mutate(
      { content },
      {
        onSuccess: () => showToast(T.ADD_NOTE_SUCCESS, { tone: "success" }),
        onError: (error) =>
          showToast(getUserFacingApiErrorMessage(error, T.ADD_NOTE_ERROR), { tone: "error" }),
      },
    );
  };

  if (isLoading) return <LoadingState rows={6} />;
  if (isError || !ticket || !title) return <Alert tone="error">{T.NOT_FOUND}</Alert>;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <PageHeader
          title={title}
          titleBadge={<TicketStatusBadge status={ticket.status} />}
          actions={STATUS_TRANSITIONS[ticket.status].map((next) => (
            <Button
              key={next}
              type="button"
              isLoading={updateStatus.isPending}
              onClick={() => handleTransition(next)}
            >
              {transitionLabels[ticket.status]}
            </Button>
          ))}
        />
        <p className="text-sm text-[var(--ink-secondary)]">
          {T.SENT_AT} {formatShortDateTime(ticket.createdAt, locale)}
          {tenant?.name ? ` · ${tenant.name}` : ""}
        </p>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <section className={PANEL}>
            <h2 className={PANEL_TITLE}>{T.SECTION_CONTENT}</h2>
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[var(--ink-primary)]">
              {ticket.description}
            </p>
            <dl>
              <ReportedQuestion ticket={ticket} />
            </dl>
          </section>
          <section className={PANEL}>
            <h2 className={PANEL_TITLE}>
              {T.SECTION_NOTES}
              {ticket.notes.length > 0 && ` (${ticket.notes.length})`}
            </h2>
            <div className="flex flex-col gap-4">
              <NoteThread notes={ticket.notes} />
              <AddNoteForm onSubmit={handleAddNote} isSubmitting={addNote.isPending} />
            </div>
          </section>
        </div>
        <TicketInfoPanel ticket={ticket} tenantName={tenant?.name} />
      </div>
    </div>
  );
};

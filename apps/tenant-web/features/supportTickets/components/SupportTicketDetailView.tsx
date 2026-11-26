"use client";

import { useState, type ReactElement } from "react";
import { usePathname } from "next/navigation";
import {
  Alert,
  Button,
  ConfirmDialog,
  LoadingState,
  formatShortDateTime,
  PageHeader,
  useDashboardBreadcrumbLabel,
  useLocale,
  useToast,
} from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import {
  SUPPORT_TICKETS_TEXT as T,
  SUPPORT_TICKET_BREADCRUMB_ID_LENGTH,
  TICKET_ACTIONS_TEXT as A,
} from "../constants";
import { useCloseTicket, useSupportTicket } from "../api";
import { NoteThread } from "./_NoteThread";
import { TicketInfoPanel } from "./_TicketInfoPanel";
import { TicketStatusBadge } from "./_TicketStatusBadge";

interface SupportTicketDetailViewProps {
  ticketPublicId: string;
}

const PANEL = "rounded-lg border border-[var(--shell-border)] bg-[var(--surface-card)] p-5 shadow-card";
const PANEL_TITLE = "mb-4 border-b border-[var(--shell-border)] pb-3 text-base font-semibold text-[var(--ink-primary)]";

export const SupportTicketDetailView = ({
  ticketPublicId,
}: SupportTicketDetailViewProps): ReactElement => {
  const { data: ticket, isLoading, isError } = useSupportTicket(ticketPublicId);
  const pathname = usePathname();
  const { locale, t } = useLocale();
  const { showToast } = useToast();
  const close = useCloseTicket();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const title = ticket
    ? t("common.supportTicketBreadcrumb", undefined, {
        id: ticket.publicId.slice(0, SUPPORT_TICKET_BREADCRUMB_ID_LENGTH).toUpperCase(),
      })
    : undefined;
  useDashboardBreadcrumbLabel(pathname, title);

  if (isLoading) return <LoadingState rows={6} />;
  if (isError || !ticket || !title) {
    return <Alert tone="error">{t("tenant.support.detail.loadFailed", "Failed to load ticket.")}</Alert>;
  }

  const handleClose = (): void => {
    close.mutate(ticket.publicId, {
      onSuccess: () => showToast(t("tenant.support.closeSuccess", A.CLOSE_SUCCESS_TOAST), { tone: "success" }),
      onError: (err) =>
        showToast(errorMessage(err) ?? t("tenant.support.closeFailed", A.CLOSE_FAILED), { tone: "error" }),
      onSettled: () => setConfirmOpen(false),
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <PageHeader
          title={title}
          titleBadge={<TicketStatusBadge status={ticket.status} />}
          actions={
            // Only an OPEN request can be withdrawn; once an admin picks it up it stays.
            ticket.status === "OPEN" ? (
              <Button type="button" variant="secondary" onClick={() => setConfirmOpen(true)}>
                {t("tenant.support.close", A.CLOSE)}
              </Button>
            ) : undefined
          }
        />
        <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--ink-secondary)]">
          <span>
            {t("tenant.support.detail.sentAt", undefined, { time: formatShortDateTime(ticket.createdAt, locale) })}
          </span>
        </div>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <section className={PANEL}>
            <h2 className={PANEL_TITLE}>{t("tenant.support.detail.content", T.CONTENT_SECTION)}</h2>
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[var(--ink-primary)]">
              {ticket.description}
            </p>
          </section>
          <section className={PANEL}>
            <h2 className={PANEL_TITLE}>
              {t("tenant.support.detail.notes", T.NOTES_SECTION)}
              {ticket.notes.length > 0 && ` (${ticket.notes.length})`}
            </h2>
            <NoteThread notes={ticket.notes} />
          </section>
        </div>
        <TicketInfoPanel ticket={ticket} />
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={t("tenant.support.closeConfirmTitle", A.CONFIRM_CLOSE_TITLE)}
        description={t("tenant.support.closeConfirmDescription", A.CONFIRM_CLOSE_DESCRIPTION)}
        confirmLabel={t("tenant.support.close", A.CLOSE)}
        cancelLabel={t("tenant.support.cancel", A.CANCEL)}
        tone="danger"
        isConfirming={close.isPending}
        onConfirm={handleClose}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
};

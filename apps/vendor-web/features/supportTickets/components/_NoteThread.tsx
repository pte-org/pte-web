"use client";

import type { ReactElement } from "react";
import { Avatar, EmptyState, MessageSquareTextIcon, formatShortDateTime, useLocale } from "@pte/ui";
import { ADMIN_TICKET_DETAIL_TEXT as RAW_ADMIN_TICKET_DETAIL_TEXT } from "../constants";
import type { SupportTicketNote } from "../types";
import { useAdminCopy } from "@/features/i18n/adminCopy";

interface NoteThreadProps {
  notes: SupportTicketNote[];
}

/** The replies sent to the organization, as messages with role and time, or a quiet empty state before the first. */
export const NoteThread = ({ notes }: NoteThreadProps): ReactElement => {
  const T = useAdminCopy(RAW_ADMIN_TICKET_DETAIL_TEXT);
  const { locale } = useLocale();
  if (notes.length === 0) {
    return (
      <EmptyState
        className="border-0 shadow-none"
        icon={<MessageSquareTextIcon className="h-8 w-8" />}
        title={T.EMPTY_NOTES_TITLE}
        description={T.EMPTY_NOTES_TEXT}
      />
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {notes.map((note) => (
        <li key={note.publicId} className="flex items-start gap-3">
          <Avatar name={T.ADMIN_ROLE} className="shrink-0" />
          <div className="min-w-0 flex-1 rounded-lg border border-[var(--shell-border)] bg-[var(--surface-subtle)] p-4">
            <div className="mb-1 flex flex-wrap items-baseline gap-x-2">
              <span className="text-sm font-semibold text-[var(--ink-primary)]">{T.ADMIN_ROLE}</span>
              <span className="text-xs text-[var(--ink-muted)]">{formatShortDateTime(note.createdAt, locale)}</span>
            </div>
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[var(--ink-primary)]">
              {note.content}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
};

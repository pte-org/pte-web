"use client";

import type { ReactElement } from "react";
import { Avatar, EmptyState, MessageSquareTextIcon, formatShortDateTime, useLocale } from "@pte/ui";
import { SUPPORT_TICKETS_TEXT } from "../constants";
import type { SupportTicketNote } from "../types";

interface NoteThreadProps {
  notes: SupportTicketNote[];
}

/** The admin's replies as messages (role and time on top), or a quiet empty state while nobody has answered. */
export const NoteThread = ({ notes }: NoteThreadProps): ReactElement => {
  const { locale, t } = useLocale();
  if (notes.length === 0) {
    return (
      <EmptyState
        className="border-0 shadow-none"
        icon={<MessageSquareTextIcon className="h-8 w-8" />}
        title={t("tenant.support.detail.noNotes", SUPPORT_TICKETS_TEXT.NO_NOTES)}
        description={t("tenant.support.detail.noNotesHint", SUPPORT_TICKETS_TEXT.NO_NOTES_HINT)}
      />
    );
  }

  const adminRole = t("tenant.support.detail.adminRole", SUPPORT_TICKETS_TEXT.ADMIN_ROLE);
  return (
    <ul className="flex flex-col gap-4">
      {notes.map((note) => (
        <li key={note.publicId} className="flex items-start gap-3">
          <Avatar name={adminRole} className="shrink-0" />
          <div className="min-w-0 flex-1 rounded-lg border border-[var(--shell-border)] bg-[var(--surface-subtle)] p-4">
            <div className="mb-1 flex flex-wrap items-baseline gap-x-2">
              <span className="text-sm font-semibold text-[var(--ink-primary)]">{adminRole}</span>
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

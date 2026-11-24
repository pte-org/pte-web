"use client";

import type { ReactElement } from "react";
import { useLocale } from "@pte/ui";
import { SUPPORT_TICKETS_TEXT } from "../constants";
import type { SupportTicketNote } from "../types";

interface NoteThreadProps {
  notes: SupportTicketNote[];
}

export const NoteThread = ({ notes }: NoteThreadProps): ReactElement => {
  const { locale, t } = useLocale();
  if (notes.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        {t("tenant.support.detail.noNotes", SUPPORT_TICKETS_TEXT.NO_NOTES)}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {notes.map((note) => (
        <div key={note.publicId} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="mb-1">
            <span className="text-xs text-gray-400">
              {new Date(note.createdAt).toLocaleString(locale === "vi" ? "vi-VN" : "en-GB")}
            </span>
          </div>
          <p className="text-sm text-gray-800">{note.content}</p>
        </div>
      ))}
    </div>
  );
};

import type { ReactElement } from "react";
import { ADMIN_TICKET_DETAIL_TEXT as RAW_ADMIN_TICKET_DETAIL_TEXT } from "../constants";
import type { SupportTicketNote } from "../types";
import { useAdminCopy } from "@/features/i18n/adminCopy";

interface NoteThreadProps {
  notes: SupportTicketNote[];
}

export const NoteThread = ({ notes }: NoteThreadProps): ReactElement => {
  const T = useAdminCopy(RAW_ADMIN_TICKET_DETAIL_TEXT);
  if (notes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 py-8 text-center">
        <p className="text-sm font-medium text-gray-700">{T.EMPTY_NOTES_TITLE}</p>
        <p className="mt-1 text-xs text-gray-500">{T.EMPTY_NOTES_TEXT}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {notes.map((note) => (
        <div key={note.publicId} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
          <div className="mb-1">
            <span className="text-xs text-gray-400">
              {new Date(note.createdAt).toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
        </div>
      ))}
    </div>
  );
};

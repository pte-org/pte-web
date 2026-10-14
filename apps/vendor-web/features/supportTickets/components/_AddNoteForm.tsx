"use client";

import { useState, type ReactElement } from "react";
import { ADMIN_TICKET_DETAIL_TEXT as RAW_ADMIN_TICKET_DETAIL_TEXT } from "../constants";
import { useAdminCopy } from "@/features/i18n/adminCopy";

interface AddNoteFormProps {
  onSubmit: (content: string) => void;
  isSubmitting: boolean;
}

export const AddNoteForm = ({ onSubmit, isSubmitting }: AddNoteFormProps): ReactElement => {
  const T = useAdminCopy(RAW_ADMIN_TICKET_DETAIL_TEXT);
  const [content, setContent] = useState("");

  const handleSubmit = (): void => {
    const trimmed = content.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setContent("");
  };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="add-note-input" className="text-sm font-medium text-gray-700">
        {T.ADD_NOTE_LABEL}
      </label>
      <textarea
        id="add-note-input"
        rows={3}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={T.ADD_NOTE_PLACEHOLDER}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-action focus:outline-none focus:ring-1 focus:ring-action"
      />
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !content.trim()}
          className="rounded-md bg-action px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-action/25 hover:bg-action-hover disabled:opacity-50"
        >
          {T.ADD_NOTE_SUBMIT}
        </button>
      </div>
    </div>
  );
};

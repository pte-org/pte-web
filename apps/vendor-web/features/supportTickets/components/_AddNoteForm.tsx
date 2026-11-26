"use client";

import { useState, type ReactElement } from "react";
import { Button, EyeIcon, Textarea } from "@pte/ui";
import { ADMIN_TICKET_DETAIL_TEXT as RAW_ADMIN_TICKET_DETAIL_TEXT } from "../constants";
import { useAdminCopy } from "@/features/i18n/adminCopy";

interface AddNoteFormProps {
  onSubmit: (content: string) => void;
  isSubmitting: boolean;
}

const NOTE_ROWS = 3;

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
    <div className="flex flex-col gap-3 border-t border-[var(--shell-border)] pt-4">
      <Textarea
        id="add-note-input"
        aria-label={T.SECTION_NOTES}
        rows={NOTE_ROWS}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={T.ADD_NOTE_PLACEHOLDER}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Replies go to the organization, never stay internal: say so where the admin is typing. */}
        <span className="inline-flex items-center gap-1.5 text-xs text-[var(--ink-secondary)]">
          <EyeIcon className="h-4 w-4" />
          {T.VISIBLE_HINT}
        </span>
        <Button type="button" onClick={handleSubmit} isLoading={isSubmitting} disabled={!content.trim()}>
          {T.ADD_NOTE_SUBMIT}
        </Button>
      </div>
    </div>
  );
};

"use client";

import { useState, type ReactElement } from "react";
import { Button, Checkbox, ConfirmDialog } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { EXAM_STUDIO_TEXT } from "../constants";
import type { DraftBulkDelete } from "../hooks/useDraftBulkDelete";

interface DraftBulkDeleteBarProps {
  /** The deletable drafts of the page shown. */
  pageIds: readonly string[];
  bulk: DraftBulkDelete;
}

/** Picks every deletable draft of the page, deletes the picked ones after a confirm, then says how it went. */
export const DraftBulkDeleteBar = ({ pageIds, bulk }: DraftBulkDeleteBarProps): ReactElement => {
  const text = useAdminCopy(EXAM_STUDIO_TEXT);
  const [confirming, setConfirming] = useState(false);
  const count = bulk.selected.size;
  const allSelected = pageIds.length > 0 && pageIds.every((id) => bulk.selected.has(id));
  const result = bulk.result;
  const close = (): void => {
    if (bulk.isDeleting) return;
    setConfirming(false);
    bulk.dismissResult();
  };

  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-[var(--shell-border)] px-3 py-2">
      <Checkbox id="studio-bulk-select-page" label={text.BULK_SELECT_PAGE} checked={allSelected}
        disabled={pageIds.length === 0 || bulk.isDeleting} onChange={() => bulk.toggleAllOf(pageIds)} />
      {count > 0 && (
        <span className="text-sm text-[var(--ink-secondary)]">{text.BULK_SELECTED.replace("{count}", String(count))}</span>
      )}
      <Button size="sm" variant="danger" className="ml-auto" disabled={count === 0 || bulk.isDeleting}
        onClick={() => setConfirming(true)}>
        {text.BULK_DELETE}
      </Button>
      <ConfirmDialog
        open={confirming}
        title={text.BULK_DELETE_TITLE}
        description={result
          ? text.BULK_DELETE_RESULT.replace("{deleted}", String(result.deleted)).replace("{failed}", String(result.failed))
          : text.BULK_DELETE_BODY.replace("{count}", String(count))}
        confirmLabel={result ? text.BULK_DELETE_CLOSE : text.BULK_DELETE_CONFIRM}
        cancelLabel={text.BULK_DELETE_CANCEL}
        tone={result ? "primary" : "danger"}
        isConfirming={bulk.isDeleting}
        onConfirm={result ? close : () => void bulk.run()}
        onClose={close}
      />
    </div>
  );
};

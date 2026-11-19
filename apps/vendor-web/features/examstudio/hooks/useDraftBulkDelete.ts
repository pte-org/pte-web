"use client";

import { useState } from "react";
import { useDeleteQuestion } from "@/features/questionbank/api";
import { deleteEach, toggleAll, toggleId, type BulkDeleteResult } from "../draftBulkDelete";

export interface DraftBulkDelete {
  selected: ReadonlySet<string>;
  toggle: (id: string) => void;
  toggleAllOf: (pageIds: readonly string[]) => void;
  clear: () => void;
  isDeleting: boolean;
  result: BulkDeleteResult | null;
  run: () => Promise<void>;
  dismissResult: () => void;
}

/** The drafts picked for a bulk delete, and the delete itself through the single-question delete. */
export function useDraftBulkDelete(): DraftBulkDelete {
  const deleteMutation = useDeleteQuestion();
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [result, setResult] = useState<BulkDeleteResult | null>(null);

  const run = async (): Promise<void> => {
    setIsDeleting(true);
    const outcome = await deleteEach([...selected], (id) => deleteMutation.mutateAsync(id));
    setIsDeleting(false);
    setSelected(new Set());
    setResult(outcome);
  };

  return {
    selected,
    toggle: (id) => setSelected((current) => toggleId(current, id)),
    toggleAllOf: (pageIds) => setSelected((current) => toggleAll(current, pageIds)),
    clear: () => setSelected(new Set()),
    isDeleting,
    result,
    run,
    dismissResult: () => setResult(null),
  };
}

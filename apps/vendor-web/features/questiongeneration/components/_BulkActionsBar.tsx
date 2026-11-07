"use client";

import { useState, useMemo } from "react";
import { Button, ConfirmDialog, useToast } from "@pte/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generationMessages } from "../messages/en";
import { useDeleteQuestion, useSubmitQuestionApproval } from "@/features/questionbank/api";
import type { QuestionGenerationJobResponse } from "@pte/api-client";

interface BulkActionsBarProps {
  job: QuestionGenerationJobResponse;
  selectedIndices: Set<number>;
  onBulkActionComplete?: () => void;
}

/**
 * Toolbar for bulk actions: submit/delete selected
 * Only shows for items with questionPublicId (saved items)
 */
export const _BulkActionsBar = ({
  job,
  selectedIndices,
  onBulkActionComplete,
}: BulkActionsBarProps) => {
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { showToast } = useToast();

  const submitMutation = useSubmitQuestionApproval();
  const deleteMutation = useDeleteQuestion();

  // Filter selected items that have questionPublicId
  const submitableIndices = useMemo(() => {
    return Array.from(selectedIndices).filter((idx) => {
      const item = job.items[idx];
      return item?.questionPublicId !== null;
    });
  }, [selectedIndices, job.items]);

  const deleteableIndices = useMemo(() => {
    return Array.from(selectedIndices).filter((idx) => {
      const item = job.items[idx];
      return item?.questionPublicId !== null;
    });
  }, [selectedIndices, job.items]);

  const handleBulkSubmit = async (): Promise<void> => {
    const questionIds = submitableIndices
      .map((idx) => job.items[idx]?.questionPublicId)
      .filter((id): id is string => !!id);

    let succeeded = 0;
    for (const id of questionIds) {
      try {
        await submitMutation.mutateAsync(id);
        succeeded++;
      } catch {
        // Continue with next item
      }
    }
    showToast(`${succeeded}/${questionIds.length} submitted`);
    onBulkActionComplete?.();
    setShowSubmitConfirm(false);
  };

  const handleBulkDelete = async (): Promise<void> => {
    const questionIds = deleteableIndices
      .map((idx) => job.items[idx]?.questionPublicId)
      .filter((id): id is string => !!id);

    let succeeded = 0;
    for (const id of questionIds) {
      try {
        await deleteMutation.mutateAsync(id);
        succeeded++;
      } catch {
        // Continue with next item
      }
    }
    showToast(`${succeeded}/${questionIds.length} deleted`);
    onBulkActionComplete?.();
    setShowDeleteConfirm(false);
  };

  const isSubmitting = submitMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  return (
    <>
      <div className="flex gap-2 items-center">
        {submitableIndices.length > 0 && (
          <Button
            onClick={() => setShowSubmitConfirm(true)}
            disabled={isSubmitting}
            size="sm"
          >
            {generationMessages.bulkSubmitAllLabel} ({submitableIndices.length})
          </Button>
        )}
        {deleteableIndices.length > 0 && (
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            variant="secondary"
            disabled={isDeleting}
            size="sm"
          >
            {generationMessages.bulkDeleteLabel} ({deleteableIndices.length})
          </Button>
        )}
      </div>

      {/* Submit Confirmation */}
      <ConfirmDialog
        open={showSubmitConfirm}
        title={generationMessages.bulkSubmitAllLabel}
        description={generationMessages.bulkSubmitAllConfirmMessage.replace(
          "{count}",
          String(submitableIndices.length),
        )}
        confirmLabel={generationMessages.submitButton}
        cancelLabel="Cancel"
        isConfirming={isSubmitting}
        onConfirm={() => void handleBulkSubmit()}
        onClose={() => setShowSubmitConfirm(false)}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        title={generationMessages.bulkDeleteLabel}
        description={generationMessages.bulkDeleteConfirmMessage.replace(
          "{count}",
          String(deleteableIndices.length),
        )}
        confirmLabel={generationMessages.deleteButton}
        cancelLabel="Cancel"
        isConfirming={isDeleting}
        onConfirm={() => void handleBulkDelete()}
        onClose={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};

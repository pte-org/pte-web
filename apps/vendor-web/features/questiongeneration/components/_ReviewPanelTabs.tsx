"use client";

import { useState } from "react";
import { Tabs, Button, ConfirmDialog, useToast, Skeleton } from "@pte/ui";
import { generationMessages } from "../messages/en";
import { useSubmitQuestionApproval, useDeleteQuestion, useQuestion } from "@/features/questionbank/api";
import { ReviewPanel } from "./ReviewPanel";
import { ExamScreenPreview } from "@/features/questionbank/components/ExamScreenPreview";
import { buildQuestionPreviewDraft } from "@/features/questionbank/questionPreviewDraft";
import { useRouter } from "next/navigation";
import type { QuestionGenerationItemResponse, GenerationMetaResponse } from "@pte/api-client";

interface ReviewPanelTabsProps {
  item: QuestionGenerationItemResponse;
  jobId: string;
}

/**
 * Right panel: Tabs showing generation item details (Preview | Review AI | Edit)
 */
export const _ReviewPanelTabs = ({
  item,
}: ReviewPanelTabsProps) => {
  const [activeTab, setActiveTab] = useState("preview");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  const submitMutation = useSubmitQuestionApproval();
  const deleteMutation = useDeleteQuestion();
  const { data: fullQuestion, isLoading: isQuestionLoading } = useQuestion(item.questionPublicId || "");

  const tabItems = [
    {
      id: "preview",
      label: "Preview",
    },
    {
      id: "review",
      label: "Review AI",
    },
    {
      id: "edit",
      label: "Edit",
    },
  ];

  const canDelete = item.questionPublicId !== null && item.stage === "SAVED";
  const canSubmit = item.questionPublicId !== null && item.stage === "SAVED";

  const handleSubmit = async (): Promise<void> => {
    if (item.questionPublicId) {
      try {
        await submitMutation.mutateAsync(item.questionPublicId);
        showToast("Question submitted");
      } catch (error) {
        showToast("Failed to submit question");
      }
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (item.questionPublicId) {
      try {
        await deleteMutation.mutateAsync(item.questionPublicId);
        showToast("Question deleted");
        setShowDeleteConfirm(false);
      } catch (error) {
        showToast("Failed to delete question");
      }
    }
  };

  const handleEditClick = (): void => {
    if (item.questionPublicId) {
      router.push(`/admin/questions/${item.questionPublicId}/edit`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <Tabs
        id="review-tabs"
        items={tabItems}
        value={activeTab}
        onChange={setActiveTab}
        variant="default"
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === "preview" && (
          <>
            {isQuestionLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-64 w-full" />
              </div>
            ) : fullQuestion ? (
              <ExamScreenPreview
                draft={buildQuestionPreviewDraft(fullQuestion, undefined, {
                  imageUrl: fullQuestion.imagePromptRef ? `/api/v1/media/${fullQuestion.imagePromptRef}` : null,
                  audioUrl: fullQuestion.audioPromptRef ? `/api/v1/media/${fullQuestion.audioPromptRef}` : null,
                })}
              />
            ) : (
              <div className="text-center text-gray-500 py-8">
                No preview available
              </div>
            )}
          </>
        )}

        {activeTab === "review" && (
          <>
            {isQuestionLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-64 w-full" />
              </div>
            ) : fullQuestion?.generationMeta ? (
              <ReviewPanel meta={fullQuestion.generationMeta as GenerationMetaResponse} isLoading={false} />
            ) : (
              <div className="text-center text-gray-500 py-8">
                No AI review data available
              </div>
            )}
          </>
        )}

        {activeTab === "edit" && (
          <div className="space-y-4">
            {item.questionPublicId ? (
              <>
                <p className="text-sm text-gray-600">
                  Click the button below to edit this question. Editing marks the question as human-edited.
                </p>
                <Button onClick={handleEditClick} className="w-full">
                  Edit Question
                </Button>
              </>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Question not yet saved
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {canDelete && (
        <div className="border-t p-4 flex gap-2 justify-end">
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            variant="secondary"
            disabled={deleteMutation.isPending}
          >
            {generationMessages.deleteButton}
          </Button>
          {canSubmit && (
            <Button
              onClick={() => void handleSubmit()}
              disabled={submitMutation.isPending}
              isLoading={submitMutation.isPending}
            >
              {generationMessages.submitButton}
            </Button>
          )}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        title={generationMessages.deleteConfirmTitle}
        description={generationMessages.deleteConfirmMessage}
        confirmLabel={generationMessages.deleteButton}
        cancelLabel="Cancel"
        isConfirming={deleteMutation.isPending}
        onConfirm={() => void handleDelete()}
        onClose={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Alert, Skeleton } from "@pte/ui";
import { useQuestionGenerationJob } from "../api";
import { generationMessages } from "../messages/en";
import type { QuestionGenerationItemResponse } from "@pte/api-client";
import { ReviewItemList } from "./_ReviewItemList";
import { ReviewPanelTabs } from "./_ReviewPanelTabs";
import { BulkActionsBar } from "./_BulkActionsBar";

const REVIEW_CONTAINER_MAX_HEIGHT = "calc(100vh - 200px)";

/**
 * Main review page for AI-generated questions
 * Left: DataTable of job items; Right: Preview/Review/Edit tabs
 * Responsive: split view ≥1280px, stacked below
 */
export const QuestionReviewPage = () => {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("job");

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  const { data: job, isLoading, error } = useQuestionGenerationJob(jobId);

  const items: QuestionGenerationItemResponse[] = useMemo(() => {
    return job?.items ?? [];
  }, [job?.items]);

  const selectedItem = items[selectedIndex] ?? null;

  if (!jobId) {
    return (
      <div className="p-6">
        <Alert tone="error">{generationMessages.jobNotFound}</Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert tone="error">{generationMessages.jobError}</Alert>
      </div>
    );
  }

  if (isLoading || !job) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 h-screen overflow-hidden">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{generationMessages.reviewPageTitle}</h1>
        <p className="text-sm text-gray-600">{generationMessages.reviewPageDescription}</p>
      </div>

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        job={job}
        selectedIndices={selectedIndices}
        onBulkActionComplete={() => setSelectedIndices(new Set())}
      />

      {/* Main Review Container */}
      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 overflow-hidden"
        style={{ maxHeight: REVIEW_CONTAINER_MAX_HEIGHT }}
      >
        {/* Left: Item List */}
        <div className="border rounded-lg overflow-hidden flex flex-col">
          <ReviewItemList
            items={items}
            selectedIndex={selectedIndex}
            selectedIndices={selectedIndices}
            onSelectIndex={setSelectedIndex}
            onToggleSelect={(index) => {
              const newSet = new Set(selectedIndices);
              if (newSet.has(index)) {
                newSet.delete(index);
              } else {
                newSet.add(index);
              }
              setSelectedIndices(newSet);
            }}
            onNavigateUp={() => {
              if (selectedIndex > 0) {
                setSelectedIndex(selectedIndex - 1);
              }
            }}
            onNavigateDown={() => {
              if (selectedIndex < items.length - 1) {
                setSelectedIndex(selectedIndex + 1);
              }
            }}
          />
        </div>

        {/* Right: Preview/Review/Edit Tabs */}
        <div className="border rounded-lg overflow-hidden flex flex-col">
          {selectedItem ? (
            <ReviewPanelTabs
              item={selectedItem}
              jobId={job.publicId}
            />
          ) : (
            <div className="p-6 text-center text-gray-500">
              {generationMessages.emptyStateTitle}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

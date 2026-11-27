"use client";

import { useMemo, useState, type ReactElement } from "react";
import type { QuestionGenerationBatchQuestion } from "@pte/api-client";
import { Chip, cn } from "@pte/ui";
import { useQuestionTypes } from "@/features/questiontemplate/api";
import { taskTypeLabel } from "../../questiongeneration/utils/taskTypeLabel";
import type { BatchMessages } from "../messages/en";
import { filterSlots, sectionCounts, slotState, type ResultFilter } from "../utils/batchResults";
import { BatchQuestionCard } from "./_BatchQuestionCard";

interface BatchResultsProps {
  batchId: string;
  slots: readonly QuestionGenerationBatchQuestion[];
  messages: BatchMessages;
  onWatch: (jobId: string) => void;
}

const FILTERS: readonly { id: ResultFilter; text: keyof BatchMessages }[] = [
  { id: "all", text: "filterAll" },
  { id: "saved", text: "filterSaved" },
  { id: "failed", text: "filterFailed" },
];

/**
 * Every question of the batch as a card, in run order: the saved ones previewed as themselves, the running ones in
 * their agent's colour and the rest as empty frames, so the grid fills in as the batch runs.
 */
export const BatchResults = ({
  batchId,
  slots,
  messages,
  onWatch,
}: BatchResultsProps): ReactElement => {
  const [filter, setFilter] = useState<ResultFilter>("all");
  const { data: questionTypes = [] } = useQuestionTypes(false);
  const sectionOf = useMemo(() => {
    const sections = new Map<string, string>();
    for (const type of questionTypes) {
      if (type.section) {
        sections.set(type.code, type.section);
        if (type.taskTypeKey) sections.set(type.taskTypeKey, type.section);
      }
    }
    return (taskType: string): string | null => sections.get(taskType) ?? null;
  }, [questionTypes]);
  const numbers = useMemo(
    () => new Map(slots.map((slot, index) => [`${slot.jobPublicId}:${slot.itemIndex}`, index + 1])),
    [slots],
  );
  const counts: Record<ResultFilter, number> = {
    all: slots.length,
    saved: slots.filter((slot) => slotState(slot) === "saved").length,
    failed: slots.filter((slot) => slotState(slot) === "failed").length,
  };
  const shown = filterSlots(slots, filter);
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 border-b border-[var(--border-subtle)] pb-3">
        <h2 className="text-base font-semibold">{messages.resultsTitle}</h2>
        <div className="flex rounded-lg bg-[var(--surface-subtle)] p-0.5">
          {FILTERS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              aria-pressed={filter === entry.id}
              onClick={() => setFilter(entry.id)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs text-[var(--ink-secondary)] transition-colors",
                filter === entry.id &&
                  "bg-[var(--surface-card)] text-[var(--ink-primary)] shadow-card",
              )}
            >
              {messages[entry.text].replace("{count}", String(counts[entry.id]))}
            </button>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap gap-1.5">
          {sectionCounts(slots, sectionOf).map((entry) => (
            <Chip key={entry.section} size="sm">
              {messages.sectionCount
                .replace("{section}", taskTypeLabel(entry.section))
                .replace("{done}", String(entry.done))
                .replace("{total}", String(entry.total))}
            </Chip>
          ))}
        </div>
      </div>
      {shown.length === 0 && (
        <p className="pt-4 text-sm text-[var(--ink-muted)]">{messages.noResults}</p>
      )}
      <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {shown.map((slot) => (
          <BatchQuestionCard
            key={`${slot.jobPublicId}:${slot.itemIndex}`}
            slot={slot}
            number={numbers.get(`${slot.jobPublicId}:${slot.itemIndex}`) ?? 0}
            batchId={batchId}
            section={slot.section ?? sectionOf(slot.taskType)}
            messages={messages}
            onWatch={onWatch}
          />
        ))}
      </div>
    </div>
  );
};

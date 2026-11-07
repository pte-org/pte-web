"use client";

import { useState, useEffect } from "react";
import { Badge, Checkbox } from "@pte/ui";
import { generationMessages } from "../messages/en";
import type { QuestionGenerationItemResponse } from "@pte/api-client";

interface ReviewItemListProps {
  items: QuestionGenerationItemResponse[];
  selectedIndex: number;
  selectedIndices: Set<number>;
  onSelectIndex: (index: number) => void;
  onToggleSelect: (index: number) => void;
  onNavigateUp: () => void;
  onNavigateDown: () => void;
}

/**
 * Left panel: Table of generation job items
 * Shows index, topic, verdict chip, status
 * Supports keyboard navigation (↑/↓) when focused
 */
export const _ReviewItemList = ({
  items,
  selectedIndex,
  selectedIndices,
  onSelectIndex,
  onToggleSelect,
  onNavigateUp,
  onNavigateDown,
}: ReviewItemListProps) => {
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        onNavigateUp();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        onNavigateDown();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFocused, onNavigateUp, onNavigateDown]);

  const getVerdictBadge = (
    stage?: string,
  ): React.ReactNode => {
    if (stage === "FAILED") {
      return (
        <Badge>
          {generationMessages.verdictFail}
        </Badge>
      );
    }
    if (stage === "SAVED") {
      return (
        <Badge>
          {generationMessages.verdictPass}
        </Badge>
      );
    }
    return <span className="text-sm text-gray-500">{stage ?? "-"}</span>;
  };

  return (
    <div
      className="flex flex-col h-full bg-white"
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      role="region"
      aria-label="Question list"
      aria-live="polite"
    >
      {/* Header */}
      <div className="grid grid-cols-[40px_50px_1fr_100px] gap-2 px-4 py-3 bg-gray-50 border-b text-sm font-medium text-gray-700">
        <div></div>
        <div>{generationMessages.questionIndexLabel}</div>
        <div>ID</div>
        <div>{generationMessages.questionVerdictLabel}</div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            {generationMessages.emptyStateTitle}
          </div>
        ) : (
          items.map((item, index) => (
            <button
              key={`item-${index}`}
              onClick={() => onSelectIndex(index)}
              className={`w-full grid grid-cols-[40px_50px_1fr_100px] gap-2 px-4 py-3 border-b text-left text-sm hover:bg-blue-50 transition-colors ${
                selectedIndex === index ? "bg-blue-100" : ""
              }`}
            >
              <Checkbox
                checked={selectedIndices.has(index)}
                label="Select"
                onChange={() => onToggleSelect(index)}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="font-medium">{index + 1}</span>
              <span className="text-gray-700 truncate text-xs">
                {item.questionPublicId ?? "-"}
              </span>
              <div>{getVerdictBadge(item.stage)}</div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

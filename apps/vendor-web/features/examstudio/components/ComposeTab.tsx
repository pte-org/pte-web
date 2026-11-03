"use client";

import { useState, type ReactElement } from "react";
import { useToast } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { QuestionEditorWithPreview } from "@/features/questionbank/components/QuestionEditorWithPreview";
import type { PreviewTiming } from "@/features/questionbank/types";
import { EXAM_STUDIO_TEXT } from "../constants";
import type { StudioTile } from "../types";

interface ComposeTabProps {
  tiles: StudioTile[];
  /** The skill whose task types the form lists first; every skill when omitted. */
  initialSection?: string;
}

/** The question form with the student's view beside it, so the writer sees the result while typing. */
export const ComposeTab = ({ tiles, initialSection }: ComposeTabProps): ReactElement => {
  const text = useAdminCopy(EXAM_STUDIO_TEXT);
  const { showToast } = useToast();
  // A saved question leaves an empty form behind, ready for the next one.
  const [formKey, setFormKey] = useState(0);

  const timingFor = (taskType: string): PreviewTiming | null => {
    const item = tiles.find((tile) => tile.key === taskType)?.item;
    return item ? { prepSeconds: item.prepSeconds, responseSeconds: item.responseSeconds } : null;
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--ink-secondary)]">{text.COMPOSE_HINT}</p>
      <QuestionEditorWithPreview
        key={formKey}
        timingFor={timingFor}
        initialSection={initialSection}
        onSaved={() => {
          showToast(text.COMPOSE_SAVED, { tone: "success" });
          setFormKey((current) => current + 1);
        }}
      />
    </div>
  );
};

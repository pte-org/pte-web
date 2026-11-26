"use client";

import { useState, type ReactElement } from "react";
import { useToast } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { GenerateWithAiAction } from "@/features/questionbank/components/GenerateWithAiAction";
import { QuestionEditorWithPreview } from "@/features/questionbank/components/QuestionEditorWithPreview";
import type { PreviewTiming, QuestionPreviewDraft } from "@/features/questionbank/types";
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
  // What the form holds now, for the AI popup to pre-tick its task type and to ask before a batch leaves.
  const [draft, setDraft] = useState<QuestionPreviewDraft | null>(null);

  const timingFor = (taskType: string): PreviewTiming | null => {
    const item = tiles.find((tile) => tile.key === taskType)?.item;
    return item ? { prepSeconds: item.prepSeconds, responseSeconds: item.responseSeconds } : null;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--ink-secondary)]">{text.COMPOSE_HINT}</p>
        <GenerateWithAiAction draft={draft} />
      </div>
      <QuestionEditorWithPreview
        key={formKey}
        timingFor={timingFor}
        initialSection={initialSection}
        // The skill filter is the second row of tabs on this page, so it takes the compact switch look.
        skillTabsVariant="segmented"
        onDraftChange={setDraft}
        onReset={() => setFormKey((current) => current + 1)}
        onSaved={() => {
          showToast(text.COMPOSE_SAVED, { tone: "success" });
          setFormKey((current) => current + 1);
        }}
      />
    </div>
  );
};

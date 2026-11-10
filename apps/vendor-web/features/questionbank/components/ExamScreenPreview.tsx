import type { ReactElement } from "react";
import { EXAM_SCREEN_TEXT } from "../examScreenPreviewConstants";
import type { PreviewTiming, QuestionPreviewDraft } from "../types";
import { PreviewResponse } from "./_PreviewResponse";
import { PreviewStimulus } from "./_PreviewStimulus";

interface ExamScreenPreviewProps {
  draft: QuestionPreviewDraft | null;
  /** Preparation and answer time from the exam template, when one is known. */
  timing?: PreviewTiming | null;
}

/**
 * The candidate's task as the PTE app draws it: the task title over a white card holding the italic
 * instruction, the prompt and the answer control. Coloured with the app's own palette (`--exam-*`
 * tokens), so it looks the same in light and dark mode.
 */
export const ExamScreenPreview = ({
  draft,
  timing = null,
}: ExamScreenPreviewProps): ReactElement => (
  <div className="overflow-hidden rounded-lg border border-[var(--exam-border)] bg-[var(--exam-canvas)] text-[var(--exam-text)]">
    <div className="space-y-4 p-6">
      <h2 className="text-3xl font-bold">{draft?.taskName ?? EXAM_SCREEN_TEXT.NO_TASK}</h2>
      <div className="min-h-72 rounded-lg border border-[var(--exam-border-subtle)] bg-[var(--exam-surface)] p-8">
        {draft?.instruction && <p className="mb-6 text-lg font-bold italic">{draft.instruction}</p>}
        {draft && (
          <div className="space-y-6">
            <PreviewStimulus draft={draft} />
            <PreviewResponse draft={draft} timing={timing} />
          </div>
        )}
      </div>
    </div>
  </div>
);

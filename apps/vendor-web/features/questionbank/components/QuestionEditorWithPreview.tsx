"use client";

import { useCallback, useState, type ReactElement, type ReactNode } from "react";
import { LoadingState, TabRailCard } from "@pte/ui";
import type { QuestionResponse } from "@pte/api-client";
import { useQuestionTypes } from "@/features/questiontemplate/api";
import { SCORE_TEMPLATE_ALL_TAB } from "@/features/scoretemplate/constants";
import { useSectionTabItems } from "@/features/scoretemplate/useSectionTabItems";
import type { PreviewTiming, QuestionPreviewDraft } from "../types";
import { ExamScreenPreview } from "./ExamScreenPreview";
import { QuestionEditorForm } from "./QuestionEditorForm";

interface QuestionEditorWithPreviewProps {
  question?: QuestionResponse;
  /** The question is published: saving puts the edits in a new draft revision. */
  saveAsRevision?: boolean;
  onSaved?: (question: QuestionResponse) => void;
  onCancel?: () => void;
  /** Preparation and answer time of a task type in the exam template, shown in the preview. */
  timingFor?: (taskType: string) => PreviewTiming | null;
  /** The exam section whose tab is selected first; every section when omitted. */
  initialSection?: string;
  /** Shown under the section rail (a new question only). */
  sidePanel?: ReactNode;
}

/**
 * Exam sections down the left, the question form and the student's exam screen side by side on
 * the right. An existing question keeps its task type, so it has no section rail.
 */
export const QuestionEditorWithPreview = ({
  question,
  saveAsRevision,
  onSaved,
  onCancel,
  timingFor,
  initialSection,
  sidePanel,
}: QuestionEditorWithPreviewProps): ReactElement => {
  const { data: questionTypes = [], isLoading } = useQuestionTypes(true);
  const [draft, setDraft] = useState<QuestionPreviewDraft | null>(null);
  const [section, setSection] = useState(initialSection ?? SCORE_TEMPLATE_ALL_TAB);
  const handlePreview = useCallback((next: QuestionPreviewDraft) => setDraft(next), []);
  const sectionItems = useSectionTabItems((value) =>
    value === null
      ? questionTypes.length
      : questionTypes.filter((type) => type.section === value).length,
  );

  const workspace = (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:items-start">
      <QuestionEditorForm
        question={question}
        saveAsRevision={saveAsRevision}
        onSaved={onSaved}
        onCancel={onCancel}
        onPreviewChange={handlePreview}
        sectionFilter={section === SCORE_TEMPLATE_ALL_TAB ? undefined : section}
      />
      <div className="xl:sticky xl:top-4">
        <ExamScreenPreview
          draft={draft}
          timing={draft ? (timingFor?.(draft.taskType) ?? null) : null}
        />
      </div>
    </div>
  );

  if (question) return workspace;
  // Wait for the task types so the rail, dropdown and preview appear together instead of popping in.
  if (isLoading) return <LoadingState rows={8} />;
  return (
    <TabRailCard
      id="question-editor-section-tabs"
      items={sectionItems}
      value={section}
      onChange={setSection}
      sidePanel={sidePanel}
    >
      {workspace}
    </TabRailCard>
  );
};

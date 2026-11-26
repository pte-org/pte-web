"use client";

import type { AgentFill } from "@/features/questiongeneration/editorAgent";
import { useCallback, useState, type ReactElement } from "react";
import { LoadingState, Tabs } from "@pte/ui";
import type { QuestionResponse } from "@pte/api-client";
import { useQuestionTypes } from "@/features/questiontemplate/api";
import { SCORE_TEMPLATE_ALL_TAB } from "@/features/scoretemplate/constants";
import { useSectionTabItems } from "@/features/scoretemplate/useSectionTabItems";
import { sectionTone } from "@/lib/chipTones";
import type { PreviewTiming, QuestionPreviewDraft } from "../types";
import { ExamScreenPreview } from "./ExamScreenPreview";
import { QuestionEditorForm } from "./QuestionEditorForm";

interface QuestionEditorWithPreviewProps {
  question?: QuestionResponse;
  /** The question is published: saving puts the edits in a new draft revision. */
  saveAsRevision?: boolean;
  onSaved?: (question: QuestionResponse) => void;
  onCancel?: () => void;
  /** Empties the form for the next question (a new question only). */
  onReset?: () => void;
  /** How the skill filter looks: underlined tabs, or a compact switch when another tab row sits above it. */
  skillTabsVariant?: "minimal" | "segmented";
  /** Preparation and answer time of a task type in the exam template, shown in the preview. */
  timingFor?: (taskType: string) => PreviewTiming | null;
  /** The exam section whose tab is selected first; every section when omitted. */
  initialSection?: string;
  /** A question an AI run wrote, put into the form for the person to check and save. */
  agent?: AgentFill | null;
  /** Every form change, as the preview sees it (task type, typed text). */
  onDraftChange?: (draft: QuestionPreviewDraft) => void;
}

/**
 * Skill tabs over the question form and the student's exam screen side by side, the screen kept in view while the
 * form scrolls. An existing question keeps its task type, so it has no skill tabs.
 */
export const QuestionEditorWithPreview = ({
  question,
  saveAsRevision,
  onSaved,
  onCancel,
  onReset,
  skillTabsVariant = "minimal",
  timingFor,
  initialSection,
  agent,
  onDraftChange,
}: QuestionEditorWithPreviewProps): ReactElement => {
  const { data: questionTypes = [], isLoading } = useQuestionTypes(true);
  const [draft, setDraft] = useState<QuestionPreviewDraft | null>(null);
  const [section, setSection] = useState(initialSection ?? SCORE_TEMPLATE_ALL_TAB);
  const handlePreview = useCallback((next: QuestionPreviewDraft) => {
    setDraft(next);
    onDraftChange?.(next);
  }, [onDraftChange]);
  // One dot colour per skill, as on the exam template screens; "All" stays plain.
  const sectionItems = useSectionTabItems((value) =>
    value === null
      ? questionTypes.length
      : questionTypes.filter((type) => type.section === value).length,
  ).map((item) => (item.id === SCORE_TEMPLATE_ALL_TAB ? item : { ...item, tone: sectionTone(item.id) }));

  const workspace = (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,11fr)_minmax(0,9fr)] xl:items-start">
      <section className="rounded-lg border border-[var(--shell-border)] bg-[var(--surface-card)] p-5 shadow-card">
        <QuestionEditorForm
          question={question}
          saveAsRevision={saveAsRevision}
          onSaved={onSaved}
          onCancel={onCancel}
          onReset={onReset}
          onPreviewChange={handlePreview}
          // The AI question's task type may sit in another section than the selected tab: show every type.
          sectionFilter={agent || section === SCORE_TEMPLATE_ALL_TAB ? undefined : section}
          agent={agent}
        />
      </section>
      <div className="flex flex-col gap-2 xl:sticky xl:top-4">
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
    <div className="flex flex-col gap-5">
      <Tabs
        id="question-editor-section-tabs"
        items={sectionItems}
        value={section}
        onChange={setSection}
        variant={skillTabsVariant}
      />
      {workspace}
    </div>
  );
};

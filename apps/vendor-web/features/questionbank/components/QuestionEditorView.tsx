"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactElement } from "react";
import { Alert, LoadingState, PageHeader, useDashboardBreadcrumbLabel } from "@pte/ui";
import { useGeneratedFill } from "@/features/questiongeneration/hooks/useGeneratedFill";
import { useQuestion } from "../api";
import type { QuestionPreviewDraft } from "../types";
import {
  QUESTION_EDITOR_ERRORS as RAW_QUESTION_EDITOR_ERRORS,
  QUESTION_EDITOR_TEXT as RAW_QUESTION_EDITOR_TEXT,
} from "../constants";
import { GenerateWithAiAction } from "./GenerateWithAiAction";
import { QuestionEditorWithPreview } from "./QuestionEditorWithPreview";
import { useAdminCopy } from "@/features/i18n/adminCopy";

export const NewQuestionView = (): ReactElement => {
  const T = useAdminCopy(RAW_QUESTION_EDITOR_TEXT);
  const router = useRouter();
  const pathname = usePathname();
  // What the form holds now: its task type is pre-ticked in the popup, typed text asks before a batch leaves.
  const [draft, setDraft] = useState<QuestionPreviewDraft | null>(null);
  // Bumped after a save: the form opens again empty, ready for the next question.
  const [formRound, setFormRound] = useState(0);
  // Back from the AI run's page: the question it wrote fills the form, nothing is saved until the person says so.
  const fill = useGeneratedFill(useSearchParams().get("fromJob"));
  useDashboardBreadcrumbLabel(pathname, T.NEW_TITLE);

  return (
    <div className="space-y-5">
      <PageHeader
        title={T.FORM_CREATE_TITLE}
        // A helper beside the page title, quieter than the form's own save button.
        actions={<GenerateWithAiAction draft={draft} />}
      />
      <QuestionEditorWithPreview
        key={formRound}
        onSaved={() => {
          // The question written by an AI run is saved: drop it from the address so the new form starts empty.
          if (fill) router.replace(pathname);
          setFormRound((round) => round + 1);
        }}
        onCancel={() => router.push("/admin/questions")}
        // Only the first form takes the AI run's question; the forms opened after saving start empty.
        agent={formRound === 0 ? fill : null}
        onDraftChange={setDraft}
      />
    </div>
  );
};

export const EditQuestionView = ({ publicId }: { publicId: string }): ReactElement => {
  const T = useAdminCopy(RAW_QUESTION_EDITOR_TEXT);
  const E = useAdminCopy(RAW_QUESTION_EDITOR_ERRORS);
  const router = useRouter();
  const pathname = usePathname();
  useDashboardBreadcrumbLabel(pathname, T.EDIT_TITLE);
  const { data: question, isLoading, isError } = useQuestion(publicId);

  if (isLoading) return <LoadingState rows={8} />;
  if (isError || !question) return <Alert tone="error">{E.LOAD_QUESTION}</Alert>;
  if (question.status === "PENDING_APPROVAL")
    return <Alert tone="warning">{E.PENDING_APPROVAL}</Alert>;
  if (question.status === "ARCHIVED") return <Alert tone="warning">{E.ARCHIVED}</Alert>;
  return (
    <div className="space-y-5">
      <PageHeader title={T.FORM_EDIT_TITLE} />
      <QuestionEditorWithPreview
        question={question}
        saveAsRevision={question.status === "APPROVED"}
        // Back to where the writer came from: the question's detail (a published question's edits
        // are saved into a new revision, so that is the page to land on).
        onSaved={(saved) => router.push(`/admin/questions/${saved.publicId}`)}
        onCancel={() => router.push(`/admin/questions/${question.publicId}`)}
      />
    </div>
  );
};

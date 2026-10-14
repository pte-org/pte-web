"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactElement } from "react";
import { Alert, LoadingState, PageHeader } from "@pte/ui";
import { useCreateQuestionRevision, useQuestion } from "../api";
import {
  QUESTION_EDITOR_ERRORS as RAW_QUESTION_EDITOR_ERRORS,
  QUESTION_EDITOR_TEXT as RAW_QUESTION_EDITOR_TEXT,
} from "../constants";
import { QuestionEditorForm } from "./QuestionEditorForm";
import { useAdminCopy } from "@/features/i18n/adminCopy";

export const NewQuestionView = (): ReactElement => {
  const T = useAdminCopy(RAW_QUESTION_EDITOR_TEXT);
  const router = useRouter();
  return (
    <div className="space-y-5">
      <PageHeader title={T.NEW_TITLE} />
      <QuestionEditorForm
        onSaved={() => router.push("/admin/questions")}
        onCancel={() => router.push("/admin/questions")}
      />
    </div>
  );
};

export const EditQuestionView = ({ publicId }: { publicId: string }): ReactElement => {
  const T = useAdminCopy(RAW_QUESTION_EDITOR_TEXT);
  const E = useAdminCopy(RAW_QUESTION_EDITOR_ERRORS);
  const router = useRouter();
  const { data: question, isLoading, isError } = useQuestion(publicId);
  const revisionMutation = useCreateQuestionRevision();
  const [revisionQuestion, setRevisionQuestion] = useState<typeof question>();
  const revisionRequestedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!question || revisionRequestedFor.current === question.publicId) return;
    revisionRequestedFor.current = question.publicId;
    if (question.status === "APPROVED") {
      revisionMutation.mutate(question.publicId, { onSuccess: setRevisionQuestion });
    }
  }, [question, revisionMutation]);

  if (isLoading) return <LoadingState rows={8} />;
  if (isError || !question) return <Alert tone="error">{E.LOAD_QUESTION}</Alert>;
  if (revisionMutation.isError) return <Alert tone="error">{E.CREATE_REVISION}</Alert>;
  if (question.status === "PENDING_APPROVAL")
    return <Alert tone="warning">{E.PENDING_APPROVAL}</Alert>;
  if (question.status === "ARCHIVED") return <Alert tone="warning">{E.ARCHIVED}</Alert>;
  const editableQuestion = question.status === "APPROVED" ? revisionQuestion : question;
  if (!editableQuestion || revisionMutation.isPending) return <LoadingState rows={8} />;
  return (
    <div className="space-y-5">
      <PageHeader title={T.EDIT_TITLE} />
      <QuestionEditorForm
        question={editableQuestion}
        onSaved={() => router.push("/admin/questions")}
        onCancel={() => router.push("/admin/questions")}
      />
    </div>
  );
};

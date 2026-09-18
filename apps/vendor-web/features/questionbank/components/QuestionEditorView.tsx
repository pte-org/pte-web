"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactElement } from "react";
import { Alert, LoadingState, PageHeader } from "@pte/ui";
import { useCreateQuestionRevision, useQuestion } from "../api";
import { QuestionEditorForm } from "./QuestionEditorForm";

export const NewQuestionView = (): ReactElement => {
  const router = useRouter();
  return (
    <div className="space-y-5">
      <PageHeader title="New question" subtitle="Create a draft question for Admin approval." />
      <QuestionEditorForm onSaved={() => router.push("/admin/questions")} />
    </div>
  );
};

export const EditQuestionView = ({ publicId }: { publicId: string }): ReactElement => {
  const router = useRouter();
  const { data: question, isLoading, isError } = useQuestion(publicId);
  const revisionMutation = useCreateQuestionRevision();
  const [editableQuestion, setEditableQuestion] = useState<typeof question>();
  const [revisionRequested, setRevisionRequested] = useState(false);

  useEffect(() => {
    if (!question || revisionRequested) return;
    if (question.status === "APPROVED") {
      setRevisionRequested(true);
      revisionMutation.mutate(question.publicId, { onSuccess: setEditableQuestion });
      return;
    }
    setRevisionRequested(true);
    setEditableQuestion(question);
  }, [question, revisionRequested, revisionMutation]);

  if (isLoading) return <LoadingState rows={8} />;
  if (isError || !question) return <Alert tone="error">Could not load this question.</Alert>;
  if (revisionMutation.isError) return <Alert tone="error">Could not create a draft revision for this question.</Alert>;
  if (question.status === "PENDING_APPROVAL") return <Alert tone="warning">This question is waiting for admin approval and cannot be edited yet.</Alert>;
  if (question.status === "ARCHIVED") return <Alert tone="warning">Archived questions cannot be edited.</Alert>;
  if (!editableQuestion || revisionMutation.isPending) return <LoadingState rows={8} />;
  return (
    <div className="space-y-5">
      <PageHeader title="Edit question" subtitle="Save changes as a draft revision." />
      <QuestionEditorForm question={editableQuestion} onSaved={() => router.push("/admin/questions")} />
    </div>
  );
};

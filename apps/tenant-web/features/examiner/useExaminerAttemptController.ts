"use client";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ExaminerAnswerDetailResponse } from "@pte/api-client";
import { useToast } from "@pte/ui";
import { useExaminerWorkText } from "./hooks/useExaminerWorkText";
import { useExaminerAttempt, useExaminerGuidelines, useExaminerIssues, useReportExaminerIssue, useStartExaminerWork } from "./api";
import type { MediaState } from "./components/AnswerContentRenderer";
import { useExaminerSubmissions } from "./useExaminerSubmissions";
import { formatAttemptTitle } from "./utils/attemptLabels";
/** Stable reference: a fresh `[]` per render makes the draft hook's `answers !== prevAnswers` check loop forever. */
const NO_ANSWERS: ExaminerAnswerDetailResponse[] = [];

export const useExaminerAttemptController = ({
  sessionPublicId,
  attemptPublicId,
  onBack,
}: {
  sessionPublicId: string;
  attemptPublicId: string;
  onBack?: () => void;
}) => {
  const T = useExaminerWorkText();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromStatus = searchParams?.get("fromStatus");
  const fromPage = searchParams?.get("fromPage");

  const query = useExaminerAttempt(sessionPublicId, attemptPublicId);
  const startMutation = useStartExaminerWork(sessionPublicId, attemptPublicId);
  const reportIssueMutation = useReportExaminerIssue(sessionPublicId, attemptPublicId);
  const guidelinesQuery = useExaminerGuidelines(sessionPublicId, attemptPublicId);
  const issuesQuery = useExaminerIssues(sessionPublicId, attemptPublicId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [reportIssueOpen, setReportIssueOpen] = useState(false);
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const [promptMedia, setPromptMedia] = useState<MediaState>("ready");
  const [responseMedia, setResponseMedia] = useState<MediaState>("ready");

  const answers = query.data?.answers ?? NO_ANSWERS;
  const workflow = query.data?.workflow;
  const carriedOverIds = useMemo(
    () => new Set((workflow?.drafts ?? []).filter((d) => d.carriedOver).map((d) => d.answerPublicId)),
    [workflow?.drafts],
  );
  const currentAnswer = answers[currentIndex] ?? null;
  const attemptTitle = query.data
    ? formatAttemptTitle(T.ATTEMPT_LABEL, {
        attemptPublicId,
        sessionName: query.data.sessionName,
        attemptOrdinal: query.data.attemptOrdinal,
      })
    : T.ATTEMPT_LABEL;

  const {
    drafts,
    activeDraft,
    hasUnsaved,
    isStale,
    isSavingDraft,
    isFinalizing,
    handleScoreChange,
    handleTraitChange,
    handleCommentChange,
    handleApplyAiScore,
    handleAcknowledgeStale,
    handleSaveDraft,
    handleFinalizeAttempt,
  } = useExaminerSubmissions({
    answers,
    currentAnswer,
    workflow,
    sessionPublicId,
    attemptPublicId,
    refetchAttempt: () => query.refetch(),
  });

  const executeBack = (): void => {
    if (onBack) {
      onBack();
    } else {
      const params = new URLSearchParams();
      if (fromStatus) params.set("status", fromStatus);
      if (fromPage) params.set("page", fromPage);
      const qs = params.toString();
      router.push(qs ? `/examiner/work?${qs}` : "/examiner/work");
    }
  };

  const handleBack = (): void => {
    if (hasUnsaved) {
      setConfirmLeaveOpen(true);
    } else {
      executeBack();
    }
  };

  const handleSelectIndex = (index: number): void => {
    setCurrentIndex(index);
    setPromptMedia("ready");
    setResponseMedia("ready");
  };

  const handleStartWork = async () => {
    await startMutation.mutateAsync({
      requestPublicId: crypto.randomUUID(),
      expectedWorkVersion: workflow?.workVersion ?? 0,
    });
    void query.refetch();
  };

  const handleSaveClick = async (): Promise<boolean> => {
    const saved = await handleSaveDraft();
    showToast(saved ? T.SAVE_SUCCESS : T.SAVE_FAILED, { tone: saved ? "success" : "error" });
    return saved;
  };

  const handleConfirmFinalize = async () => {
    const success = await handleFinalizeAttempt();
    if (success) {
      setFinalizeOpen(false);
    } else {
      showToast(T.FINALIZE_FAILED, { tone: "error" });
    }
  };

  const handleReportIssue = async (type: import("@pte/api-client").ExaminerGradingIssueType, description: string) => {
    await reportIssueMutation.mutateAsync({
      requestPublicId: crypto.randomUUID(),
      expectedWorkVersion: workflow?.workVersion ?? 0,
      answerPublicId: currentAnswer?.answerPublicId ?? null,
      type,
      description,
    });
    setReportIssueOpen(false);
    void query.refetch();
  };

  const hasOpenIssue = issuesQuery.data?.some((i) => i.status === "OPEN");
  const workflowStatus = workflow?.status ?? (query.data?.submittedAnswerCount === query.data?.eligibleAnswerCount ? "COMPLETED" : "IN_PROGRESS");

  return { T, query, startMutation, reportIssueMutation, guidelinesQuery, currentIndex, confirmLeaveOpen, finalizeOpen, reportIssueOpen, guidelinesOpen, promptMedia, responseMedia, answers, workflow, carriedOverIds, currentAnswer, attemptTitle, drafts, activeDraft, hasUnsaved, isStale, isSavingDraft, isFinalizing, handleScoreChange, handleTraitChange, handleCommentChange, handleApplyAiScore, handleAcknowledgeStale, handleBack, handleSelectIndex, handleStartWork, handleSaveClick, handleConfirmFinalize, handleReportIssue, hasOpenIssue, workflowStatus, executeBack, setConfirmLeaveOpen, setFinalizeOpen, setReportIssueOpen, setGuidelinesOpen, setPromptMedia, setResponseMedia, sessionPublicId, attemptPublicId };
};
export type ExaminerAttemptController = ReturnType<typeof useExaminerAttemptController>;

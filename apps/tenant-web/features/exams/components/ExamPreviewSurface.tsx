"use client";

import { useState, type ReactElement } from "react";
import { Alert, LoadingState, useLocale, useToast } from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { ReportQuestionModal } from "@/features/supportTickets/components/ReportQuestionModal";
import { useSessionExamPreview } from "../api";
import { ExamPreviewContent } from "./ExamPreviewContent";

interface ExamPreviewSurfaceProps {
  sessionPublicId: string;
  snapshotPublicId: string | null;
  enabled: boolean;
  showReportAction?: boolean;
}

export const ExamPreviewSurface = ({
  sessionPublicId,
  snapshotPublicId,
  enabled,
  showReportAction = true,
}: ExamPreviewSurfaceProps): ReactElement => {
  const { t } = useLocale();
  const { showToast } = useToast();
  const preview = useSessionExamPreview(sessionPublicId, enabled && Boolean(snapshotPublicId));
  const [reportingQuestionId, setReportingQuestionId] = useState<string | null>(null);
  const [reportedQuestionIds, setReportedQuestionIds] = useState<Set<string>>(new Set());

  const handleReportSuccess = (): void => {
    if (reportingQuestionId) {
      setReportedQuestionIds((previous) => new Set(previous).add(reportingQuestionId));
    }
    setReportingQuestionId(null);
    showToast(t("tenant.support.reportQuestion.successToast", "Support report submitted"), {
      tone: "success",
    });
  };

  const content = !snapshotPublicId ? (
    <Alert tone="info" title={t("tenant.examQuestions.title", "Exam questions")}>
      {t("tenant.examQuestions.unavailable", "Published exam questions are not available yet.")}
    </Alert>
  ) : preview.isLoading ? (
    <LoadingState rows={5} label={t("tenant.examQuestions.title", "Exam questions")} />
  ) : preview.isError ? (
    <Alert tone="error" title={t("tenant.examQuestions.error", "Unable to load exam questions.")}>
      {errorMessage(
        preview.error,
        t("tenant.examQuestions.error", "Unable to load exam questions."),
      )}
    </Alert>
  ) : !preview.data ? (
    <Alert tone="info" title={t("tenant.examQuestions.title", "Exam questions")}>
      {t("tenant.examQuestions.unavailable", "Published exam questions are not available yet.")}
    </Alert>
  ) : preview.data.items.length === 0 ? (
    <Alert tone="info" title={t("tenant.examQuestions.title", "Exam questions")}>
      {t("tenant.examQuestions.empty", "No questions are available for this exam.")}
    </Alert>
  ) : (
    <ExamPreviewContent
      preview={preview.data}
      showReportAction={showReportAction}
      onReport={setReportingQuestionId}
      isReported={(questionPublicId) => reportedQuestionIds.has(questionPublicId)}
    />
  );

  return (
    <>
      {content}
      {reportingQuestionId && (
        <ReportQuestionModal
          questionPublicId={reportingQuestionId}
          open={true}
          onClose={() => setReportingQuestionId(null)}
          onSuccess={handleReportSuccess}
        />
      )}
    </>
  );
};

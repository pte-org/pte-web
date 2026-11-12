"use client";

import type { ReactElement } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Alert,
  Badge,
  Button,
  Chip,
  ChevronLeftIcon,
  CopyableId,
  DetailGroup,
  cn,
  useDashboardBreadcrumbLabel,
} from "@pte/ui";
import { useCurrentUser } from "@/features/auth/api";
import { canReviewAcademic } from "@/features/auth/permissions";
import { useQuestionTypes } from "@/features/questiontemplate/api";
import { mapPool, useQuestion } from "../api";
import {
  QUESTION_DETAIL_TEXT as RAW_QUESTION_DETAIL_TEXT,
  QUESTION_POOL_LABELS as RAW_QUESTION_POOL_LABELS,
  QUESTION_STATUS_LABELS as RAW_QUESTION_STATUS_LABELS,
  QUESTION_STATUS_VARIANT,
} from "../constants";
import { usePromptMedia } from "../hooks/usePromptMediaUrl";
import { buildQuestionPreviewDraft } from "../questionPreviewDraft";
import { POOL_TONE, cefrTone, sectionTone, TASK_TYPE_TONE } from "@/lib/chipTones";
import type { QuestionStatus } from "../types";
import { ExamScreenPreview } from "./ExamScreenPreview";
import { QuestionDetailSkeleton } from "./_QuestionDetailSkeleton";
import { AnswerKeyGroups, hasAnswerHints } from "./_AnswerKeyGroups";
import { useAdminCopy } from "@/features/i18n/adminCopy";

/** One card of the detail column; every group (content, options, transcript, answer, hints) gets its own. */
const DETAIL_CARD_CLASS =
  "flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-card";

interface QuestionDetailViewProps {
  publicId: string;
}

function statusKey(value: string): QuestionStatus | null {
  const normalized = value.toLowerCase() as QuestionStatus;
  return normalized in RAW_QUESTION_STATUS_LABELS ? normalized : null;
}

export const QuestionDetailView = ({ publicId }: QuestionDetailViewProps) => {
  const T = useAdminCopy(RAW_QUESTION_DETAIL_TEXT);
  const statusLabels = useAdminCopy(RAW_QUESTION_STATUS_LABELS);
  const poolLabels = useAdminCopy(RAW_QUESTION_POOL_LABELS);
  const sectionLabels = useAdminCopy({
    SPEAKING: "Speaking",
    WRITING: "Writing",
    READING: "Reading",
    LISTENING: "Listening",
  });
  const { data: question, isLoading, isError } = useQuestion(publicId);
  const pathname = usePathname();
  const router = useRouter();
  // Where the page was opened from, so the way back leads there; only paths inside the admin area count.
  const from = useSearchParams().get("from");
  const backTarget =
    from && from.startsWith("/admin/") && !from.startsWith("//") ? from : "/admin/questions";
  const { data: currentUser } = useCurrentUser();
  const { data: questionTypes = [], isLoading: questionTypesLoading } = useQuestionTypes(false);
  const questionTypeCode = question?.taskTypeKey ?? question?.pteTaskType;
  // The page is named after the task type, since a question has no title of its own.
  useDashboardBreadcrumbLabel(
    pathname,
    questionTypes.find(
      (type) => type.code === questionTypeCode || type.taskTypeKey === questionTypeCode,
    )?.displayName ?? questionTypeCode,
  );
  const { url: audioUrl, isLoading: audioLoading } = usePromptMedia(
    question?.audioPromptRef ?? null,
  );
  const { url: imageUrl, isLoading: imageLoading } = usePromptMedia(
    question?.imagePromptRef ?? null,
  );

  // Wait for the task types and the media too: they name the page, supply the instruction and fill
  // the student's screen, so showing the page without them would redraw it a moment later.
  if (isLoading || questionTypesLoading || audioLoading || imageLoading) {
    return <QuestionDetailSkeleton />;
  }
  if (isError) return <Alert tone="error">{T.LOAD_ERROR}</Alert>;
  if (!question) return <Alert tone="error">{T.NOT_FOUND}</Alert>;

  const currentStatus = statusKey(String(question.status));
  const taskType = question.taskTypeKey ?? question.pteTaskType ?? T.EMPTY_VALUE;
  const canEdit = question.status === "DRAFT" || question.status === "APPROVED";
  const showAnswerKey = canReviewAcademic(currentUser?.roles);
  // The file itself rather than its id; the id is only a fallback when the file could not be loaded.
  const mediaId = (ref: string): ReactElement => (
    <span className="break-all font-mono text-xs">{ref}</span>
  );
  const audioValue = (ref: string): ReactElement =>
    audioUrl ? (
      <audio
        className="w-full max-w-md"
        controls
        preload="metadata"
        src={audioUrl}
        aria-label={T.AUDIO_LABEL}
      />
    ) : (
      mediaId(ref)
    );
  const imageValue = (ref: string): ReactElement =>
    imageUrl ? (
      <img
        className="max-h-40 rounded-md border border-[var(--shell-border)] object-contain"
        src={imageUrl}
        alt={T.IMAGE_ALT}
      />
    ) : (
      mediaId(ref)
    );
  // The detail page shows what a question has; fields it leaves empty are not listed.
  const contentItems = [
    ...(question.promptText?.trim()
      ? [
          {
            label: T.PROMPT_TEXT,
            value: <span className="whitespace-pre-wrap">{question.promptText}</span>,
            fullWidth: true,
          },
        ]
      : []),
    ...(question.audioPromptRef
      ? [{ label: T.AUDIO_PROMPT, value: audioValue(question.audioPromptRef), fullWidth: true }]
      : []),
    ...(question.imagePromptRef
      ? [{ label: T.IMAGE_PROMPT, value: imageValue(question.imagePromptRef), fullWidth: true }]
      : []),
    ...(question.minWordCount != null
      ? [{ label: T.MIN_WORD_COUNT, value: String(question.minWordCount) }]
      : []),
    ...(question.maxWordCount != null
      ? [{ label: T.MAX_WORD_COUNT, value: String(question.maxWordCount) }]
      : []),
  ];
  const hasAnswerKey = Boolean(
    question.referenceAnswerText?.trim() || question.correctAnswerText?.trim(),
  );
  const hasAnswers =
    question.options.length > 0 || (showAnswerKey && hasAnswerKey) || hasAnswerHints(question);
  const previewDraft = buildQuestionPreviewDraft(
    question,
    questionTypes.find((type) => type.code === taskType || type.taskTypeKey === taskType),
    { imageUrl, audioUrl },
  );
  const section = question.section
    ? (sectionLabels[question.section as keyof typeof sectionLabels] ?? question.section)
    : T.EMPTY_VALUE;

  return (
    <div className="space-y-4">
      <Button
        size="sm"
        variant="secondary"
        appearance="ghost"
        leftIcon={<ChevronLeftIcon className="h-4 w-4" />}
        onClick={() => router.push(backTarget)}
      >
        {backTarget === "/admin/questions" ? T.BACK_TO_BANK : T.BACK_TO_STUDIO}
      </Button>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:items-start">
        <div className="flex flex-col gap-5">
          <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-gray-900">{T.INFORMATION_TITLE}</h2>
              <div className="flex flex-wrap items-center gap-2">
                {currentStatus && (
                  <Badge variant={QUESTION_STATUS_VARIANT[currentStatus]}>
                    {statusLabels[currentStatus]}
                  </Badge>
                )}
                {canEdit && (
                  <Button onClick={() => router.push(`/admin/questions/${question.publicId}/edit`)}>
                    {T.EDIT}
                  </Button>
                )}
              </div>
            </div>
            <DetailGroup
              title={T.GROUP_IDENTITY}
              items={[{ label: T.QUESTION_CODE, value: <CopyableId value={question.publicId} /> }]}
            />
            <DetailGroup
              title={T.GROUP_CLASSIFICATION}
              items={[
                {
                  label: T.TASK_TYPE,
                  value: <Chip tone={TASK_TYPE_TONE}>{taskType}</Chip>,
                },
                {
                  label: T.SECTION,
                  value: <Chip tone={sectionTone(question.section)}>{section}</Chip>,
                },
                {
                  label: T.POOL,
                  value: <Chip tone={POOL_TONE}>{poolLabels[mapPool(question)]}</Chip>,
                },
                {
                  label: T.CEFR_LEVEL,
                  value: question.cefrLevel ? (
                    <Chip tone={cefrTone(question.cefrLevel)}>{question.cefrLevel}</Chip>
                  ) : (
                    T.CEFR_UNSET
                  ),
                },
                {
                  label: T.REVISION,
                  value: (
                    <Chip tone={TASK_TYPE_TONE} outlined>
                      {question.revisionNumber ?? T.EMPTY_VALUE}
                    </Chip>
                  ),
                },
                ...(question.rejectionReason?.trim()
                  ? [
                      {
                        label: T.REJECTION_REASON,
                        value: question.rejectionReason,
                        fullWidth: true,
                      },
                    ]
                  : []),
              ]}
            />
          </section>

          {contentItems.length > 0 && (
            <section className={DETAIL_CARD_CLASS}>
              <DetailGroup title={T.GROUP_CONTENT} items={contentItems} />
            </section>
          )}

          {question.options.length > 0 && (
            <section className={DETAIL_CARD_CLASS}>
              <h3 className="text-sm font-semibold text-[var(--ink-primary)]">{T.OPTIONS}</h3>
              <ol className="space-y-2">
                {question.options
                  .slice()
                  .sort((left, right) => left.orderIndex - right.orderIndex)
                  .map((option, index) => (
                    <li
                      key={option.publicId}
                      className={cn(
                        "flex items-center gap-3 rounded-md border px-3 py-2 text-sm",
                        showAnswerKey && option.correct
                          ? "border-green-200 bg-green-50"
                          : "border-slate-200 bg-white",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                          showAnswerKey && option.correct
                            ? "bg-green-600 text-white"
                            : "bg-slate-100 text-slate-500",
                        )}
                      >
                        {index + 1}
                      </span>
                      <span className="flex-1 text-gray-800">{option.text}</span>
                      {showAnswerKey && option.correct && (
                        <Badge variant="success">{T.CORRECT}</Badge>
                      )}
                    </li>
                  ))}
              </ol>
            </section>
          )}
          {hasAnswers && (
            <AnswerKeyGroups
              question={question}
              showAnswerKey={showAnswerKey}
              cardClassName={DETAIL_CARD_CLASS}
            />
          )}
        </div>
        <div className="xl:sticky xl:top-4">
          <ExamScreenPreview draft={previewDraft} />
        </div>
      </div>
    </div>
  );
};

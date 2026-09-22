"use client";

import Link from "next/link";
import { Alert, Badge, DescriptionList, LoadingState, PageHeader } from "@pte/ui";
import { getUserFacingApiErrorMessage } from "@pte/api-client";
import { useMediaPreview, useQuestion } from "../api";
import {
  QUESTION_DETAIL_TEXT as T,
  QUESTION_STATUS_LABELS,
  QUESTION_STATUS_VARIANT,
} from "../constants";
import type { QuestionStatus } from "../types";

interface QuestionDetailViewProps {
  publicId: string;
}

function statusKey(value: string): QuestionStatus | null {
  const normalized = value.toLowerCase() as QuestionStatus;
  return normalized in QUESTION_STATUS_LABELS ? normalized : null;
}

function valueOrEmpty(value: string | null | undefined): string {
  return value?.trim() ? value : T.EMPTY_VALUE;
}

interface MediaPreviewProps {
  kind: "audio" | "image";
  publicId: string;
}

const MediaPreview = ({ kind, publicId }: MediaPreviewProps) => {
  const { data, isLoading, isError, error } = useMediaPreview(publicId);

  if (isLoading) return <p className="text-sm text-slate-500">{T.MEDIA_LOADING}</p>;
  if (isError || !data) {
    return <Alert tone="warning">{getUserFacingApiErrorMessage(error, T.MEDIA_UNAVAILABLE)}</Alert>;
  }

  if (kind === "audio") {
    return (
      <div className="space-y-2">
        <audio
          className="w-full"
          controls
          preload="metadata"
          src={data.url}
          aria-label={T.AUDIO_LABEL}
        />
        {data.durationSeconds != null && (
          <p className="text-xs text-slate-500">{T.MEDIA_DURATION(data.durationSeconds)}</p>
        )}
      </div>
    );
  }

  return (
    <img
      className="max-h-80 w-full rounded-md border border-slate-200 bg-slate-50 object-contain"
      src={data.url}
      alt={T.IMAGE_ALT}
    />
  );
};

export const QuestionDetailView = ({ publicId }: QuestionDetailViewProps) => {
  const { data: question, isLoading, isError } = useQuestion(publicId);

  if (isLoading) return <LoadingState rows={8} />;
  if (isError) return <Alert tone="error">{T.LOAD_ERROR}</Alert>;
  if (!question) return <Alert tone="error">{T.NOT_FOUND}</Alert>;

  const rawStatus = String(question.status);
  const currentStatus = statusKey(rawStatus);
  const taskType = question.taskTypeKey ?? question.pteTaskType ?? T.EMPTY_VALUE;
  const canEdit = question.status === "DRAFT" || question.status === "APPROVED";
  const hasMedia = Boolean(question.audioPromptRef || question.imagePromptRef);

  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin/questions" className="text-sm font-medium text-action hover:underline">
        {T.BACK}
      </Link>
      <PageHeader
        title={question.title}
        subtitle={T.SUBTITLE(taskType)}
        actions={
          <>
            {currentStatus && (
              <Badge variant={QUESTION_STATUS_VARIANT[currentStatus]}>
                {QUESTION_STATUS_LABELS[currentStatus]}
              </Badge>
            )}
            {canEdit && (
              <Link
                href={`/admin/questions/${question.publicId}/edit`}
                className="rounded-md bg-action px-4 py-2 text-sm font-semibold text-white hover:bg-action-hover"
              >
                {T.EDIT}
              </Link>
            )}
          </>
        }
      />

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
        <h2 className="mb-4 text-base font-semibold text-gray-900">{T.INFORMATION_TITLE}</h2>
        <DescriptionList
          items={[
            { label: T.QUESTION_CODE, value: question.publicId },
            { label: T.TASK_TYPE, value: taskType },
            { label: T.SECTION, value: valueOrEmpty(question.section) },
            { label: T.VISIBILITY, value: valueOrEmpty(question.visibility) },
            {
              label: T.STATUS,
              value: currentStatus ? QUESTION_STATUS_LABELS[currentStatus] : rawStatus,
            },
            { label: T.REVISION, value: String(question.revisionNumber ?? T.EMPTY_VALUE) },
            {
              label: T.WORD_COUNT,
              value:
                question.minWordCount != null && question.maxWordCount != null
                  ? T.WORD_COUNT_RANGE(question.minWordCount, question.maxWordCount)
                  : T.EMPTY_VALUE,
            },
          ]}
        />
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
          <h2 className="mb-4 text-base font-semibold text-gray-900">{T.PROMPT_TITLE}</h2>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {T.PROMPT_TEXT}
            </h3>
            <p className="mt-2 whitespace-pre-wrap rounded-md bg-slate-50 p-4 text-sm leading-6 text-gray-800">
              {question.promptText?.trim() ? question.promptText : T.NO_PROMPT}
            </p>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
          <h2 className="mb-4 text-base font-semibold text-gray-900">{T.MEDIA_TITLE}</h2>
          {!hasMedia && <p className="text-sm text-slate-500">{T.NO_MEDIA}</p>}
          {question.audioPromptRef && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {T.AUDIO_PROMPT}
              </h3>
              <MediaPreview kind="audio" publicId={question.audioPromptRef} />
              <p className="break-all text-xs text-slate-500">
                {T.MEDIA_ID(question.audioPromptRef)}
              </p>
            </div>
          )}
          {question.imagePromptRef && (
            <div className="mt-5 space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {T.IMAGE_PROMPT}
              </h3>
              <MediaPreview kind="image" publicId={question.imagePromptRef} />
              <p className="break-all text-xs text-slate-500">
                {T.MEDIA_ID(question.imagePromptRef)}
              </p>
            </div>
          )}
        </section>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
        <h2 className="mb-4 text-base font-semibold text-gray-900">{T.ANSWERS_TITLE}</h2>
        {question.options.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {T.OPTIONS}
            </h3>
            <ol className="space-y-2">
              {question.options
                .slice()
                .sort((left, right) => left.orderIndex - right.orderIndex)
                .map((option, index) => (
                  <li
                    key={option.publicId}
                    className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm"
                  >
                    <span>
                      {index + 1}. {option.text}
                    </span>
                    {option.correct && <Badge variant="success">{T.CORRECT}</Badge>}
                  </li>
                ))}
            </ol>
          </div>
        )}
        <DescriptionList
          items={[
            { label: T.REFERENCE_ANSWER, value: valueOrEmpty(question.referenceAnswerText) },
            { label: T.CORRECT_ANSWER, value: valueOrEmpty(question.correctAnswerText) },
          ]}
        />
      </section>
    </div>
  );
};

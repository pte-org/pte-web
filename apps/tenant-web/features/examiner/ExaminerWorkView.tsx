"use client";

import { useState, type ReactElement } from "react";
import type {
  ExaminerAnswerDetailResponse,
  ExaminerQueueItemResponse,
  ExaminerQueueStatus,
} from "@pte/api-client";
import { PageHeader } from "@pte/ui";
import { EXAMINER_QUEUE_STATUSES, EXAMINER_WORK_TEXT as T } from "./constants";
import { useExaminerAttempt, useExaminerQueue, useSubmitExaminerScore } from "./api";

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function shortId(value: string): string {
  return value.slice(0, 8).toUpperCase();
}

function statusLabel(status: ExaminerQueueItemResponse["status"]): string {
  if (status === "PENDING") return T.STATUS_PENDING;
  if (status === "IN_PROGRESS") return T.STATUS_IN_PROGRESS;
  return T.STATUS_COMPLETED;
}

const QueueItem = ({
  item,
  onOpen,
}: {
  item: ExaminerQueueItemResponse;
  onOpen: (sessionPublicId: string, attemptPublicId: string) => void;
}): ReactElement => (
  <li className="flex flex-col gap-3 border-b border-slate-100 p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
    <div className="min-w-0">
      <p className="font-medium text-slate-900">
        {T.ATTEMPT_LABEL} #{shortId(item.attemptPublicId)}
      </p>
      <p className="mt-1 text-sm text-slate-600">
        {T.SESSION_LABEL} #{shortId(item.sessionPublicId)} · {T.PROGRESS_LABEL}:{" "}
        {item.submittedAnswerCount}/{item.eligibleAnswerCount}
      </p>
      <p className="mt-1 text-xs text-slate-500">Assigned {formatDate(item.assignedAt)}</p>
    </div>
    <div className="flex items-center gap-3">
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
        {statusLabel(item.status)}
      </span>
      <button
        type="button"
        onClick={() => onOpen(item.sessionPublicId, item.attemptPublicId)}
        className="rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
      >
        {T.OPEN_ATTEMPT}
      </button>
    </div>
  </li>
);

const AnswerCard = ({
  answer,
  sessionPublicId,
  attemptPublicId,
}: {
  answer: ExaminerAnswerDetailResponse;
  sessionPublicId: string;
  attemptPublicId: string;
}): ReactElement => {
  const [score, setScore] = useState(answer.myScore === null ? "" : String(answer.myScore));
  const saveScore = useSubmitExaminerScore(sessionPublicId, attemptPublicId);
  const hasSavedScore = answer.myScore !== null;
  const parsedScore = score.trim() === "" ? Number.NaN : Number(score);
  const scoreIsValid = Number.isInteger(parsedScore) && parsedScore >= 0 && parsedScore <= 100;

  const submit = (): void => {
    if (!scoreIsValid || hasSavedScore || saveScore.isPending) return;
    saveScore.mutate({ answerPublicId: answer.answerPublicId, score: parsedScore });
  };

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-slate-900">
          {answer.prompt.orderIndex + 1}. {answer.taskType.replaceAll("_", " ")}
        </h3>
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {answer.prompt.section}
        </span>
      </div>

      <section className="mt-4 rounded-md bg-slate-50 p-4" aria-label={T.PROMPT}>
        <h4 className="text-sm font-semibold text-slate-800">{answer.prompt.title || T.PROMPT}</h4>
        {answer.prompt.promptText && (
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
            {answer.prompt.promptText}
          </p>
        )}
        {answer.prompt.minWordCount !== null && answer.prompt.maxWordCount !== null && (
          <p className="mt-2 text-xs text-slate-500">
            Word count: {answer.prompt.minWordCount}–{answer.prompt.maxWordCount}
          </p>
        )}
        {answer.prompt.options.length > 0 && (
          <ol className="mt-3 list-inside list-decimal space-y-1 text-sm text-slate-700">
            {answer.prompt.options.map((option) => (
              <li key={`${option.orderIndex}-${option.blankIndex ?? "none"}`}>{option.text}</li>
            ))}
          </ol>
        )}
        {answer.prompt.audioPromptUrl && (
          <audio className="mt-3 w-full" controls preload="none" src={answer.prompt.audioPromptUrl}>
            {T.AUDIO_UNAVAILABLE}
          </audio>
        )}
        {answer.prompt.imagePromptUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="mt-3 max-h-96 w-auto max-w-full rounded-md border border-slate-200 object-contain"
            src={answer.prompt.imagePromptUrl}
            alt={T.IMAGE_ALT}
          />
        )}
      </section>

      <section className="mt-4" aria-label={T.STUDENT_RESPONSE}>
        <h4 className="text-sm font-semibold text-slate-800">{T.STUDENT_RESPONSE}</h4>
        {answer.response.kind === "AUDIO" ? (
          answer.response.mediaUrl ? (
            <audio className="mt-2 w-full" controls preload="none" src={answer.response.mediaUrl}>
              {T.AUDIO_UNAVAILABLE}
            </audio>
          ) : (
            <p className="mt-2 text-sm text-slate-600">{T.AUDIO_UNAVAILABLE}</p>
          )
        ) : answer.response.kind === "SELECTION" ? (
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {answer.response.options.map((option) => (
              <li
                key={option.orderIndex}
                className={option.selected ? "font-semibold text-blue-800" : ""}
              >
                {option.selected ? "Selected: " : ""}
                {option.text}
              </li>
            ))}
          </ul>
        ) : answer.response.kind === "POSITIONAL_SELECTION" ? (
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
            {answer.response.gapValues
              ?.map((value, index) => `${index + 1}. ${value ?? "—"}`)
              .join(" · ")}
          </p>
        ) : answer.response.kind === "WORD_INDICES" ? (
          <p className="mt-2 text-sm text-slate-700">
            Selected word indexes: {answer.response.wordIndices?.join(", ") || "—"}
          </p>
        ) : (
          <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-700">
            {answer.response.text || "—"}
          </p>
        )}
      </section>

      <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-end">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          {T.SCORE_LABEL}
          <input
            aria-label={`${T.SCORE_LABEL}: ${answer.taskType}`}
            type="number"
            min={0}
            max={100}
            step={1}
            value={score}
            readOnly={hasSavedScore}
            onChange={(event) => setScore(event.target.value)}
            className="w-36 rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 read-only:bg-slate-100"
          />
        </label>
        {hasSavedScore ? (
          <p className="pb-2 text-sm font-medium text-emerald-700">
            {T.SAVED}: {answer.myScore}/100. {T.READ_ONLY}
          </p>
        ) : (
          <button
            type="button"
            disabled={!scoreIsValid || saveScore.isPending}
            onClick={submit}
            className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {saveScore.isPending ? T.SUBMITTING : T.SUBMIT_SCORE}
          </button>
        )}
      </div>
      {!hasSavedScore && score.length > 0 && !scoreIsValid && (
        <p className="mt-2 text-sm text-red-700">{T.SCORE_INVALID}</p>
      )}
      {saveScore.isError && (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {T.SUBMIT_ERROR}
        </p>
      )}
    </article>
  );
};

const AttemptDetail = ({
  sessionPublicId,
  attemptPublicId,
  onBack,
}: {
  sessionPublicId: string;
  attemptPublicId: string;
  onBack: () => void;
}): ReactElement => {
  const query = useExaminerAttempt(sessionPublicId, attemptPublicId);

  return (
    <section className="mt-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">
            {T.ATTEMPT_LABEL} #{shortId(attemptPublicId)}
          </p>
          {query.data && (
            <p className="mt-1 text-sm text-slate-600">
              {T.PROGRESS_LABEL}: {query.data.submittedAnswerCount}/{query.data.eligibleAnswerCount}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          {T.BACK_TO_QUEUE}
        </button>
      </div>
      {query.isLoading && (
        <p className="rounded-md bg-white p-5 text-sm text-slate-600">{T.LOADING_DETAIL}</p>
      )}
      {query.isError && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800" role="alert">
          {T.DETAIL_ERROR}{" "}
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}
      {query.data?.answers.length === 0 && (
        <p className="rounded-md bg-white p-5 text-sm text-slate-600">{T.NO_ANSWERS}</p>
      )}
      {query.data?.answers.map((answer) => (
        <AnswerCard
          key={answer.answerPublicId}
          answer={answer}
          sessionPublicId={sessionPublicId}
          attemptPublicId={attemptPublicId}
        />
      ))}
    </section>
  );
};

export const ExaminerWorkView = (): ReactElement => {
  const [status, setStatus] = useState<ExaminerQueueStatus>("PENDING");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<{
    sessionPublicId: string;
    attemptPublicId: string;
  } | null>(null);
  const queue = useExaminerQueue(status, page);

  const chooseStatus = (next: ExaminerQueueStatus): void => {
    setStatus(next);
    setPage(0);
    setSelected(null);
  };

  return (
    <div className="mx-auto w-full max-w-6xl p-5 sm:p-8">
      <PageHeader title={T.TITLE} subtitle={T.SUBTITLE} />
      <div className="mt-6 flex flex-col gap-2 sm:max-w-xs">
        <label htmlFor="examiner-queue-status" className="text-sm font-medium text-slate-700">
          {T.FILTER_LABEL}
        </label>
        <select
          id="examiner-queue-status"
          value={status}
          onChange={(event) => chooseStatus(event.target.value as ExaminerQueueStatus)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm"
        >
          {EXAMINER_QUEUE_STATUSES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {!selected && (
        <section className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          {queue.isLoading ? (
            <p className="p-5 text-sm text-slate-600">{T.LOADING_QUEUE}</p>
          ) : queue.isError ? (
            <div className="p-5 text-sm text-red-800" role="alert">
              {T.QUEUE_ERROR}{" "}
              <button
                type="button"
                onClick={() => void queue.refetch()}
                className="font-semibold underline"
              >
                Retry
              </button>
            </div>
          ) : queue.data?.items.length === 0 ? (
            <p className="p-5 text-sm text-slate-600">{T.EMPTY_QUEUE}</p>
          ) : (
            <>
              <ul>
                {queue.data?.items.map((item) => (
                  <QueueItem
                    key={`${item.sessionPublicId}:${item.attemptPublicId}`}
                    item={item}
                    onOpen={(sessionPublicId, attemptPublicId) =>
                      setSelected({ sessionPublicId, attemptPublicId })
                    }
                  />
                ))}
              </ul>
              <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-600">
                <span>
                  Page {(queue.data?.page ?? 0) + 1} of {Math.max(1, queue.data?.totalPages ?? 1)}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={!queue.data || queue.data.page <= 0}
                    onClick={() => setPage((value) => Math.max(0, value - 1))}
                    className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={!queue.data || queue.data.page + 1 >= queue.data.totalPages}
                    onClick={() => setPage((value) => value + 1)}
                    className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      )}

      {selected && (
        <AttemptDetail
          sessionPublicId={selected.sessionPublicId}
          attemptPublicId={selected.attemptPublicId}
          onBack={() => setSelected(null)}
        />
      )}
    </div>
  );
};

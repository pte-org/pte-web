"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Badge, LoadingState, Modal, NumberInput, cn } from "@pte/ui";
import type { AnswerOptionView } from "@pte/api-client";
import {
  ANSWER_DETAIL_TEXT,
  ANSWER_STATUS_LABELS,
  ANSWER_STATUS_VARIANT,
} from "../constants";
import { useAnswer, useSubmitTeacherScore } from "../api";

interface AnswerDetailModalProps {
  answerPublicId: string | null;
  onClose: () => void;
}

const T = ANSWER_DETAIL_TEXT;

function errorMessage(error: unknown): string | undefined {
  return error instanceof Error ? error.message : undefined;
}

function OptionRow({ option }: { option: AnswerOptionView }): ReactElement {
  return (
    <li
      className={cn(
        "flex items-center justify-between rounded-md border px-3 py-2 text-sm",
        option.selectedByStudent ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-white",
      )}
    >
      <span className="text-gray-800">{option.text}</span>
      <span className="flex gap-1.5">
        {option.selectedByStudent && <Badge variant="info">{T.SELECTED_BADGE}</Badge>}
        {option.correct && <Badge variant="success">{T.CORRECT_BADGE}</Badge>}
      </span>
    </li>
  );
}

export const AnswerDetailModal = ({ answerPublicId, onClose }: AnswerDetailModalProps): ReactElement => {
  const { data: answer, isLoading } = useAnswer(answerPublicId);
  const submitScore = useSubmitTeacherScore(answerPublicId ?? "");
  const [scoreInput, setScoreInput] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const score = Number(scoreInput);
    if (Number.isNaN(score)) return;
    submitScore.mutate(score);
  };

  return (
    <Modal open={answerPublicId !== null} onClose={onClose} title={T.TITLE} size="lg">
      {isLoading || !answer ? (
        <LoadingState rows={4} />
      ) : (
        <div className="flex flex-col gap-5">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">{T.TASK_TYPE_LABEL}</dt>
              <dd className="font-medium text-gray-900">{answer.taskType}</dd>
            </div>
            <div>
              <dt className="text-gray-500">{T.STATUS_LABEL}</dt>
              <dd>
                <Badge variant={ANSWER_STATUS_VARIANT[answer.status]}>
                  {ANSWER_STATUS_LABELS[answer.status]}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">{T.AI_SCORE_LABEL}</dt>
              <dd className="font-medium text-gray-900">
                {answer.rawScore === null ? T.NOT_SCORED : answer.rawScore}
              </dd>
            </div>
          </dl>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            {answer.payload.kind === "AUDIO" &&
              (answer.payload.mediaUrl ? (
                <audio controls src={answer.payload.mediaUrl} className="w-full" />
              ) : (
                <Alert tone="warning">{T.AUDIO_UNAVAILABLE}</Alert>
              ))}

            {answer.payload.kind === "SELECTION" && answer.payload.options && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {T.OPTIONS_TITLE}
                </p>
                <ul className="flex flex-col gap-2">
                  {answer.payload.options.map((option) => (
                    <OptionRow key={option.orderIndex ?? option.text} option={option} />
                  ))}
                </ul>
              </div>
            )}

            {answer.payload.kind === "TEXT" && (
              <p className="whitespace-pre-wrap text-sm text-gray-800">{answer.payload.text}</p>
            )}

            {answer.payload.kind === "UNRECOGNIZED" && (
              <div className="flex flex-col gap-2">
                <Alert tone="warning">{T.UNRECOGNIZED_NOTICE}</Alert>
                <p className="whitespace-pre-wrap text-sm text-gray-800">{answer.payload.text}</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 border-t border-gray-100 pt-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{T.TEACHER_SCORE_TITLE}</h3>
              <p className="text-xs text-gray-500">{T.TEACHER_SCORE_HELPER}</p>
            </div>
            {submitScore.isError && <Alert tone="error">{errorMessage(submitScore.error)}</Alert>}
            {submitScore.isSuccess && <Alert tone="success">{T.SAVED}</Alert>}
            <div className="flex items-end gap-3">
              <div className="w-40">
                <NumberInput
                  label={T.TEACHER_SCORE_LABEL}
                  min={0}
                  max={100}
                  value={scoreInput}
                  placeholder={answer.teacherScore === null ? undefined : String(answer.teacherScore)}
                  onChange={(event) => setScoreInput(event.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={submitScore.isPending || scoreInput === ""}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitScore.isPending ? T.SUBMITTING : T.SUBMIT}
              </button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
};

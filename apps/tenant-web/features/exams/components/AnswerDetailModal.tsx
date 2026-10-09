"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Badge, LoadingState, Modal, NumberInput, cn, useLocale } from "@pte/ui";
import type { AnswerOptionView } from "@pte/api-client";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { ANSWER_DETAIL_TEXT, ANSWER_STATUS_LABELS, ANSWER_STATUS_VARIANT } from "../constants";
import { useAnswer, useSubmitTeacherScore } from "../api";

interface AnswerDetailModalProps {
  answerPublicId: string | null;
  onClose: () => void;
}

const T = ANSWER_DETAIL_TEXT;

function OptionRow({
  option,
  selectedLabel,
  correctLabel,
}: {
  option: AnswerOptionView;
  selectedLabel: string;
  correctLabel: string;
}): ReactElement {
  return (
    <li
      className={cn(
        "flex items-center justify-between rounded-md border px-3 py-2 text-sm",
        option.selectedByStudent
          ? "border-[var(--brand-soft)] bg-[var(--brand-tint)]"
          : "border-[var(--shell-border)] bg-[var(--surface-card)]",
      )}
    >
      <span className="text-[var(--ink-primary)]">{option.text}</span>
      <span className="flex gap-1.5">
        {option.selectedByStudent && <Badge variant="info">{selectedLabel}</Badge>}
        {option.correct && <Badge variant="success">{correctLabel}</Badge>}
      </span>
    </li>
  );
}

export const AnswerDetailModal = ({
  answerPublicId,
  onClose,
}: AnswerDetailModalProps): ReactElement => {
  const { t } = useLocale();
  const { data: answer, isLoading } = useAnswer(answerPublicId);
  const submitScore = useSubmitTeacherScore(answerPublicId ?? "");
  const [scoreInput, setScoreInput] = useState("");
  const statusLabel = (status: string): string => {
    const keyByStatus: Record<string, string> = {
      PENDING: "tenant.answers.pending",
      AI_SCORING: "tenant.answers.aiScoring",
      SCORING_FAILED: "tenant.answers.scoringFailed",
      SCORED: "tenant.answers.scored",
    };
    return t(
      keyByStatus[status] ?? "tenant.answerDetail.status",
      ANSWER_STATUS_LABELS[status] ?? status,
    );
  };
  const text = {
    title: t("tenant.answerDetail.title", T.TITLE),
    taskType: t("tenant.answerDetail.taskType", T.TASK_TYPE_LABEL),
    status: t("tenant.answerDetail.status", T.STATUS_LABEL),
    aiScore: t("tenant.answerDetail.aiScore", T.AI_SCORE_LABEL),
    notScored: t("tenant.answerDetail.notScored", T.NOT_SCORED),
    options: t("tenant.answerDetail.options", T.OPTIONS_TITLE),
    selected: t("tenant.answerDetail.selected", T.SELECTED_BADGE),
    correct: t("tenant.answerDetail.correct", T.CORRECT_BADGE),
    audioUnavailable: t("tenant.answerDetail.audioUnavailable", T.AUDIO_UNAVAILABLE),
    unrecognized: t("tenant.answerDetail.unrecognized", T.UNRECOGNIZED_NOTICE),
    teacherScore: t("tenant.answerDetail.teacherScore", T.TEACHER_SCORE_TITLE),
    scoreLabel: t("tenant.answerDetail.scoreLabel", T.TEACHER_SCORE_LABEL),
    save: t("tenant.answerDetail.save", T.SUBMIT),
    saving: t("tenant.answerDetail.saving", T.SUBMITTING),
    saved: t("tenant.answerDetail.saved", T.SAVED),
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const score = Number(scoreInput);
    if (Number.isNaN(score)) return;
    submitScore.mutate(score);
  };

  return (
    <Modal open={answerPublicId !== null} onClose={onClose} title={text.title} size="lg">
      {isLoading || !answer ? (
        <LoadingState rows={4} />
      ) : (
        <div className="flex flex-col gap-5">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-[var(--ink-secondary)]">{text.taskType}</dt>
              <dd className="font-medium text-[var(--ink-primary)]">{answer.taskType}</dd>
            </div>
            <div>
              <dt className="text-[var(--ink-secondary)]">{text.status}</dt>
              <dd>
                <Badge variant={ANSWER_STATUS_VARIANT[answer.status]}>
                  {statusLabel(answer.status)}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-[var(--ink-secondary)]">{text.aiScore}</dt>
              <dd className="font-medium text-[var(--ink-primary)]">
                {answer.rawScore === null ? text.notScored : answer.rawScore}
              </dd>
            </div>
          </dl>

          <div className="rounded-xl border border-[var(--shell-border)] bg-[var(--surface-subtle)] p-4">
            {answer.payload.kind === "AUDIO" &&
              (answer.payload.mediaUrl ? (
                <audio controls src={answer.payload.mediaUrl} className="w-full" />
              ) : (
                <Alert tone="warning">{text.audioUnavailable}</Alert>
              ))}

            {answer.payload.kind === "SELECTION" && answer.payload.options && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
                  {text.options}
                </p>
                <ul className="flex flex-col gap-2">
                  {answer.payload.options.map((option) => (
                    <OptionRow
                      key={option.orderIndex ?? option.text}
                      option={option}
                      selectedLabel={text.selected}
                      correctLabel={text.correct}
                    />
                  ))}
                </ul>
              </div>
            )}

            {answer.payload.kind === "TEXT" && (
              <p className="whitespace-pre-wrap text-sm text-[var(--ink-primary)]">
                {answer.payload.text}
              </p>
            )}

            {answer.payload.kind === "UNRECOGNIZED" && (
              <div className="flex flex-col gap-2">
                <Alert tone="warning">{text.unrecognized}</Alert>
                <p className="whitespace-pre-wrap text-sm text-[var(--ink-primary)]">
                  {answer.payload.text}
                </p>
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 border-t border-[var(--divider)] pt-4"
          >
            <div>
              <h3 className="text-sm font-semibold text-[var(--ink-primary)]">
                {text.teacherScore}
              </h3>
            </div>
            {submitScore.isError && <Alert tone="error">{errorMessage(submitScore.error)}</Alert>}
            {submitScore.isSuccess && <Alert tone="success">{text.saved}</Alert>}
            <div className="flex items-end gap-3">
              <div className="w-40">
                <NumberInput
                  label={text.scoreLabel}
                  min={0}
                  max={100}
                  value={scoreInput}
                  placeholder={
                    answer.teacherScore === null ? undefined : String(answer.teacherScore)
                  }
                  onChange={(event) => setScoreInput(event.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={submitScore.isPending || scoreInput === ""}
                className="rounded-md bg-action px-4 py-2 text-sm font-semibold text-white hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitScore.isPending ? text.saving : text.save}
              </button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
};

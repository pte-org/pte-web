"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Button, Modal, NumberInput, useLocale, useToast } from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { ANSWER_DETAIL_TEXT } from "../constants";
import { useSubmitTeacherScore } from "../api";

interface TeacherScoreModalProps {
  answerPublicId: string | null;
  /** The score already on record, shown as the input's placeholder. */
  currentScore: number | null;
  onClose: () => void;
}

const T = ANSWER_DETAIL_TEXT;

/** The host's own score for one answer, entered apart from the answer's detail view. */
export const TeacherScoreModal = ({
  answerPublicId,
  currentScore,
  onClose,
}: TeacherScoreModalProps): ReactElement => {
  const { t } = useLocale();
  const { showToast } = useToast();
  const submitScore = useSubmitTeacherScore(answerPublicId ?? "");
  const [scoreInput, setScoreInput] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const score = Number(scoreInput);
    if (Number.isNaN(score)) return;
    submitScore.mutate(score, {
      onSuccess: () => {
        showToast(t("tenant.answerDetail.saved", T.SAVED), { tone: "success" });
        onClose();
      },
    });
  };

  return (
    <Modal
      open={answerPublicId !== null}
      onClose={onClose}
      title={t("tenant.answerDetail.teacherScore", T.TEACHER_SCORE_TITLE)}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {submitScore.isError && <Alert tone="error">{errorMessage(submitScore.error)}</Alert>}
        <NumberInput
          label={t("tenant.answerDetail.scoreLabel", T.TEACHER_SCORE_LABEL)}
          min={0}
          max={100}
          value={scoreInput}
          placeholder={currentScore === null ? undefined : String(currentScore)}
          onChange={(event) => setScoreInput(event.target.value)}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={submitScore.isPending || scoreInput === ""}>
            {submitScore.isPending
              ? t("tenant.answerDetail.saving", T.SUBMITTING)
              : t("tenant.answerDetail.save", T.SUBMIT)}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

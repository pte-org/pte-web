import type { ReactElement } from "react";
import type { QuestionResponse } from "@pte/api-client";
import { DetailGroup } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { QUESTION_DETAIL_TEXT } from "../constants";

interface AnswerKeyGroupsProps {
  question: QuestionResponse;
  showAnswerKey: boolean;
  /** Each group is drawn as its own card with this class. */
  cardClassName: string;
}

type DetailItem = { label: string; value: string };

const itemIf = (label: string, value: string | null | undefined): DetailItem[] =>
  value?.trim() ? [{ label, value }] : [];

/** True when the question has student hints to show in its detail view. */
export const hasAnswerHints = (question: QuestionResponse): boolean =>
  Boolean(question.answerHintVi?.trim() || question.answerHintEn?.trim());

/** The restricted answer key (reviewers only) and the student answer hints of a question. */
export const AnswerKeyGroups = ({ question, showAnswerKey, cardClassName }: AnswerKeyGroupsProps): ReactElement => {
  const T = useAdminCopy(QUESTION_DETAIL_TEXT);
  // Each part of the answer key is its own section, titled by what it holds (transcript, correct answer).
  const answerKey = [
    ...itemIf(question.audioPromptRef ? T.AUDIO_TRANSCRIPT : T.REFERENCE_ANSWER, question.referenceAnswerText),
    ...itemIf(T.CORRECT_ANSWER, question.correctAnswerText),
  ];
  const hints = [
    ...itemIf(T.ANSWER_HINT_VI, question.answerHintVi),
    ...itemIf(T.ANSWER_HINT_EN, question.answerHintEn),
  ];
  return (
    <>
      {showAnswerKey && answerKey.map((item) => (
        <section key={item.label} className={cardClassName}>
          <DetailGroup title={item.label} items={[{ ...item, hideLabel: true, fullWidth: true }]} />
        </section>
      ))}
      {hints.length > 0 && (
        <section className={cardClassName}>
          <DetailGroup title={T.ANSWER_HINT} items={hints} />
        </section>
      )}
    </>
  );
};

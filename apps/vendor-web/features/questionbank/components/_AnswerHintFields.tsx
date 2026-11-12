import type { ReactElement } from "react";
import { Textarea } from "@pte/ui";
import type { LiveLane } from "@/features/questiongeneration/liveConstants";
import { QUESTION_EDITOR_TEXT as T } from "../constants";
import { AgentMark } from "./_AgentMark";

interface AnswerHintFieldsProps {
  hintVi: string;
  hintEn: string;
  onHintViChange: (value: string) => void;
  onHintEnChange: (value: string) => void;
  lane?: LiveLane;
}

/** The two student hints a practice question shows on request; they explain the approach, never the answer. */
export const AnswerHintFields = ({
  hintVi, hintEn, onHintViChange, onHintEnChange, lane,
}: AnswerHintFieldsProps): ReactElement => (
  <AgentMark lane={lane}>
    <fieldset className="flex flex-col gap-3 rounded-md border border-gray-200 p-4">
      <legend className="px-1 text-sm font-medium text-gray-700">{T.ANSWER_HINT}</legend>
      <p className="text-sm text-gray-600">{T.ANSWER_HINT_HELPER}</p>
      <Textarea id="answer-hint-vi" label={T.ANSWER_HINT_VI} value={hintVi}
        maxLength={T.ANSWER_HINT_MAX_LENGTH} onChange={(event) => onHintViChange(event.target.value)} />
      <Textarea id="answer-hint-en" label={T.ANSWER_HINT_EN} value={hintEn}
        maxLength={T.ANSWER_HINT_MAX_LENGTH} onChange={(event) => onHintEnChange(event.target.value)} />
    </fieldset>
  </AgentMark>
);

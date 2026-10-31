import type { ReactElement } from "react";
import { Textarea } from "@pte/ui";
import {
  QUESTION_TYPE_EDITOR_TEXT as RAW_QUESTION_TYPE_EDITOR_TEXT,
  TASK_TYPE_INSTRUCTION_MAX_LENGTH,
} from "../constants";
import { useAdminCopy } from "@/features/i18n/adminCopy";

interface QuestionTypeInstructionFieldProps {
  value: string;
  onChange: (value: string) => void;
}

/** Never disabled: the instruction is display metadata, not part of the locked runtime contract. */
export const QuestionTypeInstructionField = ({
  value,
  onChange,
}: QuestionTypeInstructionFieldProps): ReactElement => {
  const T = useAdminCopy(RAW_QUESTION_TYPE_EDITOR_TEXT);
  // Only flag whitespace-only input; an untouched empty field is already covered by the required marker.
  const whitespaceOnly = value.length > 0 && !value.trim();

  return (
    <div className="md:col-span-2">
      <Textarea
        id="task-type-instruction"
        label={T.INSTRUCTION}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={T.INSTRUCTION_PLACEHOLDER}
        helperText={`${T.INSTRUCTION_HELPER} ${value.length}/${TASK_TYPE_INSTRUCTION_MAX_LENGTH}`}
        error={whitespaceOnly ? T.INSTRUCTION_REQUIRED : undefined}
        maxLength={TASK_TYPE_INSTRUCTION_MAX_LENGTH}
        rows={3}
        required
      />
    </div>
  );
};

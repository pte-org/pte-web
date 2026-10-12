import type { ReactElement } from "react";
import type { UpdateQuestionTypeRequest } from "@pte/api-client";
import {
  QUESTION_TYPE_EDITOR_TEXT as RAW_QUESTION_TYPE_EDITOR_TEXT,
  QUESTION_TYPE_REQUIREMENT_LABELS,
} from "../constants";
import { useAdminCopy } from "@/features/i18n/adminCopy";

type RequirementKey = (typeof QUESTION_TYPE_REQUIREMENT_LABELS)[number][0];

interface QuestionTypeRequirementsProps {
  requirements: Pick<UpdateQuestionTypeRequest, RequirementKey>;
  onChange: (key: RequirementKey, value: boolean) => void;
}

export const QuestionTypeRequirements = ({
  requirements,
  onChange,
}: QuestionTypeRequirementsProps): ReactElement => {
  const T = useAdminCopy(RAW_QUESTION_TYPE_EDITOR_TEXT);
  const labels = useAdminCopy(QUESTION_TYPE_REQUIREMENT_LABELS);

  return (
    <fieldset className="grid gap-3 rounded-md border border-gray-200 p-4 md:col-span-2 md:grid-cols-2">
      <legend className="px-1 text-sm font-medium text-gray-700">{T.AUTHORING_REQUIREMENTS}</legend>
      {labels.map(([key, label]) => (
        <label key={key} className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={requirements[key]}
            onChange={(event) => onChange(key, event.target.checked)}
          />
          {label}
        </label>
      ))}
    </fieldset>
  );
};

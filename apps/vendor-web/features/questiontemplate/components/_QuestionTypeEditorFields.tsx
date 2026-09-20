import type { ReactElement } from "react";
import { Input, Select, type SelectOption } from "@pte/ui";
import type {
  QuestionTypeSection,
  SupportedQuestionTypeResponse,
  UpdateQuestionTypeRequest,
} from "@pte/api-client";
import { QUESTION_TYPE_EDITOR_TEXT } from "../constants";
import { QuestionTypeRequirements } from "./_QuestionTypeRequirements";

export type EditorMode = "create" | "edit";

export type QuestionTypeFormDraft = UpdateQuestionTypeRequest & {
  code: string;
  section: QuestionTypeSection;
};

interface QuestionTypeEditorFieldsProps {
  mode: EditorMode;
  draft: QuestionTypeFormDraft;
  createOptions: SelectOption[];
  selectedTask?: SupportedQuestionTypeResponse;
  sectionOptions: SelectOption[];
  onCodeChange: (code: string) => void;
  onChange: (
    key: keyof QuestionTypeFormDraft,
    value: QuestionTypeFormDraft[keyof QuestionTypeFormDraft],
  ) => void;
}

export const QuestionTypeEditorFields = ({
  mode,
  draft,
  createOptions,
  selectedTask,
  sectionOptions,
  onCodeChange,
  onChange,
}: QuestionTypeEditorFieldsProps): ReactElement => (
  <div className="grid gap-4 md:grid-cols-2">
    {mode === "create" ? (
      <Select
        id="question-type-code"
        label={QUESTION_TYPE_EDITOR_TEXT.TASK_TYPE}
        value={draft.code}
        onChange={(event) => onCodeChange(event.target.value)}
        options={createOptions}
        placeholder={
          createOptions.length > 0
            ? QUESTION_TYPE_EDITOR_TEXT.SELECT_TASK_TYPE
            : QUESTION_TYPE_EDITOR_TEXT.ALL_STANDARD_TYPES_EXIST
        }
        disabled={createOptions.length === 0}
        required
      />
    ) : (
      <Input
        id="question-type-code"
        label={QUESTION_TYPE_EDITOR_TEXT.TASK_TYPE}
        value={draft.code}
        disabled
      />
    )}
    <Select
      id="question-type-section"
      label={QUESTION_TYPE_EDITOR_TEXT.SECTION}
      value={draft.section}
      onChange={(event) => onChange("section", event.target.value as QuestionTypeSection)}
      options={sectionOptions}
      required
      disabled={mode === "edit"}
    />
    <Input
      id="question-type-display-name"
      label={QUESTION_TYPE_EDITOR_TEXT.DISPLAY_NAME}
      value={draft.displayName}
      onChange={(event) => onChange("displayName", event.target.value)}
      required
    />
    <Input
      id="question-type-short-name"
      label={QUESTION_TYPE_EDITOR_TEXT.SHORT_NAME}
      value={draft.shortName}
      onChange={(event) => onChange("shortName", event.target.value)}
      required
    />
    <Input
      id="question-type-display-order"
      label={QUESTION_TYPE_EDITOR_TEXT.DISPLAY_ORDER}
      type="number"
      min={0}
      value={draft.displayOrder}
      onChange={(event) => onChange("displayOrder", Number(event.target.value) || 0)}
    />
    <div className="flex items-end">
      <label className="flex items-center gap-2 pb-2 text-sm font-medium text-gray-700">
        <input
          type="checkbox"
          checked={draft.active}
          onChange={(event) => onChange("active", event.target.checked)}
        />
        {QUESTION_TYPE_EDITOR_TEXT.AVAILABLE_FOR_NEW_QUESTIONS}
      </label>
    </div>
    <div className="rounded-md bg-slate-50 p-3 text-sm text-gray-600 md:col-span-2">
      <span className="font-medium text-gray-900">{draft.section}</span>
      {selectedTask
        ? selectedTask.scored
          ? ` ${QUESTION_TYPE_EDITOR_TEXT.CONTRIBUTES_TO_SCORING}`
          : ` ${QUESTION_TYPE_EDITOR_TEXT.NOT_SCORED}`
        : ` ${QUESTION_TYPE_EDITOR_TEXT.SELECT_STANDARD_TASK_TYPE}`}
      <span className="ml-2 font-mono text-xs">
        {draft.code || QUESTION_TYPE_EDITOR_TEXT.EMPTY_CODE}
      </span>
    </div>
    {mode === "create" ? (
      <div className="rounded-md border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900 md:col-span-2">
        {QUESTION_TYPE_EDITOR_TEXT.CANONICAL_REQUIREMENTS_NOTICE}
      </div>
    ) : (
      <QuestionTypeRequirements
        requirements={draft}
        onChange={(key, value) => onChange(key, value)}
      />
    )}
  </div>
);

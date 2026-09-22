import type { ReactElement } from "react";
import { Input, Select, type SelectOption } from "@pte/ui";
import type { QuestionTypeSection, TaskTypeCapabilityResponse } from "@pte/api-client";
import { QUESTION_TYPE_EDITOR_TEXT } from "../constants";

export type EditorMode = "create" | "edit";

export interface QuestionTypeFormDraft {
  taskTypeKey: string;
  section: QuestionTypeSection;
  displayName: string;
  shortName: string;
  screenKey: string;
  contractVersion: number;
  displayOrder: number;
  active: boolean;
}

interface QuestionTypeEditorFieldsProps {
  mode: EditorMode;
  draft: QuestionTypeFormDraft;
  capabilities: TaskTypeCapabilityResponse[];
  sectionOptions: SelectOption[];
  runtimeLocked: boolean;
  onChange: (
    key: keyof QuestionTypeFormDraft,
    value: QuestionTypeFormDraft[keyof QuestionTypeFormDraft],
  ) => void;
}

export const QuestionTypeEditorFields = ({
  mode,
  draft,
  capabilities,
  sectionOptions,
  runtimeLocked,
  onChange,
}: QuestionTypeEditorFieldsProps): ReactElement => {
  const screenOptions = Array.from(
    new Map(
      capabilities.map((capability) => [
        capability.screenKey,
        {
          label: capability.screenKey,
          value: capability.screenKey,
        },
      ]),
    ).values(),
  );
  const selectedScreenCapabilities = capabilities.filter(
    (capability) => capability.screenKey === draft.screenKey,
  );
  const contractOptions = selectedScreenCapabilities.map((capability) => ({
    label: `Contract v${capability.contractVersion} · ${capability.scoringMode}`,
    value: String(capability.contractVersion),
  }));
  const selectedCapability = selectedScreenCapabilities.find(
    (capability) => capability.contractVersion === draft.contractVersion,
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Input
        id="task-type-key"
        label={QUESTION_TYPE_EDITOR_TEXT.TASK_TYPE_KEY}
        value={draft.taskTypeKey}
        onChange={(event) => onChange("taskTypeKey", event.target.value.toUpperCase())}
        disabled={mode === "edit"}
        required
      />
      <Select
        id="question-type-section"
        label={QUESTION_TYPE_EDITOR_TEXT.SECTION}
        value={draft.section}
        onChange={(event) => onChange("section", event.target.value as QuestionTypeSection)}
        options={sectionOptions}
        required
        disabled={runtimeLocked}
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
      <Select
        id="task-type-screen-key"
        label={QUESTION_TYPE_EDITOR_TEXT.SCREEN_KEY}
        value={draft.screenKey}
        onChange={(event) => {
          const screenKey = event.target.value;
          const firstVersion = capabilities.find((item) => item.screenKey === screenKey);
          onChange("screenKey", screenKey);
          if (firstVersion) onChange("contractVersion", firstVersion.contractVersion);
        }}
        options={screenOptions}
        placeholder={QUESTION_TYPE_EDITOR_TEXT.SELECT_SCREEN_KEY}
        required
        disabled={runtimeLocked}
      />
      <Select
        id="task-type-contract-version"
        label={QUESTION_TYPE_EDITOR_TEXT.CONTRACT_VERSION}
        value={draft.contractVersion ? String(draft.contractVersion) : ""}
        onChange={(event) => onChange("contractVersion", Number(event.target.value) || 0)}
        options={contractOptions}
        placeholder={QUESTION_TYPE_EDITOR_TEXT.SELECT_CONTRACT_VERSION}
        required
        disabled={runtimeLocked || contractOptions.length === 0}
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
        <span className="font-medium text-gray-900">{draft.taskTypeKey || "—"}</span>
        {selectedCapability && (
          <span className="ml-2">
            {selectedCapability.scoringMode === "SCORED"
              ? QUESTION_TYPE_EDITOR_TEXT.CONTRIBUTES_TO_SCORING
              : QUESTION_TYPE_EDITOR_TEXT.NOT_SCORED}
          </span>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {QUESTION_TYPE_EDITOR_TEXT.RUNTIME_SOURCE_NOTICE}
        </p>
      </div>
    </div>
  );
};

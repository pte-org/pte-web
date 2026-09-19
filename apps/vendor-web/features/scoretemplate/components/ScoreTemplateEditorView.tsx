"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import type { QuestionTypeResponse } from "@pte/api-client";
import { Alert, Button, LoadingState, PageHeader } from "@pte/ui";
import { useActivateScoreTemplate, useReplaceScoreTemplateItems, useScoreTemplate } from "../api";
import { useQuestionTypes } from "@/features/questiontemplate/api";
import { QUESTION_TEMPLATE_BASE_PATH, SCORE_TEMPLATE_TEXT } from "../constants";
import {
  fromDraft,
  toDraft,
  type ScoreTemplateItemDraft,
  type ScoreTemplateResponse,
} from "../types";
import { ActivateTemplateModal } from "./ActivateTemplateModal";
import { ScoreTemplateItemTable } from "./_ScoreTemplateItemTable";

interface ScoreTemplateEditorViewProps {
  publicId: string;
}

/** DRAFT only — a template that's ACTIVE/RETIRED is never reachable here in normal navigation (list only links non-DRAFT rows to the detail route), but the backend is the real guard (`ScoreTemplateNotDraftException`, 409). */
export const ScoreTemplateEditorView = ({
  publicId,
}: ScoreTemplateEditorViewProps): ReactElement => {
  const { data: template, isLoading, isError } = useScoreTemplate(publicId);
  const { data: questionTypes = [] } = useQuestionTypes(true);

  if (isLoading) {
    return <LoadingState rows={6} />;
  }
  if (isError || !template) {
    return <Alert tone="error">Could not load this question template.</Alert>;
  }
  if (template.status !== "DRAFT") {
    return <Alert tone="warning">{SCORE_TEMPLATE_TEXT.NOT_DRAFT_ERROR}</Alert>;
  }

  // `key` forces a fresh mount (and fresh useState initializers below) if
  // `publicId` ever changes under this component instead of leaving stale
  // draft state from a previous template — the React-recommended
  // alternative to syncing fetched data into local state via useEffect.
  return (
    <ScoreTemplateEditorForm
      key={template.publicId}
      template={template}
      questionTypes={questionTypes}
    />
  );
};

interface ScoreTemplateEditorFormProps {
  template: ScoreTemplateResponse;
  questionTypes: QuestionTypeResponse[];
}

const ScoreTemplateEditorForm = ({
  template,
  questionTypes,
}: ScoreTemplateEditorFormProps): ReactElement => {
  const router = useRouter();
  const replaceItemsMutation = useReplaceScoreTemplateItems();
  const activateMutation = useActivateScoreTemplate();
  const [name, setName] = useState(template.name);
  const [items, setItems] = useState<ScoreTemplateItemDraft[]>(() => template.items.map(toDraft));
  const [activateTarget, setActivateTarget] = useState<ScoreTemplateResponse | null>(null);
  const [newTypeCode, setNewTypeCode] = useState("");

  const handleItemChange = (
    index: number,
    field: keyof ScoreTemplateItemDraft,
    value: string,
  ): void => {
    setItems((current) =>
      current.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const handleSaveDraft = (): void => {
    replaceItemsMutation.mutate({
      publicId: template.publicId,
      payload: { name, items: items.map(fromDraft) },
    });
  };

  const handleAddType = (): void => {
    const type = questionTypes.find((candidate) => candidate.code === newTypeCode);
    if (!type || items.some((item) => item.taskType === type.code)) return;

    const scoringMethod = !type.scored
      ? "UNSCORED"
      : type.section === "SPEAKING"
        ? "AI_SPEECH"
        : type.section === "WRITING"
          ? "AI_TEXT"
          : "OBJECTIVE";
    setItems((current) => [
      ...current,
      {
        taskType: type.code,
        section: type.section,
        sequence: current.length + 1,
        minCount: "1",
        maxCount: "1",
        prepSeconds: "0",
        responseSeconds: "0",
        timingMode: "RECOMMENDED",
        scoringMethod,
        overallWeight: "0",
        speakingWeight: "0",
        writingWeight: "0",
        readingWeight: "0",
        listeningWeight: "0",
      },
    ]);
    setNewTypeCode("");
  };

  const handleRemoveType = (index: number): void => {
    setItems((current) =>
      current
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({ ...item, sequence: itemIndex + 1 })),
    );
  };

  const availableTypes = questionTypes.filter(
    (type) => !items.some((item) => item.taskType === type.code),
  );

  const handleActivateConfirmed = (target: ScoreTemplateResponse): void => {
    activateMutation.mutate(target.publicId, {
      onSuccess: () => {
        setActivateTarget(null);
        router.push(`${QUESTION_TEMPLATE_BASE_PATH}/${target.publicId}`);
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${template.code} v${template.version} (DRAFT)`}
        actions={
          <>
            <Button
              variant="secondary"
              isLoading={replaceItemsMutation.isPending}
              onClick={handleSaveDraft}
            >
              {SCORE_TEMPLATE_TEXT.SAVE_DRAFT}
            </Button>
            <Button variant="primary" onClick={() => setActivateTarget(template)}>
              {SCORE_TEMPLATE_TEXT.ACTIVATE_ACTION}
            </Button>
          </>
        }
      />

      {replaceItemsMutation.isError && (
        <Alert tone="error">{SCORE_TEMPLATE_TEXT.NOT_DRAFT_ERROR}</Alert>
      )}
      {activateMutation.isError && (
        <Alert tone="error">{SCORE_TEMPLATE_TEXT.CONCURRENT_MODIFICATION_ERROR}</Alert>
      )}

      <div>
        <label htmlFor="score-template-name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          id="score-template-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-1 w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
        />
      </div>

      <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <label
              htmlFor="question-template-add-type"
              className="block text-sm font-medium text-gray-700"
            >
              Add an imported question type
            </label>
            <select
              id="question-template-add-type"
              value={newTypeCode}
              onChange={(event) => setNewTypeCode(event.target.value)}
              disabled={availableTypes.length === 0}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="">
                {availableTypes.length === 0
                  ? SCORE_TEMPLATE_TEXT.NO_TYPES_TO_ADD
                  : "Select a type"}
              </option>
              {availableTypes.map((type) => (
                <option key={type.code} value={type.code}>
                  {type.displayName} ({type.code})
                </option>
              ))}
            </select>
          </div>
          <Button
            variant="secondary"
            onClick={handleAddType}
            disabled={newTypeCode.length === 0 || availableTypes.length === 0}
          >
            {SCORE_TEMPLATE_TEXT.ADD_TYPE}
          </Button>
        </div>
      </div>

      <ScoreTemplateItemTable
        editable
        items={items}
        onChange={handleItemChange}
        onRemove={handleRemoveType}
      />

      <ActivateTemplateModal
        template={activateTarget}
        isActivating={activateMutation.isPending}
        onCancel={() => setActivateTarget(null)}
        onConfirm={handleActivateConfirmed}
      />
    </div>
  );
};

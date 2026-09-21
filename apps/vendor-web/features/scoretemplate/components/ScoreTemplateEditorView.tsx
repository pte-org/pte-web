"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import {
  getUserFacingApiErrorMessage,
  type QuestionTypeResponse,
  type QuestionTypeSection,
} from "@pte/api-client";
import { Alert, Button, LoadingState, PageHeader } from "@pte/ui";
import { useActivateScoreTemplate, useReplaceScoreTemplateItems, useScoreTemplate } from "../api";
import { useCurrentUser } from "@/features/auth/api";
import { useQuestionTypes } from "@/features/questiontemplate/api";
import { EXAM_TEMPLATE_BASE_PATH, EXAM_TEMPLATE_SECTIONS, SCORE_TEMPLATE_TEXT } from "../constants";
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
  const { data: template, isLoading, isError, error } = useScoreTemplate(publicId);
  const { data: questionTypes = [] } = useQuestionTypes(true);

  if (isLoading) {
    return <LoadingState rows={6} />;
  }
  if (isError || !template) {
    return (
      <Alert tone="error">
        {getUserFacingApiErrorMessage(error, SCORE_TEMPLATE_TEXT.LOAD_ERROR)}
      </Alert>
    );
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
  const { data: currentUser } = useCurrentUser();
  const replaceItemsMutation = useReplaceScoreTemplateItems();
  const activateMutation = useActivateScoreTemplate();
  const isPlatformAdmin = currentUser?.roles.includes("PLATFORM_ADMIN") ?? false;
  const [name, setName] = useState(template.name);
  const [items, setItems] = useState<ScoreTemplateItemDraft[]>(() => template.items.map(toDraft));
  const [activateTarget, setActivateTarget] = useState<ScoreTemplateResponse | null>(null);
  // Set only by the confirm-modal's own save-then-activate flow, shown
  // inside the modal — a page-level Alert would sit uselessly behind the
  // modal's backdrop/blur while it's open, unreadable until dismissed.
  const [confirmError, setConfirmError] = useState<string | undefined>(undefined);

  // The generic constant is only a fallback for a non-ApiError failure (e.g.
  // a network error) — any real backend rejection shows its own message.
  // Gated to the standalone "Save draft" button: while the activate modal is
  // open, its own save-then-activate attempt reports through `confirmError`
  // instead, so this doesn't also render (uselessly) behind the modal.
  const saveErrorMessage =
    activateTarget === null && replaceItemsMutation.isError
      ? getUserFacingApiErrorMessage(
          replaceItemsMutation.error,
          SCORE_TEMPLATE_TEXT.NOT_DRAFT_ERROR,
        )
      : undefined;
  const [newSection, setNewSection] = useState<QuestionTypeSection | "">("");
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

  const handleItemSectionChange = (index: number, section: string): void => {
    setItems((current) => {
      const usedByOtherItems = new Set(
        current.filter((_, itemIndex) => itemIndex !== index).map((item) => item.taskType),
      );
      const firstAvailableType = questionTypes.find(
        (type) => type.active && type.section === section && !usedByOtherItems.has(type.code),
      );
      return current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, section, taskType: firstAvailableType?.code ?? "" } : item,
      );
    });
  };

  // `items`/`name` are local form state, initialized once from the template
  // prop at mount — a successful save's response (with server-recomputed
  // fields like `overallWeight`) never reaches them on its own, since
  // react-query refetching the underlying query does not re-run this
  // component's `useState` initializers. Synced back in explicitly here so
  // the on-screen values (Overall %) reflect what was actually just saved.
  const handleSaveDraft = (): void => {
    replaceItemsMutation.mutate(
      { publicId: template.publicId, payload: { name, items: items.map(fromDraft) } },
      {
        onSuccess: (response) => {
          setName(response.name);
          setItems(response.items.map(toDraft));
        },
      },
    );
  };

  // Activate always saves the on-screen state first — the confirmation
  // modal's `target` is only ever the publicId/code/version (those never
  // change from an edit), never a stand-in for the current `name`/`items`
  // state, which is why this can't just call activateMutation directly.
  // Stays open on failure (rather than closing back to the page) so the
  // error renders where the user is already looking, via `confirmError`.
  const handleActivateConfirmed = (target: ScoreTemplateResponse): void => {
    setConfirmError(undefined);
    replaceItemsMutation.mutate(
      { publicId: template.publicId, payload: { name, items: items.map(fromDraft) } },
      {
        onSuccess: (saved) => {
          // Sync the just-saved (server-recomputed) values back into local
          // state before proceeding — if `activate` below then fails, the
          // form stays on screen showing what's actually in the DB now,
          // not stale pre-save values.
          setName(saved.name);
          setItems(saved.items.map(toDraft));
          activateMutation.mutate(target.publicId, {
            onSuccess: () => {
              setActivateTarget(null);
              router.push(`${EXAM_TEMPLATE_BASE_PATH}/${target.publicId}`);
            },
            onError: (error) => {
              setConfirmError(
                getUserFacingApiErrorMessage(
                  error,
                  SCORE_TEMPLATE_TEXT.CONCURRENT_MODIFICATION_ERROR,
                ),
              );
            },
          });
        },
        onError: (error) => {
          setConfirmError(getUserFacingApiErrorMessage(error, SCORE_TEMPLATE_TEXT.NOT_DRAFT_ERROR));
        },
      },
    );
  };

  // scoringMethod is deliberately not set here — it's backend-derived from
  // taskType (never accepted as admin input), and timingMode no longer
  // exists at all (column dropped) — see ScoreTemplateItemDraft.
  const handleAddType = (): void => {
    const type = questionTypes.find((candidate) => candidate.code === newTypeCode);
    if (!type || type.section !== newSection || items.some((item) => item.taskType === type.code))
      return;

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
        overallWeight: "0",
        speakingWeight: "0",
        writingWeight: "0",
        readingWeight: "0",
        listeningWeight: "0",
      },
    ]);
    setNewSection("");
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
    (type) =>
      type.active &&
      type.section === newSection &&
      !items.some((item) => item.taskType === type.code),
  );

  const handleOpenActivate = (): void => {
    setConfirmError(undefined);
    setActivateTarget(template);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${template.code} v${template.version} (${SCORE_TEMPLATE_TEXT.DRAFT_STATUS_LABEL})`}
        actions={
          <>
            <Button
              variant="secondary"
              isLoading={replaceItemsMutation.isPending}
              onClick={handleSaveDraft}
            >
              {SCORE_TEMPLATE_TEXT.SAVE_DRAFT}
            </Button>
            {isPlatformAdmin && (
              <Button variant="primary" onClick={handleOpenActivate}>
                {SCORE_TEMPLATE_TEXT.ACTIVATE_ACTION}
              </Button>
            )}
            <Button variant="ghost" onClick={() => router.push(EXAM_TEMPLATE_BASE_PATH)}>
              {SCORE_TEMPLATE_TEXT.DETAIL_BACK}
            </Button>
          </>
        }
      />

      {saveErrorMessage && <Alert tone="error">{saveErrorMessage}</Alert>}

      <div>
        <label htmlFor="score-template-name" className="block text-sm font-medium text-gray-700">
          {SCORE_TEMPLATE_TEXT.NAME_LABEL}
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
              htmlFor="exam-template-add-section"
              className="block text-sm font-medium text-gray-700"
            >
              {SCORE_TEMPLATE_TEXT.ADD_TYPE}
            </label>
            <select
              id="exam-template-add-section"
              value={newSection}
              onChange={(event) => {
                setNewSection(event.target.value as QuestionTypeSection | "");
                setNewTypeCode("");
              }}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="">{SCORE_TEMPLATE_TEXT.ADD_SECTION_PLACEHOLDER}</option>
              {EXAM_TEMPLATE_SECTIONS.map((section) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
            </select>
            <select
              id="exam-template-add-type"
              value={newTypeCode}
              onChange={(event) => setNewTypeCode(event.target.value)}
              disabled={!newSection || availableTypes.length === 0}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="">
                {!newSection
                  ? SCORE_TEMPLATE_TEXT.NO_SECTION_SELECTED
                  : availableTypes.length === 0
                    ? SCORE_TEMPLATE_TEXT.NO_TYPES_TO_ADD
                    : SCORE_TEMPLATE_TEXT.ADD_TYPE_PLACEHOLDER}
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
            disabled={!newSection || newTypeCode.length === 0 || availableTypes.length === 0}
          >
            {SCORE_TEMPLATE_TEXT.ADD_TYPE}
          </Button>
        </div>
      </div>

      <ScoreTemplateItemTable
        editable
        items={items}
        questionTypes={questionTypes}
        onChange={handleItemChange}
        onSectionChange={handleItemSectionChange}
        onRemove={handleRemoveType}
      />

      <ActivateTemplateModal
        template={activateTarget}
        isActivating={replaceItemsMutation.isPending || activateMutation.isPending}
        errorMessage={confirmError}
        onCancel={() => setActivateTarget(null)}
        onConfirm={handleActivateConfirmed}
      />
    </div>
  );
};

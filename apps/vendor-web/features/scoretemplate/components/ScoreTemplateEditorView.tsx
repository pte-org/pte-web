"use client";

import { useState, type ReactElement } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ApiError,
  type QuestionTypeResponse,
  type ScoreTemplateFeasibilityResponse,
} from "@pte/api-client";
import {
  Alert,
  Button,
  LoadingState,
  UnsavedChangesGuard,
  useDashboardBreadcrumbLabel,
  useLocale,
  useToast,
} from "@pte/ui";
import { translateAdminText, useAdminCopy } from "@/features/i18n/adminCopy";
import {
  useActivateScoreTemplate,
  useReplaceScoreTemplateItems,
  useScoreTemplate,
  useScoreTemplateFeasibility,
} from "../api";
import { useCurrentUser } from "@/features/auth/api";
import { canReviewAcademic } from "@/features/auth/permissions";
import { useTaskTypes } from "@/features/questiontemplate/api";
import { createDraftItem, taskTypeKeyOf } from "../addTaskType";
import {
  EXAM_TEMPLATE_BASE_PATH,
  SCORE_TEMPLATE_ALL_TAB,
  SCORE_TEMPLATE_TEXT as RAW_SCORE_TEMPLATE_TEXT,
  SCORE_TEMPLATE_VALIDATION_FAILED_CODE,
} from "../constants";
import { createDraftSnapshot } from "../draftSnapshot";
import { getScoreTemplateErrorMessage } from "../errorMessage";
import { applyVisibleOrder } from "../reorderSectionItems";
import { describeSkillWeightMismatch } from "../skillWeightTotals";
import { hasUnreadyTaskType } from "../taskTypeReadiness";
import {
  fromDraft,
  toDraft,
  type ScoreTemplateItemDraft,
  type ScoreTemplatePolicy,
  type ScoreTemplateResponse,
} from "../types";
import { ActivateTemplateModal } from "./ActivateTemplateModal";
import { AddTaskTypeDialog } from "./AddTaskTypeDialog";
import { ScoreTemplateItemTable } from "./_ScoreTemplateItemTable";
import { SkillWeightTotals } from "./_SkillWeightTotals";
import { TemplateInfoPanel } from "./TemplateInfoPanel";
import { TemplateReadinessSummary } from "./TemplateReadinessSummary";
import { TemplateToolbarActions } from "./TemplateToolbarActions";

interface ScoreTemplateEditorViewProps {
  publicId: string;
}

/** DRAFT only — a template that's ACTIVE/RETIRED is never reachable here in normal navigation (list only links non-DRAFT rows to the detail route), but the backend is the real guard (`ScoreTemplateNotDraftException`, 409). */
export const ScoreTemplateEditorView = ({
  publicId,
}: ScoreTemplateEditorViewProps): ReactElement => {
  const SCORE_TEMPLATE_TEXT = useAdminCopy(RAW_SCORE_TEMPLATE_TEXT);
  const { data: template, isLoading, isError, error } = useScoreTemplate(publicId);
  const pathname = usePathname();
  // The breadcrumb's last segment names the template, so the page needs no title of its own.
  useDashboardBreadcrumbLabel(
    pathname,
    template
      ? `${template.code} v${template.version} (${SCORE_TEMPLATE_TEXT.DRAFT_STATUS_LABEL})`
      : undefined,
  );
  const {
    data: questionTypes = [],
    isLoading: isTaskTypesLoading,
    isError: isTaskTypesError,
    error: taskTypesError,
  } = useTaskTypes(true);
  const {
    data: feasibility,
    isLoading: isFeasibilityLoading,
    isError: isFeasibilityError,
  } = useScoreTemplateFeasibility(publicId);

  if (isLoading) {
    return <LoadingState rows={6} />;
  }
  if (isError || !template) {
    return (
      <Alert tone="error">
        {getScoreTemplateErrorMessage(error, SCORE_TEMPLATE_TEXT.LOAD_ERROR)}
      </Alert>
    );
  }
  if (isTaskTypesLoading) {
    return <LoadingState rows={6} />;
  }
  if (isTaskTypesError) {
    return (
      <Alert tone="error">
        {getScoreTemplateErrorMessage(taskTypesError, SCORE_TEMPLATE_TEXT.TASK_TYPES_LOAD_ERROR)}
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
      feasibilityReady={feasibility?.ready === true}
      isFeasibilityLoading={isFeasibilityLoading}
      isFeasibilityError={isFeasibilityError}
      feasibility={feasibility}
    />
  );
};

interface ScoreTemplateEditorFormProps {
  template: ScoreTemplateResponse;
  questionTypes: QuestionTypeResponse[];
  feasibilityReady: boolean;
  isFeasibilityLoading: boolean;
  isFeasibilityError: boolean;
  feasibility?: ScoreTemplateFeasibilityResponse;
}

const ScoreTemplateEditorForm = ({
  template,
  questionTypes,
  feasibilityReady,
  isFeasibilityLoading,
  isFeasibilityError,
  feasibility,
}: ScoreTemplateEditorFormProps): ReactElement => {
  const SCORE_TEMPLATE_TEXT = useAdminCopy(RAW_SCORE_TEMPLATE_TEXT);
  const { locale } = useLocale();
  const { showToast } = useToast();
  const sectionLabels = useAdminCopy({
    SPEAKING: "Speaking",
    WRITING: "Writing",
    READING: "Reading",
    LISTENING: "Listening",
  });
  // The API's generic validation failure hides which column is off; name it from the on-screen totals.
  const reportError = (error: unknown): void => {
    const mismatch =
      error instanceof ApiError && error.code === SCORE_TEMPLATE_VALIDATION_FAILED_CODE
        ? describeSkillWeightMismatch(items, sectionLabels)
        : null;
    showToast(
      mismatch
        ? `${SCORE_TEMPLATE_TEXT.WEIGHT_TOTAL_MISMATCH} ${mismatch}.`
        : translateAdminText(
            getScoreTemplateErrorMessage(error, SCORE_TEMPLATE_TEXT.SAVE_ERROR),
            locale,
          ),
      { tone: "error" },
    );
  };
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const replaceItemsMutation = useReplaceScoreTemplateItems();
  const activateMutation = useActivateScoreTemplate();
  const canActivate = canReviewAcademic(currentUser?.roles);
  const initialPolicy: ScoreTemplatePolicy =
    template.templatePolicy === "CUSTOM" ? "CUSTOM" : "STANDARD_PTE";
  const [name, setName] = useState(template.name);
  const [templatePolicy, setTemplatePolicy] = useState<ScoreTemplatePolicy>(initialPolicy);
  const [items, setItems] = useState<ScoreTemplateItemDraft[]>(() => template.items.map(toDraft));
  // What the server holds right now; anything different on screen is unsaved.
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    createDraftSnapshot(template.name, initialPolicy, template.items.map(toDraft)),
  );
  const hasUnsavedChanges = createDraftSnapshot(name, templatePolicy, items) !== savedSnapshot;
  const [activateTarget, setActivateTarget] = useState<ScoreTemplateResponse | null>(null);
  const [nameError, setNameError] = useState<string>();
  // The tab the "add task type" dialog was opened from; `null` keeps it closed.
  const [addDialogTab, setAddDialogTab] = useState<string | null>(null);
  const taskTypeKey = taskTypeKeyOf;

  const handleItemChange = (
    index: number,
    field: keyof ScoreTemplateItemDraft,
    value: string,
  ): void => {
    setItems((current) =>
      current.map((item, i) =>
        i !== index
          ? item
          : field === "taskTypeKey"
            ? { ...item, taskTypeKey: value, taskType: value }
            : { ...item, [field]: value },
      ),
    );
  };

  const handleReorderItems = (orderedTaskTypeKeys: string[]): void => {
    setItems((current) => applyVisibleOrder(current, orderedTaskTypeKeys));
  };

  // `items`/`name` are local form state, initialized once from the template
  // prop at mount — a successful save's response (with server-recomputed
  // fields like `overallWeight`) never reaches them on its own, since
  // react-query refetching the underlying query does not re-run this
  // component's `useState` initializers. Synced back in explicitly here so
  // the on-screen values (Overall %) reflect what was actually just saved.
  const applySavedTemplate = (saved: ScoreTemplateResponse): void => {
    const savedPolicy: ScoreTemplatePolicy =
      saved.templatePolicy === "CUSTOM" ? "CUSTOM" : "STANDARD_PTE";
    const savedItems = saved.items.map(toDraft);
    setName(saved.name);
    setTemplatePolicy(savedPolicy);
    setItems(savedItems);
    setSavedSnapshot(createDraftSnapshot(saved.name, savedPolicy, savedItems));
  };

  const handleSaveDraft = (): void => {
    if (!name.trim()) {
      setNameError(SCORE_TEMPLATE_TEXT.NAME_REQUIRED);
      showToast(SCORE_TEMPLATE_TEXT.NAME_REQUIRED, { tone: "error" });
      return;
    }
    replaceItemsMutation.mutate(
      {
        publicId: template.publicId,
        payload: { name, items: items.map(fromDraft), templatePolicy },
      },
      {
        onError: reportError,
        onSuccess: applySavedTemplate,
      },
    );
  };

  // Activate always saves the on-screen state first — the confirmation
  // modal's `target` is only ever the publicId/code/version (those never
  // change from an edit), never a stand-in for the current `name`/`items`
  // state, which is why this can't just call activateMutation directly.
  // Failed requests keep the editor and confirmation open so edits are retained.
  const handleActivateConfirmed = (target: ScoreTemplateResponse): void => {
    replaceItemsMutation.mutate(
      {
        publicId: template.publicId,
        payload: { name, items: items.map(fromDraft), templatePolicy },
      },
      {
        onSuccess: (saved) => {
          // Sync the just-saved (server-recomputed) values back into local
          // state before proceeding — if `activate` below then fails, the
          // form stays on screen showing what's actually in the DB now,
          // not stale pre-save values.
          applySavedTemplate(saved);
          activateMutation.mutate(target.publicId, {
            onSuccess: () => {
              setActivateTarget(null);
              router.push(`${EXAM_TEMPLATE_BASE_PATH}/${target.publicId}`);
            },
            onError: reportError,
          });
        },
        onError: reportError,
      },
    );
  };

  const handleAddType = (type: QuestionTypeResponse): void => {
    setItems((current) =>
      current.some((item) => item.taskTypeKey === taskTypeKey(type))
        ? current
        : [...current, createDraftItem(type, current.length + 1)],
    );
  };

  const handleRemoveType = (index: number): void => {
    setItems((current) =>
      current
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({ ...item, sequence: itemIndex + 1 })),
    );
  };

  const activeCatalogTypes = questionTypes.filter((type) => type.active);
  const selectedTypeUnavailable =
    items.some(
      (item) =>
        !questionTypes.some((type) => taskTypeKey(type) === item.taskTypeKey) ||
        !questionTypes.some((type) => taskTypeKey(type) === item.taskTypeKey && type.active),
    ) || hasUnreadyTaskType(items, questionTypes);
  const canActivateFromCatalog =
    new Set(items.map((item) => item.taskTypeKey)).size === items.length &&
    items.length > 0 &&
    activeCatalogTypes.length > 0 &&
    !selectedTypeUnavailable &&
    !isFeasibilityLoading &&
    !isFeasibilityError &&
    feasibilityReady;
  const handleOpenActivate = (): void => {
    setActivateTarget(template);
  };

  return (
    <div className="space-y-6">
      <TemplateReadinessSummary
        items={items}
        questionTypes={questionTypes}
        feasibility={feasibility}
        loading={isFeasibilityLoading}
        failed={isFeasibilityError}
      />

      <SkillWeightTotals items={items} skillLabels={sectionLabels} />

      <ScoreTemplateItemTable
        editable
        items={items}
        onChange={handleItemChange}
        onReorder={handleReorderItems}
        onRemove={handleRemoveType}
        renderToolbarAction={(activeTab) => (
          <TemplateToolbarActions
            onSave={handleSaveDraft}
            isSaving={replaceItemsMutation.isPending}
            onAddTaskType={() => setAddDialogTab(activeTab)}
            canActivate={canActivate}
            isActivatable={canActivateFromCatalog}
            onActivate={handleOpenActivate}
          />
        )}
        renderEmptyAction={(activeTab) => (
          <Button variant="secondary" onClick={() => setAddDialogTab(activeTab)}>
            {SCORE_TEMPLATE_TEXT.ADD_TYPE}
          </Button>
        )}
        sidePanel={
          <TemplateInfoPanel
            name={name}
            nameError={nameError}
            onNameChange={(value) => {
              setName(value);
              setNameError(undefined);
            }}
            policy={templatePolicy}
            onPolicyChange={setTemplatePolicy}
          />
        }
      />

      <UnsavedChangesGuard
        isDirty={hasUnsavedChanges}
        title={SCORE_TEMPLATE_TEXT.UNSAVED_TITLE}
        description={SCORE_TEMPLATE_TEXT.UNSAVED_DESCRIPTION}
        stayLabel={SCORE_TEMPLATE_TEXT.UNSAVED_STAY}
        leaveLabel={SCORE_TEMPLATE_TEXT.UNSAVED_LEAVE}
        onNavigate={(href) => router.push(href)}
      />

      <AddTaskTypeDialog
        open={addDialogTab !== null}
        onClose={() => setAddDialogTab(null)}
        activeTab={addDialogTab ?? SCORE_TEMPLATE_ALL_TAB}
        questionTypes={questionTypes}
        items={items}
        onAdd={handleAddType}
      />

      <ActivateTemplateModal
        template={activateTarget}
        isActivating={replaceItemsMutation.isPending || activateMutation.isPending}
        onCancel={() => setActivateTarget(null)}
        onConfirm={handleActivateConfirmed}
      />
    </div>
  );
};

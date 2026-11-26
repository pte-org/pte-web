"use client";

import { useMemo, useState, type ReactElement } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ActionMenu,
  Alert,
  Button,
  ConfirmDialog,
  LoadingState,
  UnsavedChangesGuard,
  useDashboardBreadcrumbLabel,
  useToast,
} from "@pte/ui";
import type { ScoreTemplateItemRequest, ScoreTemplateResponse } from "@pte/api-client";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { useActiveScoreTemplate } from "@/features/exams/api";
import {
  useActivateHostTemplate,
  useHostTemplate,
  useHostTemplateFeasibility,
  useReplaceHostTemplateItems,
} from "../api";
import { useEditorText, useListText, useSkillLabels } from "../hooks/useTemplateText";
import { templateActionError } from "../utils/actionError";
import { findInvalidCounts, setCount } from "../utils/counts";
import { buildLivePool, countShortTypes, rememberAvailable } from "../utils/pool";
import {
  areWeightsValid,
  buildWeightEditableCheck,
  computeSkillTotals,
  addBackItem,
  findAddableItems,
  removeItem,
  setWeight,
  toEditableItems,
} from "../utils/weights";
import { applyVisibleOrder } from "@pte/api-client";
import { BalanceWeightsDialog } from "./BalanceWeightsDialog";
import { HostTemplateDurationSummary } from "./HostTemplateDurationSummary";
import { HostTemplateHeader } from "./HostTemplateHeader";
import { TemplateItemsEditor } from "./TemplateItemsEditor";

interface HostTemplateEditorViewProps {
  publicId: string;
}

export const HostTemplateEditorView = ({ publicId }: HostTemplateEditorViewProps): ReactElement => {
  const text = useEditorText();
  // The platform default is not tenant-owned, so the host endpoint cannot return it: read it from the
  // shared default query instead and show it read-only.
  const defaultQuery = useActiveScoreTemplate();
  const isDefault = defaultQuery.data?.publicId === publicId;
  const own = useHostTemplate(publicId, !defaultQuery.isLoading && !isDefault);
  const template = isDefault ? defaultQuery.data : own.data;
  const error = isDefault ? undefined : own.error;

  if (defaultQuery.isLoading || own.isLoading) return <LoadingState rows={4} />;
  if (error || !template) {
    return <Alert tone="error">{errorMessage(error, text.NOT_FOUND)}</Alert>;
  }
  // Keyed on the server version so a fresh save or reload resets the local draft.
  return (
    <EditorBody
      key={`${template.publicId}-${template.version}`}
      template={template}
      isDefault={isDefault}
      baseItems={defaultQuery.data?.items}
    />
  );
};

interface EditorBodyProps {
  template: ScoreTemplateResponse;
  isDefault: boolean;
  baseItems: ScoreTemplateResponse["items"] | undefined;
}

const EditorBody = ({ template, isDefault, baseItems }: EditorBodyProps): ReactElement => {
  const text = useEditorText();
  const listText = useListText();
  const skillLabels = useSkillLabels();
  const { showToast } = useToast();
  const editable = template.status === "DRAFT";
  const pathname = usePathname();
  // The breadcrumb's last segment names the template, so the page needs no title of its own.
  useDashboardBreadcrumbLabel(pathname, template.name);

  const [name, setName] = useState(template.name);
  const [items, setItems] = useState<ScoreTemplateItemRequest[]>(() =>
    toEditableItems(template.items),
  );
  const [balanceOpen, setBalanceOpen] = useState(false);
  const [activateOpen, setActivateOpen] = useState(false);

  const router = useRouter();
  const save = useReplaceHostTemplateItems(template.publicId);
  const activate = useActivateHostTemplate();
  // Only the host's own templates have a tenant-scoped feasibility route; the platform default does not.
  const feasibility = useHostTemplateFeasibility(template.publicId, !isDefault);
  // Keep every bank count the server has reported (React's "adjust state when a prop changes" pattern),
  // then judge the rows as they are being edited.
  // Start from what is already known: a coverage answer cached from an earlier visit is not a change, so it
  // would never be picked up below and the stock column would stay empty.
  const [available, setAvailable] = useState<ReadonlyMap<string, number>>(() =>
    rememberAvailable(new Map(), feasibility.data),
  );
  const [seenFeasibility, setSeenFeasibility] = useState(feasibility.data);
  if (feasibility.data !== seenFeasibility) {
    setSeenFeasibility(feasibility.data);
    setAvailable(rememberAvailable(available, feasibility.data));
  }
  const pool = useMemo(() => buildLivePool(available, items), [available, items]);
  const shortTypes = useMemo(
    () =>
      countShortTypes(
        pool,
        items.map((item) => item.taskTypeKey),
      ),
    [pool, items],
  );

  const isWeightEditable = useMemo(
    () => buildWeightEditableCheck(baseItems, template.items),
    [baseItems, template.items],
  );
  const totals = useMemo(() => computeSkillTotals(items), [items]);
  const dirty = useMemo(
    () =>
      name !== template.name ||
      JSON.stringify(items) !== JSON.stringify(toEditableItems(template.items)),
    [name, items, template],
  );
  const canSave = editable && dirty && items.length > 0 && name.trim().length > 0;

  const submitError =
    templateActionError(save.error, listText) ?? templateActionError(activate.error, listText);

  const handleSave = (onSaved?: () => void): void => {
    const badCounts = findInvalidCounts(items);
    if (badCounts.length > 0) {
      showToast(`${text.COUNTS_INVALID} ${badCounts.join(", ")}`, { tone: "error" });
      return;
    }
    const badSkills = totals.filter((entry) => !entry.ok).map((entry) => skillLabels[entry.skill]);
    if (badSkills.length > 0 || !areWeightsValid(totals)) {
      const message =
        badSkills.length > 0
          ? `${text.WEIGHTS_INVALID} ${badSkills.join(", ")}`
          : text.OVERALL_ZERO;
      showToast(message, { tone: "error" });
      return;
    }
    save.mutate(
      { name: name.trim(), items, templatePolicy: template.templatePolicy },
      { onSuccess: () => { showToast(text.SAVED, { tone: "success" }); onSaved?.(); } },
    );
  };

  const handleActivate = (): void => {
    activate.mutate(template.publicId, {
      onSuccess: () => {
        setActivateOpen(false);
        showToast(text.ACTIVATED, { tone: "success" });
      },
      onError: () => setActivateOpen(false),
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <UnsavedChangesGuard
        isDirty={dirty && editable}
        isSaving={save.isPending}
        onSaveAndLeave={handleSave}
        onNavigate={(href) => router.push(href)}
      />
      <HostTemplateHeader
        template={template}
        editable={editable}
        name={name}
        onNameChange={setName}
        actions={
          editable && (
            <>
              <Button onClick={() => handleSave()} isLoading={save.isPending} disabled={!canSave}>
                {text.SAVE}
              </Button>
              <ActionMenu
                label={text.ACTIONS_LABEL}
                items={[
                  { label: text.BALANCE, onSelect: () => setBalanceOpen(true) },
                  {
                    label: listText.ACTIVATE,
                    onSelect: () => setActivateOpen(true),
                    disabled: dirty || activate.isPending,
                  },
                ]}
              />
            </>
          )
        }
      />
      {!editable && !isDefault && <Alert tone="info">{text.READ_ONLY}</Alert>}
      {submitError && <Alert tone="error">{submitError}</Alert>}
      {items.length === 0 && <Alert tone="warning">{text.NO_TASKS}</Alert>}
      {editable && shortTypes > 0 && (
        <p className="text-xs text-[var(--blush-action)]">
          {text.POOL_SUMMARY.replace("{count}", String(shortTypes))}
        </p>
      )}

      <TemplateItemsEditor
        addable={isDefault || !baseItems ? undefined : findAddableItems(baseItems, items)}
        onAdd={
          isDefault || !baseItems
            ? undefined
            : (key) => setItems((current) => addBackItem(current, baseItems, key))
        }
        onReorder={(keys) => setItems((current) => applyVisibleOrder(current, keys))}
        items={items}
        editable={editable}
        isWeightEditable={isWeightEditable}
        pool={isDefault || !feasibility.data ? undefined : pool}
        onRemove={(key) => setItems((current) => removeItem(current, key))}
        onWeightChange={(key, skill, value) =>
          setItems((current) => setWeight(current, key, skill, value))
        }
        onCountChange={(key, field, value) =>
          setItems((current) => setCount(current, key, field, value))
        }
      />
      {!isDefault && (
        <HostTemplateDurationSummary
          parts={feasibility.data?.parts}
          totalMaxSeconds={feasibility.data?.totalMaxSeconds}
        />
      )}

      <BalanceWeightsDialog
        open={balanceOpen}
        onClose={() => setBalanceOpen(false)}
        items={items}
        onApply={setItems}
      />
      <ConfirmDialog
        open={activateOpen}
        title={listText.CONFIRM_ACTIVATE_TITLE}
        description={listText.CONFIRM_ACTIVATE_TEXT}
        confirmLabel={listText.ACTIVATE}
        cancelLabel={listText.CANCEL}
        isConfirming={activate.isPending}
        onConfirm={handleActivate}
        onClose={() => setActivateOpen(false)}
      />
    </div>
  );
};

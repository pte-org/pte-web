"use client";

import { useEffect, useMemo, useState, type ReactElement } from "react";
import { usePathname } from "next/navigation";
import {
  ActionMenu,
  Alert,
  Button,
  ConfirmDialog,
  ItemPalette,
  LoadingState,
  useDashboardBreadcrumbLabel,
  useToast,
} from "@pte/ui";
import type { ScoreTemplateItemRequest, ScoreTemplateResponse } from "@pte/api-client";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { sectionTone } from "@/lib/chipTones";
import { useActiveScoreTemplate } from "@/features/exams/api";
import {
  useActivateHostTemplate,
  useHostTemplate,
  useHostTemplateFeasibility,
  useReplaceHostTemplateItems,
} from "../api";
import { useEditorText, useListText, useSkillLabels } from "../hooks/useTemplateText";
import { templateActionError } from "../utils/actionError";
import { buildPoolIndex, countShortTypes } from "../utils/pool";
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
import { PALETTE_DROP_ATTRIBUTE, TASK_TYPE_DRAG_TYPE } from "../constants";
import { BalanceWeightsDialog } from "./BalanceWeightsDialog";
import { HostTemplateDurationSummary } from "./HostTemplateDurationSummary";
import { HostTemplateInfoPanel } from "./HostTemplateInfoPanel";
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

  const save = useReplaceHostTemplateItems(template.publicId);
  const activate = useActivateHostTemplate();
  // Only the host's own templates have a tenant-scoped feasibility route; the platform default does not.
  const feasibility = useHostTemplateFeasibility(template.publicId, !isDefault);
  const pool = useMemo(() => buildPoolIndex(feasibility.data), [feasibility.data]);
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

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent): void => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const submitError =
    templateActionError(save.error, listText) ?? templateActionError(activate.error, listText);

  const handleSave = (): void => {
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
      { onSuccess: () => showToast(text.SAVED, { tone: "success" }) },
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
      {!editable && !isDefault && <Alert tone="info">{text.READ_ONLY}</Alert>}
      {submitError && <Alert tone="error">{submitError}</Alert>}
      {items.length === 0 && <Alert tone="warning">{text.NO_TASKS}</Alert>}

      <section className="flex flex-col gap-2">
        <div>
          {editable && shortTypes > 0 && (
            <p className="mt-1 text-xs text-[var(--blush-action)]">
              {text.POOL_SUMMARY.replace("{count}", String(shortTypes))}
            </p>
          )}
        </div>
        <TemplateItemsEditor
          toolbarActions={
            <>
              {editable && (
                <Button onClick={handleSave} isLoading={save.isPending} disabled={!canSave}>
                  {text.SAVE}
                </Button>
              )}
              {editable && (
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
              )}
            </>
          }
          onReorder={(keys) => setItems((current) => applyVisibleOrder(current, keys))}
          renderPalette={
            isDefault || !baseItems
              ? undefined
              : (activeTab) => (
                  <ItemPalette
                    title={text.PALETTE_TITLE}
                    hint={text.PALETTE_HINT}
                    addLabel={text.ADD_TYPE}
                    emptyText={text.PALETTE_EMPTY}
                    entries={findAddableItems(baseItems, items)
                      .filter((item) => activeTab === "ALL" || item.section === activeTab)
                      .map((item) => ({
                        id: item.taskTypeKey,
                        label: item.taskTypeKey,
                        section: item.section,
                      }))}
                    grouped={activeTab === "ALL"}
                    sectionLabel={(section) =>
                      skillLabels[section as keyof typeof skillLabels] ?? section
                    }
                    sectionTone={sectionTone}
                    dragType={TASK_TYPE_DRAG_TYPE}
                    dropAttribute={PALETTE_DROP_ATTRIBUTE}
                    onAdd={(key) => setItems((current) => addBackItem(current, baseItems, key))}
                  />
                )
          }
          onDropTaskType={(key) =>
            baseItems && setItems((current) => addBackItem(current, baseItems, key))
          }
          sidePanel={
            <>
              <HostTemplateInfoPanel
                template={template}
                editable={editable}
                name={name}
                onNameChange={setName}
              />
              {!isDefault && (
                <HostTemplateDurationSummary
                  parts={feasibility.data?.parts}
                  totalMaxSeconds={feasibility.data?.totalMaxSeconds}
                />
              )}
            </>
          }
          items={items}
          editable={editable}
          isWeightEditable={isWeightEditable}
          pool={isDefault || !feasibility.data ? undefined : pool}
          onRemove={(key) => setItems((current) => removeItem(current, key))}
          onWeightChange={(key, skill, value) =>
            setItems((current) => setWeight(current, key, skill, value))
          }
        />
      </section>

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

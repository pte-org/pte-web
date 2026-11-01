"use client";

import { useEffect, useMemo, useState, type ReactElement } from "react";
import Link from "next/link";
import { Alert, Button, ConfirmDialog, Input, LoadingState, PageHeader, useToast } from "@pte/ui";
import type { ScoreTemplateItemRequest, ScoreTemplateResponse } from "@pte/api-client";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { useActiveScoreTemplate } from "@/features/exams/api";
import {
  useActivateHostTemplate,
  useHostTemplate,
  useHostTemplateFeasibility,
  useReplaceHostTemplateItems,
} from "../api";
import { HOST_TEMPLATES_ROUTE } from "../constants";
import { useEditorText, useListText, useSkillLabels } from "../hooks/useTemplateText";
import { templateActionError } from "../utils/actionError";
import { buildPoolIndex, countShortTypes } from "../utils/pool";
import {
  areWeightsValid,
  buildWeightEditableCheck,
  computeSkillTotals,
  removeItem,
  setWeight,
  toEditableItems,
} from "../utils/weights";
import { BalanceWeightsDialog } from "./BalanceWeightsDialog";
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
      <Link href={HOST_TEMPLATES_ROUTE} className="text-sm text-[var(--action)] hover:underline">
        ← {text.BACK}
      </Link>
      <PageHeader
        title={template.name}
        actions={
          editable ? (
            <>
              <Button variant="primary" appearance="outline" onClick={() => setBalanceOpen(true)}>
                {text.BALANCE}
              </Button>
              <Button onClick={handleSave} disabled={!canSave || save.isPending}>
                {save.isPending ? text.SAVING : text.SAVE}
              </Button>
              <Button
                onClick={() => setActivateOpen(true)}
                disabled={dirty || activate.isPending}
                title={dirty ? text.SAVE_FIRST : undefined}
              >
                {listText.ACTIVATE}
              </Button>
            </>
          ) : undefined
        }
      />

      {!editable && (
        <Alert tone="info">{isDefault ? text.DEFAULT_READ_ONLY : text.READ_ONLY}</Alert>
      )}
      {submitError && <Alert tone="error">{submitError}</Alert>}
      {items.length === 0 && <Alert tone="warning">{text.NO_TASKS}</Alert>}

      {editable && (
        <div className="max-w-md">
          <Input
            label={text.NAME_LABEL}
            value={name}
            maxLength={200}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
      )}

      <section className="flex flex-col gap-2">
        <div>
          <h2 className="text-base font-semibold text-[var(--ink-primary)]">{text.TASKS_TITLE}</h2>
          {editable && <p className="text-xs text-[var(--ink-muted)]">{text.TASKS_HINT}</p>}
          {editable && shortTypes > 0 && (
            <p className="mt-1 text-xs text-red-700">
              {text.POOL_SUMMARY.replace("{count}", String(shortTypes))}
            </p>
          )}
        </div>
        <TemplateItemsEditor
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

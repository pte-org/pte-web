"use client";

import { useEffect, useMemo, useState, type ReactElement } from "react";
import Link from "next/link";
import { Alert, Button, ConfirmDialog, Input, LoadingState, PageHeader, useToast } from "@pte/ui";
import type { ScoreTemplateItemRequest, ScoreTemplateResponse } from "@pte/api-client";
import { errorMessage } from "@/features/examoperations/errorMessage";
import {
  useActivateHostTemplate,
  useHostTemplate,
  useReplaceHostTemplateItems,
} from "../api";
import { HOST_TEMPLATES_ROUTE } from "../constants";
import { useEditorText, useListText } from "../hooks/useTemplateText";
import {
  areWeightsValid,
  computeSkillTotals,
  removeItem,
  setWeight,
  toEditableItems,
} from "../utils/weights";
import { BalanceWeightsDialog } from "./BalanceWeightsDialog";
import { SkillTotalsPanel } from "./SkillTotalsPanel";
import { TemplateItemsEditor } from "./TemplateItemsEditor";

interface HostTemplateEditorViewProps {
  publicId: string;
}

export const HostTemplateEditorView = ({ publicId }: HostTemplateEditorViewProps): ReactElement => {
  const text = useEditorText();
  const { data: template, isLoading, error } = useHostTemplate(publicId);

  if (isLoading) return <LoadingState rows={4} />;
  if (error || !template) {
    return <Alert tone="error">{errorMessage(error, text.NOT_FOUND)}</Alert>;
  }
  // Keyed on the server version so a fresh save or reload resets the local draft.
  return <EditorBody key={`${template.publicId}-${template.version}`} template={template} />;
};

const EditorBody = ({ template }: { template: ScoreTemplateResponse }): ReactElement => {
  const text = useEditorText();
  const listText = useListText();
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

  const totals = useMemo(() => computeSkillTotals(items), [items]);
  const weightsValid = areWeightsValid(totals);
  const dirty = useMemo(
    () =>
      name !== template.name ||
      JSON.stringify(items) !== JSON.stringify(toEditableItems(template.items)),
    [name, items, template],
  );
  const canSave = editable && dirty && items.length > 0 && weightsValid && name.trim().length > 0;

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent): void => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const submitError = errorMessage(save.error) ?? errorMessage(activate.error);

  const handleSave = (): void => {
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
                disabled={dirty || !weightsValid || activate.isPending}
                title={dirty ? text.SAVE_FIRST : undefined}
              >
                {listText.ACTIVATE}
              </Button>
            </>
          ) : undefined
        }
      />

      {!editable && <Alert tone="info">{text.READ_ONLY}</Alert>}
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

      <SkillTotalsPanel totals={totals} />

      <section className="flex flex-col gap-2">
        <div>
          <h2 className="text-base font-semibold text-[var(--ink-primary)]">{text.TASKS_TITLE}</h2>
          {editable && <p className="text-xs text-[var(--ink-muted)]">{text.TASKS_HINT}</p>}
        </div>
        <TemplateItemsEditor
          items={items}
          editable={editable}
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

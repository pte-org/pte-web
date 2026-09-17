"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, LoadingState, PageHeader } from "@pte/ui";
import { useActivateScoreTemplate, useReplaceScoreTemplateItems, useScoreTemplate } from "../api";
import { SCORE_TEMPLATE_TEXT } from "../constants";
import { fromDraft, toDraft, type ScoreTemplateItemDraft, type ScoreTemplateResponse } from "../types";
import { ActivateTemplateModal } from "./ActivateTemplateModal";
import { ScoreTemplateItemTable } from "./_ScoreTemplateItemTable";

interface ScoreTemplateEditorViewProps {
  publicId: string;
}

/** DRAFT only — a template that's ACTIVE/RETIRED is never reachable here in normal navigation (list only links non-DRAFT rows to the detail route), but the backend is the real guard (`ScoreTemplateNotDraftException`, 409). */
export const ScoreTemplateEditorView = ({ publicId }: ScoreTemplateEditorViewProps): ReactElement => {
  const { data: template, isLoading, isError } = useScoreTemplate(publicId);

  if (isLoading) {
    return <LoadingState rows={6} />;
  }
  if (isError || !template) {
    return <Alert tone="error">Could not load this score template.</Alert>;
  }
  if (template.status !== "DRAFT") {
    return <Alert tone="warning">{SCORE_TEMPLATE_TEXT.NOT_DRAFT_ERROR}</Alert>;
  }

  // `key` forces a fresh mount (and fresh useState initializers below) if
  // `publicId` ever changes under this component instead of leaving stale
  // draft state from a previous template — the React-recommended
  // alternative to syncing fetched data into local state via useEffect.
  return <ScoreTemplateEditorForm key={template.publicId} template={template} />;
};

interface ScoreTemplateEditorFormProps {
  template: ScoreTemplateResponse;
}

const ScoreTemplateEditorForm = ({ template }: ScoreTemplateEditorFormProps): ReactElement => {
  const router = useRouter();
  const replaceItemsMutation = useReplaceScoreTemplateItems();
  const activateMutation = useActivateScoreTemplate();
  const [name, setName] = useState(template.name);
  const [items, setItems] = useState<ScoreTemplateItemDraft[]>(() => template.items.map(toDraft));
  const [activateTarget, setActivateTarget] = useState<ScoreTemplateResponse | null>(null);

  const handleItemChange = (index: number, field: keyof ScoreTemplateItemDraft, value: string): void => {
    setItems((current) => current.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const handleSaveDraft = (): void => {
    replaceItemsMutation.mutate({
      publicId: template.publicId,
      payload: { name, items: items.map(fromDraft) },
    });
  };

  const handleActivateConfirmed = (target: ScoreTemplateResponse): void => {
    activateMutation.mutate(target.publicId, {
      onSuccess: () => {
        setActivateTarget(null);
        router.push(`/admin/score-template/${target.publicId}`);
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

      <ScoreTemplateItemTable editable items={items} onChange={handleItemChange} />

      <ActivateTemplateModal
        template={activateTarget}
        isActivating={activateMutation.isPending}
        onCancel={() => setActivateTarget(null)}
        onConfirm={handleActivateConfirmed}
      />
    </div>
  );
};

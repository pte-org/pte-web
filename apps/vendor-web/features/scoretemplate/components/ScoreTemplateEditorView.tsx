"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@pte/api-client";
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
      ? replaceItemsMutation.error instanceof ApiError
        ? replaceItemsMutation.error.message
        : SCORE_TEMPLATE_TEXT.NOT_DRAFT_ERROR
      : undefined;

  const handleItemChange = (index: number, field: keyof ScoreTemplateItemDraft, value: string): void => {
    setItems((current) => current.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
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
              router.push(`/admin/score-template/${target.publicId}`);
            },
            onError: (error) => {
              setConfirmError(error instanceof ApiError ? error.message : SCORE_TEMPLATE_TEXT.CONCURRENT_MODIFICATION_ERROR);
            },
          });
        },
        onError: (error) => {
          setConfirmError(error instanceof ApiError ? error.message : SCORE_TEMPLATE_TEXT.NOT_DRAFT_ERROR);
        },
      },
    );
  };

  const handleOpenActivate = (): void => {
    setConfirmError(undefined);
    setActivateTarget(template);
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
            <Button variant="primary" onClick={handleOpenActivate}>
              {SCORE_TEMPLATE_TEXT.ACTIVATE_ACTION}
            </Button>
            <Button variant="ghost" onClick={() => router.push("/admin/score-template")}>
              {SCORE_TEMPLATE_TEXT.DETAIL_BACK}
            </Button>
          </>
        }
      />

      {saveErrorMessage && <Alert tone="error">{saveErrorMessage}</Alert>}

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
        isActivating={replaceItemsMutation.isPending || activateMutation.isPending}
        errorMessage={confirmError}
        onCancel={() => setActivateTarget(null)}
        onConfirm={handleActivateConfirmed}
      />
    </div>
  );
};

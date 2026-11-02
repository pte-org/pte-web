"use client";

import { useToast } from "@pte/ui";
import type { ScoreTemplateResponse } from "@pte/api-client";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { useReplaceScoreTemplateItems } from "@/features/scoretemplate/api";
import { getScoreTemplateErrorMessage } from "@/features/scoretemplate/errorMessage";
import type { ScoreTemplateItemDraft } from "@/features/scoretemplate/types";
import { EXAM_STUDIO_TEXT } from "../constants";
import { buildReplacePayload, draftsOf } from "../editTemplateItems";

interface StudioTemplateEditor {
  /** Saves the template rows produced by `change` from the rows it holds right now. */
  edit: (change: (items: ScoreTemplateItemDraft[]) => ScoreTemplateItemDraft[]) => void;
  isSaving: boolean;
}

/** Every change goes to the server at once; the template query refreshes with what was saved. */
export function useStudioTemplateEditor(
  template: ScoreTemplateResponse | undefined,
): StudioTemplateEditor {
  const mutation = useReplaceScoreTemplateItems();
  const { showToast } = useToast();
  const text = useAdminCopy(EXAM_STUDIO_TEXT);

  const edit: StudioTemplateEditor["edit"] = (change) => {
    if (!template || mutation.isPending) return;
    mutation.mutate(
      { publicId: template.publicId, payload: buildReplacePayload(template, change(draftsOf(template))) },
      {
        onError: (error) =>
          showToast(getScoreTemplateErrorMessage(error, text.SAVE_ERROR), { tone: "error" }),
      },
    );
  };

  return { edit, isSaving: mutation.isPending };
}

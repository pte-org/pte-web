"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Button, useLocale } from "@pte/ui";
import { GenerationDialog } from "@/features/questiongeneration/components";
import { generationLiveHref } from "@/features/questiongeneration/liveConstants";
import { generationMessages as generationEn } from "@/features/questiongeneration/messages/en";
import { generationMessages as generationVi } from "@/features/questiongeneration/messages/vi";
import { hasTypedContent } from "../questionPreviewDraft";
import type { QuestionPreviewDraft } from "../types";

interface GenerateWithAiActionProps {
  /** What the form holds now: its task type is pre-ticked in the popup, typed text asks before a batch leaves. */
  draft: QuestionPreviewDraft | null;
}

/** The "Create with AI" button and its popup, the same wherever a person writes a new question. */
export const GenerateWithAiAction = ({ draft }: GenerateWithAiActionProps): ReactElement => {
  const { locale } = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
        ✦ {(locale === "vi" ? generationVi : generationEn).generateWithAi}
      </Button>
      <GenerationDialog
        open={open}
        currentTaskType={draft?.taskType || undefined}
        isEditorDirty={hasTypedContent(draft)}
        onClose={() => setOpen(false)}
        onSingleJobCreated={(jobId) => {
          setOpen(false);
          // The run is followed on its own page; when it is done that page brings the question back to a new-question form.
          router.push(generationLiveHref(jobId));
        }}
      />
    </>
  );
};

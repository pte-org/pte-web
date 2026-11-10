"use client";

import { useState, type ReactElement } from "react";
import type { ScoreTemplateResponse } from "@pte/api-client";
import { Alert, Button, Input, Modal, useToast } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { useUpdateScoreTemplateTimeFrame } from "../api";
import { SCORE_TEMPLATE_TEXT as RAW_SCORE_TEMPLATE_TEXT } from "../constants";
import {
  checkTimeFrame,
  draftToTimeFrame,
  pearsonTimeFrameDraft,
  timeFrameToDraft,
  type TimeFrameDraft,
  type TimeFrameProblem,
} from "../timeFrame";

interface TemplateTimeFrameDialogProps {
  open: boolean;
  onClose: () => void;
  template: ScoreTemplateResponse;
}

const PARTS = [
  { label: "PART_SPEAKING_WRITING", min: "speakingWritingMin", max: "speakingWritingMax" },
  { label: "PART_READING", min: "readingMin", max: "readingMax" },
  { label: "PART_LISTENING", min: "listeningMin", max: "listeningMax" },
] as const;

/** The Pearson time window of a draft template: minutes per part and a ceiling for the whole test. */
export const TemplateTimeFrameDialog = ({
  open,
  onClose,
  template,
}: TemplateTimeFrameDialogProps): ReactElement => {
  const T = useAdminCopy(RAW_SCORE_TEMPLATE_TEXT);
  const { showToast } = useToast();
  const save = useUpdateScoreTemplateTimeFrame();
  const [draft, setDraft] = useState<TimeFrameDraft>(() => timeFrameToDraft(template.timeFrame));
  const [problem, setProblem] = useState<TimeFrameProblem | null>(null);

  const set = (field: keyof TimeFrameDraft, value: string): void => {
    setDraft((current) => ({ ...current, [field]: value }));
    setProblem(null);
  };
  const handleSave = (): void => {
    const found = checkTimeFrame(draft);
    setProblem(found);
    if (found) return;
    save.mutate(
      { publicId: template.publicId, timeFrame: draftToTimeFrame(draft) },
      {
        onSuccess: () => {
          showToast(T.FRAME_SAVED);
          onClose();
        },
        onError: () => showToast(T.FRAME_SAVE_ERROR, { tone: "error" }),
      },
    );
  };
  const problemText =
    problem?.kind === "not-a-number"
      ? T.FRAME_ERROR_NUMBER
      : problem?.kind === "range"
        ? T.FRAME_ERROR_RANGE
        : problem?.kind === "total"
          ? T.FRAME_ERROR_TOTAL
          : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={T.MENU_TIME_FRAME}
      footer={
        <>
          <Button variant="secondary" onClick={() => setDraft(pearsonTimeFrameDraft())}>
            {T.FRAME_RESTORE}
          </Button>
          <Button isLoading={save.isPending} onClick={handleSave}>
            {T.SAVE_DRAFT}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-[var(--ink-secondary)]">{T.TIME_FRAME_HINT}</p>
        {PARTS.map((part) => (
          <div key={part.label} className="grid grid-cols-[1fr_6rem_6rem] items-end gap-3">
            <span className="pb-2 text-sm font-medium text-[var(--ink-primary)]">
              {T[part.label]}
            </span>
            <Input
              id={`frame-${part.min}`}
              type="number"
              label={T.FRAME_MIN}
              value={draft[part.min]}
              onChange={(event) => set(part.min, event.target.value)}
            />
            <Input
              id={`frame-${part.max}`}
              type="number"
              label={T.FRAME_MAX}
              value={draft[part.max]}
              onChange={(event) => set(part.max, event.target.value)}
            />
          </div>
        ))}
        <Input
          id="frame-total-max"
          type="number"
          label={T.FRAME_TOTAL}
          value={draft.totalMax}
          onChange={(event) => set("totalMax", event.target.value)}
        />
        {problemText && <Alert tone="error">{problemText}</Alert>}
      </div>
    </Modal>
  );
};

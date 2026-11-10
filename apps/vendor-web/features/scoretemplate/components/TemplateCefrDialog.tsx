"use client";

import { useState, type ReactElement } from "react";
import type { ScoreTemplateResponse } from "@pte/api-client";
import { Alert, Button, Chip, Input, Modal, useToast } from "@pte/ui";
import { cefrTone } from "@/lib/chipTones";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { useUpdateScoreTemplateCefrTargets } from "../api";
import {
  CEFR_MIX_LEVELS,
  draftToTargets,
  isValidMix,
  mixToDraft,
  mixTotal,
  type CefrMixDraft,
  type CefrMixLevel,
} from "../cefrMix";
import { SCORE_TEMPLATE_TEXT as RAW_SCORE_TEMPLATE_TEXT } from "../constants";

interface TemplateCefrDialogProps {
  open: boolean;
  onClose: () => void;
  template: ScoreTemplateResponse;
}

/** The CEFR mix exams built from a draft template aim for: a whole percent per level, adding up to 100. */
export const TemplateCefrDialog = ({
  open,
  onClose,
  template,
}: TemplateCefrDialogProps): ReactElement => {
  const T = useAdminCopy(RAW_SCORE_TEMPLATE_TEXT);
  const { showToast } = useToast();
  const save = useUpdateScoreTemplateCefrTargets();
  const [draft, setDraft] = useState<CefrMixDraft>(() => mixToDraft(template.cefrTargets));
  const [attempted, setAttempted] = useState(false);
  const valid = isValidMix(draft);

  const set = (level: CefrMixLevel, value: string): void => {
    setDraft((current) => ({ ...current, [level]: value }));
    setAttempted(false);
  };
  const handleSave = (): void => {
    setAttempted(true);
    if (!valid) return;
    save.mutate(
      { publicId: template.publicId, targets: draftToTargets(draft) },
      {
        onSuccess: () => {
          showToast(T.CEFR_SAVED);
          onClose();
        },
        onError: () => showToast(T.CEFR_SAVE_ERROR, { tone: "error" }),
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={T.MENU_CEFR_MIX}
      footer={
        <Button isLoading={save.isPending} onClick={handleSave}>
          {T.SAVE_DRAFT}
        </Button>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-[var(--ink-secondary)]">{T.CEFR_HINT}</p>
        <div className="grid grid-cols-3 gap-3">
          {CEFR_MIX_LEVELS.map((level) => (
            <div key={level} className="space-y-1">
              <Chip tone={cefrTone(level)}>{level}</Chip>
              <Input
                id={`cefr-${level}`}
                type="number"
                label="%"
                value={draft[level]}
                onChange={(event) => set(level, event.target.value)}
              />
            </div>
          ))}
        </div>
        <p className="text-sm font-medium text-[var(--ink-primary)]">
          {T.CEFR_TOTAL}: {mixTotal(draft)}%
        </p>
        {attempted && !valid && <Alert tone="error">{T.CEFR_ERROR}</Alert>}
      </div>
    </Modal>
  );
};

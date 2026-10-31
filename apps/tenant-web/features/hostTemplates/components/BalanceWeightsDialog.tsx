"use client";

import { useEffect, useState, type ReactElement } from "react";
import type { ScoreTemplateItemRequest, SkillWeightSuggestion } from "@pte/api-client";
import { Alert, Button, Modal } from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { useSuggestSkillWeights } from "../api";
import { DEFAULT_REDISTRIBUTION_MODE, type RedistributionMode } from "../constants";
import { useEditorText, useModeText } from "../hooks/useTemplateText";
import { WEIGHT_FIELD, applySuggestedColumn, toSuggestionItems } from "../utils/weights";

interface BalanceWeightsDialogProps {
  open: boolean;
  onClose: () => void;
  items: readonly ScoreTemplateItemRequest[];
  onApply: (items: ScoreTemplateItemRequest[]) => void;
}

const MODES: readonly RedistributionMode[] = ["PROPORTIONAL", "EQUAL", "MANUAL"];

/**
 * Suggests how to fill each skill's gap after task types were removed. The
 * server computes both automatic columns; the host previews the chosen one
 * and nothing changes until "Apply".
 */
export const BalanceWeightsDialog = ({
  open,
  ...rest
}: BalanceWeightsDialogProps): ReactElement | null =>
  // Mounted only while open, so every opening starts from the default mode and a fresh suggestion.
  open ? <BalanceWeightsContent {...rest} /> : null;

const BalanceWeightsContent = ({
  onClose,
  items,
  onApply,
}: Omit<BalanceWeightsDialogProps, "open">): ReactElement => {
  const text = useEditorText();
  const modeText = useModeText();
  const [mode, setMode] = useState<RedistributionMode>(DEFAULT_REDISTRIBUTION_MODE);
  const { mutate, data, error, isPending, reset } = useSuggestSkillWeights();

  useEffect(() => {
    mutate({ items: toSuggestionItems(items) });
    return reset;
    // The snapshot is taken when the dialog opens; later edits are made after it closes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unbalanced = (data?.skills ?? []).filter((skill) => !skill.balanced);
  const columnOf = (skill: SkillWeightSuggestion) =>
    mode === "EQUAL" ? skill.equal : skill.proportional;

  const apply = (): void => {
    let next = [...items];
    for (const skill of unbalanced) {
      next = applySuggestedColumn(next, skill.skill as keyof typeof WEIGHT_FIELD, columnOf(skill));
    }
    onApply(next);
    onClose();
  };

  const canApply = mode !== "MANUAL" && unbalanced.length > 0;

  return (
    <Modal
      open
      onClose={onClose}
      title={text.BALANCE_TITLE}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {text.CLOSE}
          </Button>
          {canApply && <Button onClick={apply}>{text.APPLY}</Button>}
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-[var(--ink-secondary)]">{text.BALANCE_INTRO}</p>

        <fieldset className="flex flex-col gap-2">
          {MODES.map((value) => (
            <label
              key={value}
              className="flex cursor-pointer items-start gap-2 rounded-lg border border-[var(--shell-border)] p-3 has-[:checked]:border-[var(--action)]"
            >
              <input
                type="radio"
                name="redistribution-mode"
                className="mt-1"
                checked={mode === value}
                onChange={() => setMode(value)}
              />
              <span>
                <span className="block text-sm font-medium text-[var(--ink-primary)]">
                  {modeText[value].label}
                </span>
                <span className="block text-xs text-[var(--ink-muted)]">{modeText[value].hint}</span>
              </span>
            </label>
          ))}
        </fieldset>

        {isPending && <p className="text-sm text-[var(--ink-muted)]">…</p>}
        {Boolean(error) && (
          <Alert tone="error">{errorMessage(error, text.SUGGEST_FAILED)}</Alert>
        )}
        {data && unbalanced.length === 0 && <Alert tone="success">{text.BALANCE_ALREADY}</Alert>}

        {mode === "MANUAL" && unbalanced.length > 0 && (
          <Alert tone="info">{text.MANUAL_NOTE}</Alert>
        )}

      </div>
    </Modal>
  );
};

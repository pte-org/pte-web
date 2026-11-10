"use client";
import type { ReactElement } from "react";
import type { ExaminerRubricResponse } from "@pte/api-client";
import { Disclosure, Textarea } from "@pte/ui";
import type { ExaminerTraitText } from "../traitText";
import type { AiTraitRationale } from "../utils/aiRationale";
import { AI_GAP_REASON_MAX_LENGTH, AI_GAP_THRESHOLD } from "../constants";
import { TraitLevelPicker } from "./TraitLevelPicker";

type RubricTrait = ExaminerRubricResponse["traits"][number];

interface ExaminerTraitRowProps {
  trait: RubricTrait;
  label: string;
  text: ExaminerTraitText;
  value: number | null | undefined;
  /** Set only once the AI may be shown (blind marking). */
  aiLevel?: number;
  rationale?: AiTraitRationale;
  gapReason: string;
  readOnly?: boolean;
  disabled: boolean;
  onChange?: (value: number) => void;
  onGapReasonChange?: (reason: string) => void;
}

export const ExaminerTraitRow = ({ trait, label, text, value, aiLevel, rationale, gapReason, readOnly = false, disabled,
  onChange, onGapReasonChange }: ExaminerTraitRowProps): ReactElement => {
  const gap = trait.editable && aiLevel !== undefined && value !== null && value !== undefined
    && Math.abs(value - aiLevel) >= AI_GAP_THRESHOLD;
  const chosen = value === null || value === undefined ? "—" : String(value);
  const title = <span className="flex items-baseline justify-between gap-2">
    <span>{label}</span>
    <span className="text-xs font-normal tabular-nums text-[var(--ink-muted)]">
      {chosen} / {trait.maxScore}{aiLevel !== undefined ? ` · ${text.aiBadge} ${aiLevel}` : ""}
      {trait.useAiWhenNull ? ` · ${text.machine}` : trait.editable ? "" : ` · ${text.form}`}
    </span>
  </span>;
  // Open while there is a band to choose; a submitted score starts folded to its one-line summary.
  return <Disclosure title={title} defaultOpen={!readOnly && trait.editable}
    className="rounded-xl border border-[var(--border-subtle)] p-1" titleClassName="flex-1">
    <div className="px-2 pb-2">
    {trait.editable ? <TraitLevelPicker traitKey={trait.key} maxScore={trait.maxScore} levels={trait.levels} value={value}
      aiLevel={aiLevel} aiLabel={text.aiBadge} disabled={disabled} onChange={onChange} />
      : <p className="text-sm">{value ?? "—"} / {trait.maxScore}</p>}
    {trait.useAiWhenNull && <p className="mt-1 text-xs text-[var(--ink-muted)]">{text.azureNote}</p>}
    {aiLevel !== undefined && rationale && <div className="mt-2 space-y-1 rounded-lg bg-violet-50 px-3 py-2 text-xs">
      {rationale.reason && <p><span className="font-medium">{text.aiReason}: </span>{rationale.reason}</p>}
      {rationale.evidence && <p><span className="font-medium">{text.aiEvidence}: </span>“{rationale.evidence}”</p>}
    </div>}
    {gap && readOnly && gapReason && <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
      <span className="font-medium">{text.gapSaved}: </span>{gapReason}</p>}
    {gap && !readOnly && <div className="mt-2 space-y-2 rounded-lg bg-amber-50 px-3 py-2">
      <p className="text-xs text-amber-800">{text.gapHint}</p>
      <Textarea id={`gap-reason-${trait.key}`} rows={2} maxLength={AI_GAP_REASON_MAX_LENGTH} value={gapReason}
        placeholder={text.gapPlaceholder} disabled={disabled} onChange={(event) => onGapReasonChange?.(event.target.value)} />
    </div>}
    </div>
  </Disclosure>;
};

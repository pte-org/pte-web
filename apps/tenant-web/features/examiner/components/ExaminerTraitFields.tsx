"use client";
import type { ReactElement } from "react";
import type { ExaminerAnswerDetailResponse, ScoreTraceResponse } from "@pte/api-client";
import { Alert, useLocale } from "@pte/ui";
import { EXAMINER_TRAIT_TEXT, type ExaminerTraitText } from "../traitText";
import { readAiRationales } from "../utils/aiRationale";
import { ExaminerTraitRow } from "./ExaminerTraitRow";
interface Props { answer: ExaminerAnswerDetailResponse; values: Record<string, number | null>;
  itemScore?: number | null; trace?: ScoreTraceResponse | null; disabled: boolean;
  /** Blind marking: AI bands are marked only once the examiner may see them. */
  aiRevealed?: boolean; gapReasons?: Record<string, string>;
  /** A submitted score: no completion hint and no gap reason to fill in. */
  readOnly?: boolean;
  onChange?: (key: string, value: number | null) => void;
  onGapReasonChange?: (key: string, reason: string) => void; }
export function ExaminerTraitFields({ answer, values, itemScore, trace, disabled, aiRevealed = false, gapReasons = {}, readOnly = false,
  onChange, onGapReasonChange }: Props): ReactElement {
  const { locale } = useLocale();
  const text = EXAMINER_TRAIT_TEXT[locale === "vi" ? "vi" : "en"];
  const rubric = answer.rubric;
  if (!rubric) return <></>;
  const reference = answer.aiReference;
  const aiScores = reference?.availability === "AVAILABLE" && reference.rubricVersionPublicId === rubric.rubricVersionPublicId
    ? reference.traitScores ?? {} : {};
  const rationales = readAiRationales(answer.ai);
  const machineMissing = rubric.traits.some((trait) => trait.useAiWhenNull && aiScores[trait.key] === undefined
    && (values[trait.key] === null || values[trait.key] === undefined));
  return <div className="space-y-4">
    <h3 className="font-semibold">{text.title}</h3>
    {machineMissing && <Alert tone="warning" title={text.machine}>{text.missingAi}</Alert>}
    {rubric.traits.map((trait) => {
      const label = locale === "vi" ? trait.displayNameVi : trait.displayNameEn;
      // An Azure trait shows the machine band until the examiner picks another one.
      const value = trait.useAiWhenNull ? values[trait.key] ?? aiScores[trait.key]
        : trait.editable ? values[trait.key] : rubric.mechanicalScores[trait.key];
      return <ExaminerTraitRow key={trait.key} trait={trait} label={label} text={text} value={value}
        aiLevel={aiRevealed ? aiScores[trait.key] : undefined} rationale={rationales[trait.key]}
        gapReason={gapReasons[trait.key] ?? ""} readOnly={readOnly} disabled={disabled} onChange={(band) => onChange?.(trait.key, band)}
        onGapReasonChange={(reason) => onGapReasonChange?.(trait.key, reason)} />;
    })}
    <ItemScoreSummary text={text} itemScore={itemScore} trace={trace} readOnly={readOnly} />
  </div>;
}

interface SummaryProps { text: ExaminerTraitText; itemScore?: number | null; trace?: ScoreTraceResponse | null; readOnly: boolean }

const ItemScoreSummary = ({ text, itemScore, trace, readOnly }: SummaryProps): ReactElement => <div className="space-y-2">
  <p className="text-sm font-semibold">{text.server}: {itemScore ?? "—"} / 100</p>
  {trace?.gateTriggeredBy && <Alert tone="warning" title={text.gate}>{trace.gateTriggeredBy}</Alert>}
  {trace && <>
    <p className="text-xs text-[var(--ink-muted)]">{text.formula}</p>
    <ul className="space-y-1 text-xs tabular-nums">{trace.contributions.map((entry) =>
      <li key={entry.key}>{entry.key}: {entry.achieved}/{entry.max} · {text.weight}: {entry.effectiveWeight} · {text.contribution}: {entry.weightedContribution ?? "—"}</li>)}</ul>
  </>}
  {!readOnly && <p className="text-xs text-[var(--ink-muted)]">{itemScore === null || itemScore === undefined ? text.pending : text.autosave}</p>}
</div>;

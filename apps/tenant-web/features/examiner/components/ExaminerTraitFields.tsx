"use client";
import type { ReactElement } from "react";
import type { ExaminerAnswerDetailResponse, ScoreTraceResponse } from "@pte/api-client";
import { Alert, Select, useLocale } from "@pte/ui";
import { EXAMINER_TRAIT_TEXT } from "../traitText";
interface Props { answer: ExaminerAnswerDetailResponse; values: Record<string, number | null>;
  itemScore?: number | null; trace?: ScoreTraceResponse | null; disabled: boolean;
  onChange?: (key: string, value: number | null) => void; }
export function ExaminerTraitFields({ answer, values, itemScore, trace, disabled, onChange }: Props): ReactElement {
  const { locale } = useLocale();
  const text = EXAMINER_TRAIT_TEXT[locale === "vi" ? "vi" : "en"];
  const rubric = answer.rubric;
  if (!rubric) return <></>;
  const reference = answer.aiReference;
  const machineMissing = rubric.traits.some((trait) => trait.useAiWhenNull && (reference?.availability !== "AVAILABLE"
    || reference.rubricVersionPublicId !== rubric.rubricVersionPublicId || reference.traitScores?.[trait.key] === undefined));
  return <div className="space-y-4">
    <h3 className="font-semibold">{text.title}</h3>
    {machineMissing && <Alert tone="warning" title={text.machine}>{text.missingAi}</Alert>}
    {rubric.traits.map((trait) => {
      const label = locale === "vi" ? trait.displayNameVi : trait.displayNameEn;
      const value = trait.editable ? values[trait.key] : trait.useAiWhenNull
        ? answer.aiReference?.traitScores?.[trait.key] : rubric.mechanicalScores[trait.key];
      return <div key={trait.key}>
        {trait.editable ? <Select id={`trait-${trait.key}`} label={`${label} / ${trait.maxScore}`}
          placeholder={text.choose} value={value === null || value === undefined ? "" : String(value)}
          disabled={disabled} onChange={(event) => onChange?.(trait.key, event.target.value === "" ? null : Number(event.target.value))}
          options={Array.from({ length: trait.maxScore + 1 }, (_, level) => ({ value: String(level),
            label: `${level} — ${trait.levels.find((entry) => entry.level === level)?.text ?? level}` }))} />
          : <p className="text-sm">{label}: {value ?? "—"} / {trait.maxScore} <span className="text-xs text-slate-500">{trait.useAiWhenNull ? text.machine : text.form}</span></p>}
      </div>;
    })}
    <p className="text-sm font-semibold">{text.server}: {itemScore ?? "—"} / 100</p>
    {trace?.gateTriggeredBy && <Alert tone="warning" title={text.gate}>{trace.gateTriggeredBy}</Alert>}
    {trace && <ul className="space-y-1 text-xs">{trace.contributions.map((entry) =>
      <li key={entry.key}>{entry.key}: {entry.achieved}/{entry.max} · {text.weight}: {entry.effectiveWeight} · {text.contribution}: {entry.weightedContribution ?? "—"}</li>)}</ul>}
    <p className="text-xs text-slate-500">{itemScore === null || itemScore === undefined ? text.pending : text.autosave}</p>
  </div>;
}

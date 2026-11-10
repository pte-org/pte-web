"use client";
import type { ReactElement } from "react";
import type { ExaminerAnswerDetailResponse } from "@pte/api-client";
import { Disclosure, cn, levelDotClass, traitTone, useLocale } from "@pte/ui";
import { EXAMINER_EXPLANATION_TEXT, type ExaminerExplanationText } from "../explanationText";
import { readAiRationales, type AiTraitRationale } from "../utils/aiRationale";
import { readAiSpeechInputs, type AiSpeechInputs } from "../utils/aiSpeechInputs";
import { EXAMINER_TRAIT_TEXT, type ExaminerTraitText } from "../traitText";

type RubricTrait = NonNullable<ExaminerAnswerDetailResponse["rubric"]>["traits"][number];

const PRONUNCIATION = "PRONUNCIATION";
const ORAL_FLUENCY = "ORAL_FLUENCY";
const CONTENT = "CONTENT";
const AZURE_SOURCE = "AZURE";

interface AiTraitExplanationProps { answer: ExaminerAnswerDetailResponse }

/** Per trait of the current answer: the band the AI chose, what that band means, and what the AI based it on. */
export const AiTraitExplanation = ({ answer }: AiTraitExplanationProps): ReactElement | null => {
  const { locale } = useLocale();
  const vi = locale === "vi";
  const text = EXAMINER_EXPLANATION_TEXT[vi ? "vi" : "en"];
  const traitText = EXAMINER_TRAIT_TEXT[vi ? "vi" : "en"];
  const rubric = answer.rubric;
  if (!rubric || rubric.traits.length === 0) return null;
  const scores = answer.aiReference?.traitScores ?? {};
  const rationales = readAiRationales(answer.ai);
  const speech = readAiSpeechInputs(answer.ai);
  const hasAzure = rubric.traits.some((trait) => trait.source === AZURE_SOURCE);

  return <Disclosure title={text.title} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-1">
    <div className="space-y-3 px-2 pb-2 text-sm">
      {hasAzure && <p className="text-xs text-[var(--ink-secondary)]">{text.azureHow}</p>}
      {rubric.traits.map((trait, index) => <TraitExplanation key={trait.key} trait={trait} index={index}
        label={vi ? trait.displayNameVi : trait.displayNameEn} band={scores[trait.key]} rationale={rationales[trait.key]}
        speech={speech} text={text} traitText={traitText} />)}
    </div>
  </Disclosure>;
};

interface TraitExplanationProps {
  trait: RubricTrait;
  index: number;
  label: string;
  band: number | undefined;
  rationale: AiTraitRationale | undefined;
  speech: AiSpeechInputs;
  text: ExaminerExplanationText;
  traitText: ExaminerTraitText;
}

const TraitExplanation = ({ trait, index, label, band, rationale, speech, text, traitText }: TraitExplanationProps): ReactElement => {
  const descriptor = band === undefined ? undefined : trait.levels.find((entry) => entry.level === band)?.text;
  const azureInput: [string, number | null] | null = trait.key === PRONUNCIATION ? [text.accuracy, speech.accuracy]
    : trait.key === ORAL_FLUENCY ? [text.fluencyInput, speech.oralFluencyInput] : null;
  const content = trait.key === CONTENT ? speech.content : null;

  const topLevel = Math.max(0, ...trait.levels.map((entry) => entry.level));
  return <section className={cn("space-y-1 rounded-lg border border-t-4 border-[var(--border-subtle)] p-2", traitTone(index).stripe)}>
    <header className="flex items-center justify-between gap-2">
      <h4 className="flex items-center gap-2 font-semibold text-[var(--ink-primary)]">
        <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", traitTone(index).dot)} />{label}</h4>
      <span className="flex items-center gap-1.5 font-semibold tabular-nums">
        {band !== undefined && descriptor && <span aria-hidden="true" className={cn("h-2.5 w-2.5 rounded-full", levelDotClass(band, topLevel))} />}
        {band === undefined ? "–" : `${band} / ${trait.maxScore}`}</span>
    </header>
    {band === undefined && <p className="text-xs text-[var(--ink-muted)]">{text.noAiScore}</p>}
    {descriptor && <p className="text-xs text-[var(--ink-secondary)]"><strong>{text.level} {band}:</strong> {descriptor}</p>}
    {azureInput && azureInput[1] !== null && <p className="text-xs">{azureInput[0]}: <strong>{azureInput[1]}</strong>{text.outOf100}</p>}
    {content && <p className="text-xs">{text.contentCounts}: <strong>{content.achieved} / {content.wordCount}</strong>
      {" · "}{text.errors}: {content.replacements} · {content.omissions} · {content.insertions}</p>}
    {rationale?.reason && <p className="text-xs"><strong>{traitText.aiReason}:</strong> {rationale.reason}</p>}
    {rationale?.evidence && <blockquote className="border-l-2 border-[var(--border-subtle)] pl-2 text-xs italic text-[var(--ink-secondary)]">
      {traitText.aiEvidence}: “{rationale.evidence}”</blockquote>}
  </section>;
};

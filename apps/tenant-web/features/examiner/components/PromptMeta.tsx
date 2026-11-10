"use client";
import type { ReactElement } from "react";
import type { ExaminerPromptResponse } from "@pte/api-client";
import { useLocale } from "@pte/ui";
import { EXAMINER_TRAIT_TEXT } from "../traitText";

interface PromptMetaProps {
  prompt: ExaminerPromptResponse;
}

/** What the examiner needs to know about the item before reading it; no answer key or bank internals. */
export const PromptMeta = ({ prompt }: PromptMetaProps): ReactElement => {
  const { locale } = useLocale();
  const text = EXAMINER_TRAIT_TEXT[locale === "vi" ? "vi" : "en"];
  const words = prompt.minWordCount !== null || prompt.maxWordCount !== null
    ? `${prompt.minWordCount ?? 0}–${prompt.maxWordCount ?? "∞"}` : null;
  const entries: [string, string | null | undefined][] = [
    [text.metaOrder, String(prompt.orderIndex)],
    [text.metaTask, prompt.taskType.replaceAll("_", " ")],
    [text.metaSection, prompt.section],
    [text.metaCefr, prompt.cefrLevel ?? text.metaCefrNone],
    [text.metaWords, words],
  ];
  return <dl className="grid grid-cols-2 gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 sm:grid-cols-3">
    {entries.filter(([, value]) => value).map(([label, value]) => <div key={label} className="min-w-0">
      <dt className="text-[11px] uppercase tracking-wide text-[var(--ink-muted)]">{label}</dt>
      <dd className="truncate text-sm font-semibold text-[var(--ink-primary)]">{value}</dd>
    </div>)}
  </dl>;
};

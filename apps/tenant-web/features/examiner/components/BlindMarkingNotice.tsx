"use client";
import type { ReactElement } from "react";
import { Button, useLocale } from "@pte/ui";
import { EXAMINER_TRAIT_TEXT } from "../traitText";

interface BlindMarkingNoticeProps {
  onReveal: () => void;
}

/** Stands in for the AI reference while the examiner marks blind. */
export const BlindMarkingNotice = ({ onReveal }: BlindMarkingNoticeProps): ReactElement => {
  const { locale } = useLocale();
  const text = EXAMINER_TRAIT_TEXT[locale === "vi" ? "vi" : "en"];
  return <aside className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-violet-200 bg-violet-50/40 p-4">
    <div className="min-w-0">
      <h4 className="text-sm font-semibold text-violet-950">{text.blindTitle}</h4>
      <p className="mt-1 text-xs text-[var(--ink-secondary)]">{text.blindHint}</p>
    </div>
    <Button size="sm" variant="secondary" appearance="outline" onClick={onReveal}>{text.revealNow}</Button>
  </aside>;
};

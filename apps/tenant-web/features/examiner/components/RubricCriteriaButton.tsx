"use client";
import { useState, type ReactElement } from "react";
import type { ExaminerRubricResponse } from "@pte/api-client";
import { Button, Modal, cn, levelDotClass, traitTone, useLocale } from "@pte/ui";
import { EXAMINER_EXPLANATION_TEXT } from "../explanationText";

interface RubricCriteriaButtonProps { rubric: ExaminerRubricResponse | null | undefined }

/** Opens the level descriptors of the current task type's traits in a popup, one trait at a time. */
export const RubricCriteriaButton = ({ rubric }: RubricCriteriaButtonProps): ReactElement | null => {
  const { locale } = useLocale();
  const vi = locale === "vi";
  const text = EXAMINER_EXPLANATION_TEXT[vi ? "vi" : "en"];
  const [open, setOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  if (!rubric || rubric.traits.length === 0) return null;
  const selected = rubric.traits.find((trait) => trait.key === selectedKey) ?? rubric.traits[0];
  const levels = [...selected.levels].sort((left, right) => right.level - left.level);
  const topLevel = levels[0]?.level ?? 0;

  return <>
    <Button type="button" variant="primary" size="sm" onClick={() => setOpen(true)}>{text.criteria}</Button>
    <Modal open={open} onClose={() => setOpen(false)} title={`${text.criteriaTitle} · ${rubric.taskType.replaceAll("_", " ")}`} size="full">
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap gap-2" role="tablist">
          {rubric.traits.map((trait, index) => <button key={trait.key} type="button" role="tab"
            aria-selected={trait.key === selected.key} onClick={() => setSelectedKey(trait.key)}
            className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              trait.key === selected.key ? cn("border-transparent", traitTone(index).soft)
                : "border-[var(--shell-border)] text-[var(--ink-secondary)] hover:bg-[var(--surface-subtle)]")}>
            <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", traitTone(index).dot)} />
            {vi ? trait.displayNameVi : trait.displayNameEn}</button>)}
        </div>
        {levels.length === 0 ? <p className="text-sm text-[var(--ink-muted)]">{text.noCriteria}</p> :
          <ul className="divide-y divide-[var(--border-subtle)] rounded-xl border border-[var(--border-subtle)]">
            {levels.map((entry) => <li key={entry.level} className="flex gap-3 p-3 text-sm">
              <span className="flex w-16 shrink-0 items-center gap-2 font-semibold text-[var(--ink-primary)]">
                <span aria-hidden="true" className={cn("h-2.5 w-2.5 rounded-full", levelDotClass(entry.level, topLevel))} />
                {text.level} {entry.level}
              </span>
              <span className="text-[var(--ink-secondary)]">{entry.text}</span>
            </li>)}
          </ul>}
        <p className="text-xs text-[var(--ink-muted)]">{text.criteriaSource}</p>
      </div>
    </Modal>
  </>;
};

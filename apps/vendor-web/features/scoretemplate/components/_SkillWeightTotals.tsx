"use client";

import type { ReactElement } from "react";
import { Badge, DashboardCard } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { SCORE_TEMPLATE_TEXT as RAW_SCORE_TEMPLATE_TEXT } from "../constants";
import { computeSkillWeightTotals } from "../skillWeightTotals";
import type { ScoreTemplateItemDraft } from "../types";

interface SkillWeightTotalsProps {
  items: ScoreTemplateItemDraft[];
  getSkillLabel: (skill: string) => string;
}

/**
 * Live per-skill weight totals so an off-by-one is visible before saving. A compact box in the
 * side column, styled like the skill tab rail it sits under.
 */
export const SkillWeightTotals = ({ items, getSkillLabel }: SkillWeightTotalsProps): ReactElement => {
  const T = useAdminCopy(RAW_SCORE_TEMPLATE_TEXT);
  return (
    <DashboardCard className="border p-3">
      <section
        aria-label={T.WEIGHT_TOTALS_LABEL}
        className="space-y-2 rounded-lg bg-[var(--surface-subtle)] p-3"
      >
        <h2 className="text-sm font-semibold text-[var(--ink-primary)]">{T.WEIGHT_TOTALS_LABEL}</h2>
        <ul className="space-y-1.5">
          {computeSkillWeightTotals(items).map(({ skill, total, isValid }) => (
            <li
              key={skill}
              className="flex items-center justify-between gap-2 text-sm text-[var(--ink-secondary)]"
            >
              <span>{getSkillLabel(skill)}</span>
              <Badge variant={isValid ? "success" : "danger"}>{String(total)}</Badge>
            </li>
          ))}
        </ul>
      </section>
    </DashboardCard>
  );
};

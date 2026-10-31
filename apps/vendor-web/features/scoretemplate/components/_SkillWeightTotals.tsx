import type { ReactElement } from "react";
import { Badge } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { SCORE_TEMPLATE_TEXT as RAW_SCORE_TEMPLATE_TEXT } from "../constants";
import { computeSkillWeightTotals } from "../skillWeightTotals";
import type { ScoreTemplateItemDraft } from "../types";

interface SkillWeightTotalsProps {
  items: ScoreTemplateItemDraft[];
  skillLabels: Record<"SPEAKING" | "WRITING" | "READING" | "LISTENING", string>;
}

/** Live per-skill weight totals so an off-by-one is visible before saving. */
export const SkillWeightTotals = ({ items, skillLabels }: SkillWeightTotalsProps): ReactElement => {
  const T = useAdminCopy(RAW_SCORE_TEMPLATE_TEXT);
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
      <span>{T.WEIGHT_TOTALS_LABEL}</span>
      {computeSkillWeightTotals(items).map(({ skill, total, isValid }) => (
        <Badge key={skill} variant={isValid ? "success" : "danger"}>
          {`${skillLabels[skill]} ${total}`}
        </Badge>
      ))}
    </div>
  );
};

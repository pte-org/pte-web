"use client";

import type { ReactElement } from "react";
import { Select } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { CEFR_LEVELS } from "@/features/questionbank/constants";
import {
  EXAM_TEMPLATE_SECTIONS,
  SCORE_TEMPLATE_SECTION_LABELS,
} from "@/features/scoretemplate/constants";
import { EXAM_STUDIO_TEXT } from "../constants";

const FILTER_CLASS = "min-w-[170px]";

interface FilterProps {
  value: string;
  onChange: (value: string) => void;
}

/** "All sections" and the four skills, as on the question and task type lists. */
export const SectionFilter = ({ value, onChange }: FilterProps): ReactElement => {
  const text = useAdminCopy(EXAM_STUDIO_TEXT);
  const labels = useAdminCopy(SCORE_TEMPLATE_SECTION_LABELS);
  return (
    <Select
      aria-label={text.FILTER_ALL_SECTIONS}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      size="md"
      variant="table"
      className={FILTER_CLASS}
      options={[
        { value: "", label: text.FILTER_ALL_SECTIONS },
        ...EXAM_TEMPLATE_SECTIONS.map((section) => ({ value: section, label: labels[section] })),
      ]}
    />
  );
};

/** The CEFR levels, headed "CEFR" when none is chosen, as on the question list. */
export const CefrFilter = ({ value, onChange }: FilterProps): ReactElement => {
  const text = useAdminCopy(EXAM_STUDIO_TEXT);
  return (
    <Select
      aria-label={text.FILTER_CEFR}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      size="md"
      variant="table"
      className="min-w-[120px]"
      options={[
        { value: "", label: text.FILTER_CEFR },
        ...CEFR_LEVELS.map((level) => ({ value: level, label: level })),
      ]}
    />
  );
};

/** Scored or not, as on the task type list. */
export const ScoringFilter = ({ value, onChange }: FilterProps): ReactElement => {
  const text = useAdminCopy(EXAM_STUDIO_TEXT);
  return (
    <Select
      aria-label={text.FILTER_ALL_SCORING}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      size="md"
      variant="table"
      className={FILTER_CLASS}
      options={[
        { value: "", label: text.FILTER_ALL_SCORING },
        { value: "YES", label: text.FILTER_SCORED },
        { value: "NO", label: text.FILTER_UNSCORED },
      ]}
    />
  );
};

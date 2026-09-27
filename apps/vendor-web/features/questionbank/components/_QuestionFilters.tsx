"use client";

import type { ReactElement } from "react";
import { Select } from "@pte/ui";
import {
  QUESTIONBANK_TEXT,
  QUESTION_STATUS_FILTER_OPTIONS,
  SKILL_FILTER_OPTIONS,
} from "../constants";
import type { QuestionFilter, QuestionSkillFilter, QuestionStatusFilter } from "../types";

interface QuestionFiltersProps {
  filter: QuestionFilter;
  onChange: (filter: QuestionFilter) => void;
}

export const QuestionFilters = ({ filter, onChange }: QuestionFiltersProps): ReactElement => (
  <div className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-card lg:flex-row">
    <input
      type="search"
      aria-label={QUESTIONBANK_TEXT.SEARCH_PLACEHOLDER}
      placeholder={QUESTIONBANK_TEXT.SEARCH_PLACEHOLDER}
      value={filter.query}
      onChange={(event) => onChange({ ...filter, query: event.target.value })}
      className="flex-1 appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
    />
    <Select
      aria-label={SKILL_FILTER_OPTIONS[0].label}
      value={filter.skill}
      options={SKILL_FILTER_OPTIONS}
      onChange={(event) =>
        onChange({ ...filter, skill: event.target.value as QuestionSkillFilter })
      }
    />
    <Select
      aria-label={QUESTION_STATUS_FILTER_OPTIONS[0].label}
      value={filter.status}
      options={QUESTION_STATUS_FILTER_OPTIONS}
      onChange={(event) =>
        onChange({
          ...filter,
          status: event.target.value as QuestionStatusFilter,
        })
      }
    />
  </div>
);

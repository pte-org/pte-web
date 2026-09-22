"use client";

import type { ReactElement } from "react";
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

const SELECT_CLASS =
  "rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

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
    <select
      aria-label={SKILL_FILTER_OPTIONS[0].label}
      value={filter.skill}
      onChange={(event) =>
        onChange({ ...filter, skill: event.target.value as QuestionSkillFilter })
      }
      className={SELECT_CLASS}
    >
      {SKILL_FILTER_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    <select
      aria-label={QUESTION_STATUS_FILTER_OPTIONS[0].label}
      value={filter.status}
      onChange={(event) =>
        onChange({
          ...filter,
          status: event.target.value as QuestionStatusFilter,
        })
      }
      className={SELECT_CLASS}
    >
      {QUESTION_STATUS_FILTER_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

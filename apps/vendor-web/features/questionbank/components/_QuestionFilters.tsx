"use client";

import type { ReactElement } from "react";
import {
  DIFFICULTY_FILTER_OPTIONS,
  QUESTIONBANK_TEXT,
  QUESTION_STATUS_FILTER_OPTIONS,
  SKILL_FILTER_OPTIONS,
} from "../constants";
import type {
  QuestionDifficultyFilter,
  QuestionFilter,
  QuestionSkillFilter,
  QuestionStatusFilter,
} from "../types";

interface QuestionFiltersProps {
  filter: QuestionFilter;
  onChange: (filter: QuestionFilter) => void;
}

const SELECT_CLASS =
  "rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500";

export const QuestionFilters = ({
  filter,
  onChange,
}: QuestionFiltersProps): ReactElement => (
  <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-md shadow-slate-200/70 lg:flex-row">
    <input
      type="search"
      aria-label={QUESTIONBANK_TEXT.SEARCH_PLACEHOLDER}
      placeholder={QUESTIONBANK_TEXT.SEARCH_PLACEHOLDER}
      value={filter.query}
      onChange={(event) => onChange({ ...filter, query: event.target.value })}
      className="flex-1 rounded-md border border-gray-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500"
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
      aria-label={DIFFICULTY_FILTER_OPTIONS[0].label}
      value={filter.difficulty}
      onChange={(event) =>
        onChange({
          ...filter,
          difficulty: event.target.value as QuestionDifficultyFilter,
        })
      }
      className={SELECT_CLASS}
    >
      {DIFFICULTY_FILTER_OPTIONS.map((option) => (
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

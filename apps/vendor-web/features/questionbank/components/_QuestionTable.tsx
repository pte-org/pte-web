import type { ReactElement } from "react";
import { Badge, Dropdown } from "@pte/ui";
import {
  QUESTIONBANK_TEXT,
  QUESTION_DIFFICULTY_VARIANT,
  QUESTION_SKILL_LABELS,
  QUESTION_STATUS_LABELS,
  QUESTION_STATUS_VARIANT,
  QUESTION_TABLE_HEADERS,
} from "../constants";
import type { Question } from "../types";

interface QuestionTableProps {
  questions: Question[];
}

const HEADER_CLASS =
  "px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500";
const CELL_CLASS = "px-5 py-4 text-sm text-gray-700 align-middle";

export const QuestionTable = ({
  questions,
}: QuestionTableProps): ReactElement => (
  <div className="overflow-visible rounded-lg border border-gray-200 bg-white shadow-md shadow-slate-200/70">
    <table className="w-full border-collapse">
      <thead className="bg-slate-50">
        <tr>
          <th className={HEADER_CLASS}>{QUESTION_TABLE_HEADERS.CODE}</th>
          <th className={HEADER_CLASS}>{QUESTION_TABLE_HEADERS.SKILL}</th>
          <th className={HEADER_CLASS}>{QUESTION_TABLE_HEADERS.CONTENT}</th>
          <th className={HEADER_CLASS}>{QUESTION_TABLE_HEADERS.DIFFICULTY}</th>
          <th className={HEADER_CLASS}>{QUESTION_TABLE_HEADERS.CREATED}</th>
          <th className={HEADER_CLASS}>{QUESTION_TABLE_HEADERS.STATUS}</th>
          <th className={HEADER_CLASS}>{QUESTION_TABLE_HEADERS.ACTIONS}</th>
        </tr>
      </thead>
      <tbody>
        {questions.map((question) => (
          <tr key={question.id} className="border-t border-gray-100 hover:bg-slate-50/70">
            <td className={`${CELL_CLASS} font-mono text-xs text-gray-900`}>
              {question.id}
            </td>
            <td className={CELL_CLASS}>{QUESTION_SKILL_LABELS[question.skill]}</td>
            <td className={`${CELL_CLASS} max-w-xs`}>
              <span className="line-clamp-1">{question.content}</span>
            </td>
            <td className={CELL_CLASS}>
              <Badge variant={QUESTION_DIFFICULTY_VARIANT[question.difficulty]}>
                {question.difficulty}
              </Badge>
            </td>
            <td className={`${CELL_CLASS} text-gray-500`}>
              {question.createdAt}
            </td>
            <td className={CELL_CLASS}>
              <Badge variant={QUESTION_STATUS_VARIANT[question.status]}>
                {QUESTION_STATUS_LABELS[question.status]}
              </Badge>
            </td>
            <td className={CELL_CLASS}>
              <Dropdown
                items={[
                  {
                    label: QUESTIONBANK_TEXT.ROW_EDIT,
                    onSelect: () => undefined,
                  },
                  {
                    label: QUESTIONBANK_TEXT.ROW_DELETE,
                    danger: true,
                    onSelect: () => undefined,
                  },
                ]}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

import type { ReactElement } from "react";
import { SCORE_TEMPLATE_ITEM_HEADERS } from "../constants";
import type { ScoreTemplateItemDraft, ScoreTemplateItemResponse } from "../types";

const HEADER_CLASS =
  "px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap";
const CELL_CLASS = "px-3 py-2 text-sm text-gray-700 align-middle whitespace-nowrap";
const INPUT_CLASS =
  "w-20 rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:border-blue-500";

type ReadOnlyProps = {
  editable: false;
  items: ScoreTemplateItemResponse[];
};

type EditableProps = {
  editable: true;
  items: ScoreTemplateItemDraft[];
  onChange: (index: number, field: keyof ScoreTemplateItemDraft, value: string) => void;
};

type ScoreTemplateItemTableProps = ReadOnlyProps | EditableProps;

// overallWeight is deliberately not here — it's backend-derived (mean of the
// 4 skill weights below), rendered as a static cell, never an editable input.
const NUMERIC_FIELDS: { field: keyof ScoreTemplateItemDraft; header: string }[] = [
  { field: "minCount", header: SCORE_TEMPLATE_ITEM_HEADERS.MIN_COUNT },
  { field: "maxCount", header: SCORE_TEMPLATE_ITEM_HEADERS.MAX_COUNT },
  { field: "prepSeconds", header: SCORE_TEMPLATE_ITEM_HEADERS.PREP_SECONDS },
  { field: "responseSeconds", header: SCORE_TEMPLATE_ITEM_HEADERS.RESPONSE_SECONDS },
  { field: "speakingWeight", header: SCORE_TEMPLATE_ITEM_HEADERS.SPEAKING_WEIGHT },
  { field: "writingWeight", header: SCORE_TEMPLATE_ITEM_HEADERS.WRITING_WEIGHT },
  { field: "readingWeight", header: SCORE_TEMPLATE_ITEM_HEADERS.READING_WEIGHT },
  { field: "listeningWeight", header: SCORE_TEMPLATE_ITEM_HEADERS.LISTENING_WEIGHT },
];

/** Shared table for both the read-only detail view (ACTIVE/RETIRED) and the DRAFT editor — same 22-row/13-column shape either way (FR-02). */
export const ScoreTemplateItemTable = (props: ScoreTemplateItemTableProps): ReactElement => (
  <div className="overflow-hidden rounded-lg bg-white shadow-card">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1100px] border-collapse">
        <thead className="bg-slate-50">
          <tr>
            <th className={HEADER_CLASS}>{SCORE_TEMPLATE_ITEM_HEADERS.SEQUENCE}</th>
            <th className={HEADER_CLASS}>{SCORE_TEMPLATE_ITEM_HEADERS.TASK_TYPE}</th>
            <th className={HEADER_CLASS}>{SCORE_TEMPLATE_ITEM_HEADERS.SECTION}</th>
            {NUMERIC_FIELDS.slice(0, 4).map(({ field, header }) => (
              <th key={field} className={HEADER_CLASS}>{header}</th>
            ))}
            <th className={HEADER_CLASS}>{SCORE_TEMPLATE_ITEM_HEADERS.OVERALL_WEIGHT}</th>
            {NUMERIC_FIELDS.slice(4).map(({ field, header }) => (
              <th key={field} className={HEADER_CLASS}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.editable
            ? props.items.map((item, index) => (
                <tr key={`${item.taskType}-${index}`} className="border-t border-gray-100">
                  <td className={CELL_CLASS}>{item.sequence}</td>
                  <td className={`${CELL_CLASS} font-mono text-xs`}>{item.taskType}</td>
                  <td className={CELL_CLASS}>{item.section}</td>
                  {NUMERIC_FIELDS.slice(0, 4).map(({ field }) => (
                    <td key={field} className={CELL_CLASS}>
                      <input
                        type="number"
                        className={INPUT_CLASS}
                        value={item[field]}
                        onChange={(event) => props.onChange(index, field, event.target.value)}
                      />
                    </td>
                  ))}
                  <td className={CELL_CLASS}>{item.overallWeight}</td>
                  {NUMERIC_FIELDS.slice(4).map(({ field }) => (
                    <td key={field} className={CELL_CLASS}>
                      <input
                        type="number"
                        step="0.01"
                        className={INPUT_CLASS}
                        value={item[field]}
                        onChange={(event) => props.onChange(index, field, event.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))
            : props.items.map((item, index) => (
                <tr key={`${item.taskType}-${index}`} className="border-t border-gray-100 hover:bg-slate-50/70">
                  <td className={CELL_CLASS}>{item.sequence}</td>
                  <td className={`${CELL_CLASS} font-mono text-xs`}>{item.taskType}</td>
                  <td className={CELL_CLASS}>{item.section}</td>
                  <td className={CELL_CLASS}>{item.minCount}</td>
                  <td className={CELL_CLASS}>{item.maxCount}</td>
                  <td className={CELL_CLASS}>{item.prepSeconds}</td>
                  <td className={CELL_CLASS}>{item.responseSeconds}</td>
                  <td className={CELL_CLASS}>{item.overallWeight}</td>
                  <td className={CELL_CLASS}>{item.speakingWeight}</td>
                  <td className={CELL_CLASS}>{item.writingWeight}</td>
                  <td className={CELL_CLASS}>{item.readingWeight}</td>
                  <td className={CELL_CLASS}>{item.listeningWeight}</td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  </div>
);

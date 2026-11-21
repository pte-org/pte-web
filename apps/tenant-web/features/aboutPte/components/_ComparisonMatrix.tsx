import { Fragment, type ReactElement } from "react";
import type { AboutPteCopy } from "../constants/aboutPteCopy.en";
import type { AboutPteLanding } from "../constants/aboutPteLanding.en";
import { THEMED_CARD } from "../constants/aboutPteLayout";

interface ComparisonMatrixProps {
  copy: AboutPteCopy;
  landing: AboutPteLanding;
}

/** Column of PTE Academic, highlighted as the test this project is about. */
const FEATURED = 1;
const ORGANISATION_ROW = 0;
const AVATAR_TONES = [
  "",
  "bg-action text-white",
  "bg-[var(--blush-tint)] text-[var(--blush-action)]",
  "bg-[var(--mint-tint)] text-[var(--mint-action)]",
  "bg-[var(--cream-tint)] text-[var(--cream-action)]",
];

/** Feature matrix: tests as columns with a monogram header, criteria grouped into purpose / test / results. */
export const ComparisonMatrix = ({ copy, landing }: ComparisonMatrixProps): ReactElement => {
  const { headers, rows, featured } = copy.comparison;
  const tests = headers.slice(1).map((name, offset) => ({ name, column: offset + 1 }));
  const cell = (column: number): string =>
    column === FEATURED ? "bg-[var(--action-tint)] font-semibold text-[var(--home-navy)]" : "text-[var(--ink-secondary)]";
  return (
    <div className={`${THEMED_CARD} overflow-x-auto shadow-sm`}>
      <table className="w-full min-w-180 border-collapse text-sm">
        <thead>
          <tr>
            <th className="w-40 p-4" />
            {tests.map((test) => (
              <th key={test.name} className={`relative p-4 pt-6 text-left align-top ${cell(test.column)}`}>
                {test.column === FEATURED && (
                  <span className="absolute left-4 top-0 -translate-y-1/2 rounded-full bg-action px-2.5 py-0.5 text-xs font-semibold text-white">
                    {featured}
                  </span>
                )}
                <span className="flex items-center gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base font-bold ${AVATAR_TONES[test.column]}`}>
                    {test.name.charAt(0)}
                  </span>
                  <span>
                    <span className="block text-base font-bold text-[var(--home-navy)]">{test.name}</span>
                    <span className="block text-xs font-normal text-[var(--ink-muted)]">{rows[ORGANISATION_ROW][test.column]}</span>
                  </span>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {landing.compare.groups.map((group) => (
            <Fragment key={group.label}>
              <tr>
                <th
                  colSpan={headers.length}
                  className="border-t border-[var(--shell-border)] bg-[var(--surface-subtle)] px-4 py-2 text-left text-xs font-bold uppercase tracking-widest text-action"
                >
                  {group.label}
                </th>
              </tr>
              {group.rows.map((rowIndex) => {
                const row = rows[rowIndex];
                return (
                  <tr key={row[0]} className="border-t border-[var(--shell-border)]">
                    <th className="p-4 text-left align-top text-xs font-semibold text-[var(--ink-primary)]">{row[0]}</th>
                    {tests.map((test) => (
                      <td key={test.name} className={`p-4 align-top leading-6 ${cell(test.column)}`}>
                        {row[test.column]}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

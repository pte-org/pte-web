import type { ReactElement } from "react";
import Link from "next/link";
import { Badge } from "@pte/ui";
import type { AboutPteCopy } from "../constants/aboutPteCopy.en";
import { SKILL_CHIPS, THEMED_CARD } from "../constants/aboutPteLayout";
import { TASK_NAMES } from "../constants/miniExam";
import { OFFICIAL_RULES, type ScoringKind } from "../constants/officialScoring";
import { contributingSkills, type TaskWeight } from "../constants/scoringWeights";
import { useAboutPteExtras } from "../hooks/useAboutPteCopy";

interface ShortRulesTableProps {
  tasks: readonly TaskWeight[];
  copy: AboutPteCopy;
  locale: "en" | "vi";
}

const SCORE_GUIDE_SOURCE_ID = 14;
const KIND_VARIANT: Record<ScoringKind, "neutral" | "info" | "warning"> = {
  correct: "neutral",
  partial: "info",
  trait: "warning",
};
const HEAD_CELL = "px-4 py-2.5 text-left text-xs font-semibold text-[var(--ink-muted)]";

/** Question types scored by counting, one row each. The Score Guide page is shown once when every row shares it. */
export const ShortRulesTable = ({ tasks, copy, locale }: ShortRulesTableProps): ReactElement => {
  const { scoringRules } = useAboutPteExtras();
  const { columns } = scoringRules;
  const pages = new Set(tasks.map((task) => OFFICIAL_RULES[task.key].page));
  const sharedPage = pages.size === 1 ? [...pages][0] : null;
  const pageLink = (page: number): ReactElement => (
    <Link href={`#source-${SCORE_GUIDE_SOURCE_ID}`} className="shrink-0 text-xs text-[var(--ink-muted)] hover:text-action hover:underline">
      {copy.flow.pageRef(page)}
    </Link>
  );
  return (
    <div className={`${THEMED_CARD} overflow-hidden`}>
      {/* Phones get stacked entries: the rule is the last column of the table and would sit off-screen. */}
      <ul className="divide-y divide-[var(--shell-border)] md:hidden">
        {sharedPage !== null && <li className="flex justify-end bg-[var(--surface-subtle)] px-4 py-2">{pageLink(sharedPage)}</li>}
        {tasks.map((task) => {
          const rule = OFFICIAL_RULES[task.key];
          return (
            <li key={task.key} className="space-y-2 px-4 py-3 text-sm">
              <div className="flex items-start justify-between gap-3">
                <span className="font-semibold">{TASK_NAMES[task.key]}</span>
                {sharedPage === null && pageLink(rule.page)}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant={KIND_VARIANT[rule.kind]}>{copy.flow.kinds[rule.kind]}</Badge>
                {contributingSkills(task).map((skill) => (
                  <span key={skill} className={`rounded-md px-2 py-0.5 text-xs font-semibold ${SKILL_CHIPS[skill]}`}>
                    {copy.skills[skill]}
                  </span>
                ))}
              </div>
              <p className="text-[var(--ink-primary)]">{rule[locale]}</p>
            </li>
          );
        })}
      </ul>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[40rem] text-sm">
          <thead className="border-b border-[var(--shell-border)] bg-[var(--surface-subtle)]">
            <tr>
              <th scope="col" className={HEAD_CELL}>{columns.task}</th>
              <th scope="col" className={HEAD_CELL}>{columns.kind}</th>
              <th scope="col" className={HEAD_CELL}>{columns.skills}</th>
              <th scope="col" className={HEAD_CELL}>
                {sharedPage === null ? (
                  columns.rule
                ) : (
                  <span className="flex items-center justify-between gap-3">
                    {columns.rule}
                    <span className="font-normal">{pageLink(sharedPage)}</span>
                  </span>
                )}
              </th>
              {sharedPage === null && <th scope="col" className={HEAD_CELL}>{columns.page}</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--shell-border)]">
            {tasks.map((task) => {
              const rule = OFFICIAL_RULES[task.key];
              return (
                <tr key={task.key} className="align-top">
                  <th scope="row" className="px-4 py-3 text-left font-semibold">{TASK_NAMES[task.key]}</th>
                  <td className="px-4 py-3">
                    <Badge variant={KIND_VARIANT[rule.kind]}>{copy.flow.kinds[rule.kind]}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex flex-wrap gap-1.5">
                      {contributingSkills(task).map((skill) => (
                        <span key={skill} className={`rounded-md px-2 py-0.5 text-xs font-semibold ${SKILL_CHIPS[skill]}`}>
                          {copy.skills[skill]}
                        </span>
                      ))}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--ink-primary)]">{rule[locale]}</td>
                  {sharedPage === null && <td className="whitespace-nowrap px-4 py-3">{pageLink(rule.page)}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

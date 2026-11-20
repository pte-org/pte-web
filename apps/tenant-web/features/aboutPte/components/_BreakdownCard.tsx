import type { ReactElement } from "react";
import { Badge } from "@pte/ui";
import type { AboutPteCopy } from "../constants/aboutPteCopy.en";
import { MINI_TASKS } from "../constants/miniExam";
import { contributingSkills, SCORE_FLOOR, SCORE_SPAN } from "../constants/scoringWeights";
import { formatNumber, type Breakdown } from "../utils/scoringEngine";

interface BreakdownCardProps {
  title: string;
  breakdown: Breakdown;
  accentClass: string;
  copy: AboutPteCopy;
}

const isIntegrated = (key: string): boolean =>
  MINI_TASKS.some((task) => task.key === key && contributingSkills(task).length > 1);

/** One skill (or Overall): every term w × avg ÷ 100, the sums, then the 10–90 formula filled in. */
export const BreakdownCard = ({ title, breakdown, accentClass, copy }: BreakdownCardProps): ReactElement => {
  const text = copy.simulation;
  const { terms, weightedSum, totalWeight, score } = breakdown;
  const raw = totalWeight > 0 ? SCORE_FLOOR + (SCORE_SPAN * weightedSum) / totalWeight : 0;
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <header className="flex items-baseline justify-between">
        <h4 className={`font-semibold ${accentClass}`}>{title}</h4>
        <span className={`text-3xl font-bold tabular-nums ${accentClass}`}>{score ?? "—"}</span>
      </header>
      <table className="mt-3 w-full text-xs">
        <thead className="text-left text-slate-500">
          <tr>
            <th className="py-1 font-medium">{text.task}</th>
            <th className="py-1 text-right font-medium">{text.weight}</th>
            <th className="py-1 text-right font-medium">{text.average}</th>
            <th className="py-1 text-right font-medium">{text.contribution}</th>
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {terms.map((term) => (
            <tr key={term.key} className="border-t border-slate-100">
              <td className="py-1 pr-2 text-slate-800">
                {copy.taskNames[term.key]}
                {isIntegrated(term.key) && (
                  <span className="ml-1 inline-block">
                    <Badge variant="info">{text.integrated}</Badge>
                  </span>
                )}
              </td>
              <td className="py-1 text-right">{formatNumber(term.weight)}</td>
              <td className="py-1 text-right">{formatNumber(term.average)}</td>
              <td className="py-1 text-right">{formatNumber(term.contribution)}</td>
            </tr>
          ))}
          <tr className="border-t-2 border-slate-300 font-semibold">
            <td className="py-1">{text.total}</td>
            <td className="py-1 text-right">{`Σw = ${formatNumber(totalWeight)}`}</td>
            <td />
            <td className="py-1 text-right">{formatNumber(weightedSum)}</td>
          </tr>
        </tbody>
      </table>
      {score !== null && (
        <p className="mt-3 rounded-lg bg-slate-50 p-2 text-xs tabular-nums text-slate-700">
          {`10 + 80 × ${formatNumber(weightedSum)} ÷ ${formatNumber(totalWeight)} = ${formatNumber(raw)} → `}
          <strong>{score}</strong>
        </p>
      )}
    </article>
  );
};

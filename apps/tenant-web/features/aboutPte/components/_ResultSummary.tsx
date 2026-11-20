import type { ReactElement } from "react";
import type { AboutPteCopy } from "../constants/aboutPteCopy.en";
import { SKILL_TONES } from "../constants/aboutPteLayout";
import { SKILLS } from "../constants/scoringWeights";
import type { ScoredResult } from "../utils/scoringEngine";

interface ResultSummaryProps {
  results: ScoredResult[];
  copy: AboutPteCopy;
}

export const ResultSummary = ({ results, copy }: ResultSummaryProps): ReactElement => (
  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
    <table className="w-full text-sm tabular-nums">
      <caption className="px-3 pt-3 text-left font-semibold text-slate-900">
        {copy.simulation.summaryTitle}
      </caption>
      <thead className="text-left text-slate-600">
        <tr>
          <th className="px-3 py-2 font-medium" />
          {SKILLS.map((skill) => (
            <th key={skill} className={`px-3 py-2 font-medium ${SKILL_TONES[skill].text}`}>
              {copy.skills[skill]}
            </th>
          ))}
          <th className="px-3 py-2 font-medium text-action">{copy.skills.overall}</th>
        </tr>
      </thead>
      <tbody>
        {results.map((result, student) => (
          <tr key={copy.simulation.students[student]} className="border-t border-slate-100">
            <th className="px-3 py-2 text-left font-medium">{copy.simulation.students[student]}</th>
            {SKILLS.map((skill) => (
              <td key={skill} className="px-3 py-2">
                {result.skills[skill].score ?? "—"}
              </td>
            ))}
            <td className="px-3 py-2 text-lg font-bold text-action">{result.overall.score ?? "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

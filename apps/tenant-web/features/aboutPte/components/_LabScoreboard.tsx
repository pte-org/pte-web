import type { ReactElement } from "react";
import { CircularProgressChart } from "@pte/ui";
import type { AboutPteCopy } from "../constants/aboutPteCopy.en";
import { TASK_NAMES } from "../constants/miniExam";
import { SCORE_FLOOR, SCORE_SPAN, SKILLS, STANDARD_TASK_WEIGHTS } from "../constants/scoringWeights";
import { useAboutPteExtras } from "../hooks/useAboutPteCopy";
import type { ScoreLab } from "../hooks/useScoreLab";
import { cefrLevelFor, formatIeltsBand, ieltsBandFor } from "../utils/scoreConversion";
import { formatNumber } from "../utils/scoringEngine";

interface LabScoreboardProps {
  lab: ScoreLab;
  copy: AboutPteCopy;
}

const SKILL_TONE = { speaking: "brand", writing: "violet", reading: "success", listening: "warning" } as const;
const toRing = (score: number | null): number | null => (score === null ? null : score - SCORE_FLOOR);

/** Live skill and Overall rings; the skills fed by the hovered question type light up, the rest fade. */
export const LabScoreboard = ({ lab, copy }: LabScoreboardProps): ReactElement => {
  const text = copy.simulation.lab;
  const { conversion } = useAboutPteExtras();
  const focusedTask = STANDARD_TASK_WEIGHTS.find((task) => task.key === lab.focused);
  const hasFocus = lab.highlighted.size > 0;
  const overall = lab.result.overall.score;
  const band = overall === null ? null : ieltsBandFor(overall);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-5 border-b border-slate-100 pb-5">
        <CircularProgressChart
          value={toRing(overall)}
          max={SCORE_SPAN}
          valueLabel={String(overall ?? "—")}
          ariaLabel={copy.skills.overall}
          caption={copy.skills.overall}
        />
        <div className="space-y-2">
          {overall !== null && (
            <p className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-[var(--action-tint)] px-2.5 py-1 text-action">
                {`${conversion.ielts} ${band === null ? conversion.belowIelts : formatIeltsBand(band)}`}
              </span>
              <span className="rounded-full bg-[var(--action-tint)] px-2.5 py-1 text-action">
                {`${conversion.cefr} ${cefrLevelFor(overall)}`}
              </span>
            </p>
          )}
          <p className="text-sm text-slate-600">{text.overallHint}</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4">
        {SKILLS.map((skill) => {
          const isLit = lab.highlighted.has(skill);
          const score = lab.result.skills[skill].score;
          return (
            <div
              key={skill}
              className={`flex flex-col items-center rounded-xl p-2 transition duration-300 ${
                isLit ? "scale-105 bg-action/10 ring-2 ring-action" : hasFocus ? "opacity-40" : ""
              }`}
            >
              <CircularProgressChart
                className="h-24 w-24"
                value={toRing(score)}
                max={SCORE_SPAN}
                valueLabel={String(score ?? "—")}
                ariaLabel={copy.skills[skill]}
                caption={copy.skills[skill]}
                tone={SKILL_TONE[skill]}
              />
              {/* Always rendered so the ring does not grow when the weight appears. */}
              <span className={`mt-1 min-h-4 text-xs font-semibold text-action ${isLit && focusedTask ? "" : "invisible"}`}>
                {isLit && focusedTask ? text.weight(formatNumber(focusedTask[skill])) : " "}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-4 min-h-10 text-sm text-slate-600" aria-live="polite">
        {focusedTask ? text.focusText(TASK_NAMES[focusedTask.key], lab.highlighted.size) : text.hoverHint}
      </p>
    </div>
  );
};

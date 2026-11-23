import type { ReactElement } from "react";
import { SKILL_TONES } from "../constants/aboutPteLayout";
import { SKILLS, STANDARD_TASK_WEIGHTS, type SkillKey } from "../constants/scoringWeights";

interface SkillFlowDiagramProps {
  skillLabels: Record<SkillKey, string>;
  title: string;
}

const ROW_HEIGHT = 26;
const TOP = 20;
const WIDTH = 760;
const TASK_X = 250;
const SKILL_X = 560;
const MAX_STROKE = 10;
const MAX_WEIGHT = 34;

const taskY = (index: number): number => TOP + index * ROW_HEIGHT;
const HEIGHT = taskY(STANDARD_TASK_WEIGHTS.length) + TOP;
const skillY = (index: number): number => TOP + ((HEIGHT - 2 * TOP) / SKILLS.length) * (index + 0.5);

const prettyTask = (key: string): string =>
  key.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

/** Task type → skill flows from the standard template; stroke width scales with the weight. */
export const SkillFlowDiagram = ({ skillLabels, title }: SkillFlowDiagramProps): ReactElement => (
  <div className="overflow-x-auto">
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={title} className="min-w-160">
      {STANDARD_TASK_WEIGHTS.map((task, taskIndex) =>
        SKILLS.filter((skill) => task[skill] > 0).map((skill) => {
          const y1 = taskY(taskIndex);
          const y2 = skillY(SKILLS.indexOf(skill));
          const mid = (TASK_X + SKILL_X) / 2;
          return (
            <path
              key={`${task.key}-${skill}`}
              d={`M ${TASK_X} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${SKILL_X} ${y2}`}
              className={`${SKILL_TONES[skill].stroke} fill-none opacity-60`}
              strokeWidth={Math.max(1, (task[skill] / MAX_WEIGHT) * MAX_STROKE)}
            >
              <title>{`${prettyTask(task.key)} → ${skillLabels[skill]}: ${task[skill]}`}</title>
            </path>
          );
        }),
      )}
      {STANDARD_TASK_WEIGHTS.map((task, index) => {
        const integrated = SKILLS.filter((skill) => task[skill] > 0).length > 1;
        return (
          <text
            key={task.key}
            x={TASK_X - 8}
            y={taskY(index) + 4}
            textAnchor="end"
            className={`text-xs ${integrated ? "fill-slate-900 font-semibold" : "fill-slate-500"}`}
          >
            {prettyTask(task.key)}
          </text>
        );
      })}
      {SKILLS.map((skill, index) => (
        <g key={skill}>
          <rect x={SKILL_X} y={skillY(index) - 16} width={130} height={32} rx={8} className={SKILL_TONES[skill].fill} />
          <text x={SKILL_X + 65} y={skillY(index) + 5} textAnchor="middle" className="fill-white text-sm font-semibold">
            {skillLabels[skill]}
          </text>
        </g>
      ))}
    </svg>
  </div>
);

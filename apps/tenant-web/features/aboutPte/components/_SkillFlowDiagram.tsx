"use client";

import { useState, type ReactElement } from "react";
import { SKILL_TONES } from "../constants/aboutPteLayout";
import { TASK_NAMES } from "../constants/miniExam";
import { SKILLS, STANDARD_TASK_WEIGHTS, type SkillKey } from "../constants/scoringWeights";

interface SkillFlowDiagramProps {
  skillLabels: Record<SkillKey, string>;
  title: string;
  /** One line telling readers the diagram reacts to hovering. */
  hint: string;
}

const ROW_HEIGHT = 26;
const TOP = 20;
const WIDTH = 780;
const TASK_X = 320;
const SKILL_X = 620;
const MAX_STROKE = 10;
const MAX_WEIGHT = 34;

const taskY = (index: number): number => TOP + index * ROW_HEIGHT;
const HEIGHT = taskY(STANDARD_TASK_WEIGHTS.length) + TOP;
const skillY = (index: number): number => TOP + ((HEIGHT - 2 * TOP) / SKILLS.length) * (index + 0.5);

type Focus = { type: "task"; key: string } | { type: "skill"; key: SkillKey } | null;

/** Task type → skill flows from the standard template; stroke width scales with the weight, hovering isolates one task or skill. */
export const SkillFlowDiagram = ({ skillLabels, title, hint }: SkillFlowDiagramProps): ReactElement => {
  const [focus, setFocus] = useState<Focus>(null);
  const isLinked = (taskKey: string, skill: SkillKey): boolean =>
    focus === null || (focus.type === "task" ? focus.key === taskKey : focus.key === skill);
  return (
    <div>
      <p className="mb-2 text-xs text-[var(--ink-muted)]">{hint}</p>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={title} className="min-w-160" onMouseLeave={() => setFocus(null)}>
          {STANDARD_TASK_WEIGHTS.map((task, taskIndex) =>
            SKILLS.filter((skill) => task[skill] > 0).map((skill) => {
              const y1 = taskY(taskIndex);
              const y2 = skillY(SKILLS.indexOf(skill));
              const mid = (TASK_X + SKILL_X) / 2;
              const linked = isLinked(task.key, skill);
              return (
                <g key={`${task.key}-${skill}`}>
                  <path
                    d={`M ${TASK_X} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${SKILL_X} ${y2}`}
                    className={`${SKILL_TONES[skill].stroke} fill-none transition-opacity ${linked ? (focus ? "opacity-90" : "opacity-60") : "opacity-10"}`}
                    strokeWidth={Math.max(1, (task[skill] / MAX_WEIGHT) * MAX_STROKE)}
                  >
                    <title>{`${TASK_NAMES[task.key]} → ${skillLabels[skill]}: ${task[skill]}`}</title>
                  </path>
                  {focus && linked && (
                    <text
                      x={focus.type === "task" ? SKILL_X - 8 : TASK_X + 8}
                      y={(focus.type === "task" ? y2 : y1) + (focus.type === "task" ? -6 : 4)}
                      textAnchor={focus.type === "task" ? "end" : "start"}
                      className="fill-slate-900 text-xs font-bold"
                    >
                      {task[skill]}
                    </text>
                  )}
                </g>
              );
            }),
          )}
          {STANDARD_TASK_WEIGHTS.map((task, index) => {
            const integrated = SKILLS.filter((skill) => task[skill] > 0).length > 1;
            const dimmed = focus?.type === "task" && focus.key !== task.key;
            return (
              <text
                key={task.key}
                x={TASK_X - 8}
                y={taskY(index) + 4}
                textAnchor="end"
                onMouseEnter={() => setFocus({ type: "task", key: task.key })}
                className={`cursor-default text-xs transition-opacity ${integrated ? "fill-slate-900 font-semibold" : "fill-slate-500"} ${dimmed ? "opacity-40" : ""}`}
              >
                {TASK_NAMES[task.key]}
              </text>
            );
          })}
          {SKILLS.map((skill, index) => (
            <g
              key={skill}
              onMouseEnter={() => setFocus({ type: "skill", key: skill })}
              className={`cursor-default transition-opacity ${focus?.type === "skill" && focus.key !== skill ? "opacity-40" : ""}`}
            >
              <rect x={SKILL_X} y={skillY(index) - 16} width={130} height={32} rx={8} className={SKILL_TONES[skill].fill} />
              <text x={SKILL_X + 65} y={skillY(index) + 5} textAnchor="middle" className="fill-white text-sm font-semibold">
                {skillLabels[skill]}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

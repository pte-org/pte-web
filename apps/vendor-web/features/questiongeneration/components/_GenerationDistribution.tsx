"use client";

import type { ReactElement } from "react";
import { ProgressBar } from "@pte/ui";
import {
  GENERATION_CEFR_LEVELS,
  GENERATION_SECTIONS,
  MATRIX_EMPTY_TOTAL,
} from "../dialogConstants";
import type { DialogMessages } from "../messages/dialog.en";
import { levelTotals, sectionTotals } from "../utils/generationMatrix";
import type { GenerationSelection } from "../utils/generationSelection";

interface DistributionProps {
  selection: GenerationSelection;
  total: number;
  messages: DialogMessages;
}

interface BarListProps {
  title: string;
  bars: readonly { key: string; label: string; value: number }[];
  max: number;
}

const BarList = ({ title, bars, max }: BarListProps): ReactElement => (
  <section className="space-y-2">
    <h3 className="text-xs font-medium uppercase text-[var(--ink-muted)]">{title}</h3>
    {bars.map((bar) => (
      <div
        key={bar.key}
        className="grid grid-cols-[4.5rem_minmax(0,1fr)_2rem] items-center gap-2 text-sm"
      >
        <span className="text-[var(--ink-secondary)]">{bar.label}</span>
        <ProgressBar value={bar.value} max={Math.max(max, 1)} label={bar.label} />
        <span className="text-right tabular-nums">
          {bar.value > 0 ? bar.value : MATRIX_EMPTY_TOTAL}
        </span>
      </div>
    ))}
  </section>
);

/** Where the questions land: per CEFR level and per skill, scaled to the largest bar so small mixes stay legible. */
export const GenerationDistribution = ({
  selection,
  total,
  messages,
}: DistributionProps): ReactElement => {
  const levels = levelTotals(selection);
  const sections = sectionTotals(selection);
  const levelBars = GENERATION_CEFR_LEVELS.map((level) => ({
    key: level,
    label: level,
    value: levels[level],
  }));
  const sectionBars = GENERATION_SECTIONS.map((section) => ({
    key: section,
    label: messages[`skill${section}`],
    value: sections[section] ?? 0,
  }));
  return (
    <div className="space-y-4">
      <BarList
        title={messages.sideDistribution}
        bars={levelBars}
        max={Math.max(...levelBars.map((bar) => bar.value))}
      />
      <BarList title={messages.sideBySkill} bars={sectionBars} max={total} />
    </div>
  );
};

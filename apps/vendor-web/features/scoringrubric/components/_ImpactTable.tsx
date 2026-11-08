"use client";
import type { ReactElement } from "react";
import { TableBody, TableCell, TableHead, TableHeader, TableRoot, TableRow } from "@pte/ui";
import type { ImpactSample } from "../versionApi";
import { scenarioLabel, scoreShift, HIGH_IMPACT_POINTS, type ImpactScenario } from "../versionImpact";
import type { RubricEditText } from "../versionTypes";

interface ImpactTableProps {
  scenarios: readonly ImpactScenario[];
  samples: readonly ImpactSample[];
  text: RubricEditText;
}

const SHIFT_CLASS = {
  big: "font-semibold text-rose-600 dark:text-rose-300",
  small: "text-[var(--ink-secondary)]",
} as const;

/** Sample answers scored by the active rubric and by the candidate; every number is the server's. */
export const ImpactTable = ({ scenarios, samples, text: T }: ImpactTableProps): ReactElement => (
  <section className="space-y-2">
    <h3 className="text-sm font-semibold">{T.impactTitle}</h3>
    <TableRoot>
      <TableHeader>
        <TableRow>
          <TableHead>{T.taskTypeColumn}</TableHead>
          <TableHead>{T.scenario}</TableHead>
          <TableHead>{T.before}</TableHead>
          <TableHead>{T.after}</TableHead>
          <TableHead>{T.scoreShift}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {scenarios.map((scenario, index) => {
          const sample = samples[index];
          const scored = sample && sample.before !== null && sample.after !== null;
          const shift = scored ? scoreShift(sample.before ?? 0, sample.after ?? 0) : null;
          return (
            <TableRow key={`${scenario.taskType}-${scenario.kind}`}>
              <TableCell className="font-mono text-xs">{scenario.taskType}</TableCell>
              <TableCell>{scenarioLabel(scenario.kind, T)}</TableCell>
              <TableCell>{sample?.before ?? "—"}</TableCell>
              <TableCell>{sample?.after ?? "—"}</TableCell>
              <TableCell className={shift !== null && Math.abs(shift) >= HIGH_IMPACT_POINTS ? SHIFT_CLASS.big : SHIFT_CLASS.small}>
                {shift === null ? "—" : shift > 0 ? `+${shift}` : String(shift)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </TableRoot>
  </section>
);

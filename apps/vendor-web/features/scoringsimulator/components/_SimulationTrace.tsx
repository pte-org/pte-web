"use client";

import { useState, type ReactElement } from "react";
import { Alert, Button, Modal, StatCard, TableBody, TableCell, TableHead, TableHeader, TableRoot, TableRow, useLocale } from "@pte/ui";
import type { RubricSimulationResponse, TaskTypeRubricResponse } from "@pte/api-client";
import type { SimulatorText } from "../types";

interface SimulationTraceProps { result: RubricSimulationResponse; rubric: TaskTypeRubricResponse; text: SimulatorText }

export const SimulationTrace = ({ result, rubric, text: T }: SimulationTraceProps): ReactElement => {
  const { locale } = useLocale();
  const traitLabel = (key: string): string => {
    const trait = rubric.traits.find((entry) => entry.key === key);
    return (locale === "vi" ? trait?.displayNameVi : trait?.displayNameEn) ?? key;
  };
  const [detailsOpen, setDetailsOpen] = useState(false);
  const gate = result.scoreTrace.gateTriggeredBy;
  return <div className="space-y-5" aria-live="polite">
    <StatCard label={T.score} value={`${result.rawScore} ${T.scale}`} footnote={T.scoreHint} />
    {gate && <Alert tone="warning">{traitLabel(gate)} {T.gateReason}</Alert>}
    {result.formBand !== null && <p className="text-sm text-[var(--ink-secondary)]">{T.form}: {result.formBand}</p>}
    <Button variant="secondary" size="sm" fullWidth onClick={() => setDetailsOpen(true)}>{T.details}</Button>
    <Modal open={detailsOpen} title={T.details} size="xl" closeOnBackdropClick onClose={() => setDetailsOpen(false)}
      footer={<Button variant="ghost" onClick={() => setDetailsOpen(false)}>{T.close}</Button>}>
      <div className="space-y-3 overflow-x-auto">
        <p className="text-sm text-[var(--ink-secondary)]">{T.raw}: {result.scoreTrace.rawPercent}</p>
        <TableRoot><TableHeader><TableRow>
          <TableHead>{T.trait}</TableHead><TableHead>{T.achieved}</TableHead><TableHead>{T.weight}</TableHead><TableHead>{T.contribution}</TableHead>
        </TableRow></TableHeader><TableBody>
          {result.scoreTrace.contributions.map((row) => <TableRow key={row.key}>
            <TableCell>{traitLabel(row.key)}</TableCell><TableCell>{row.achieved}/{row.max}</TableCell>
            <TableCell>{row.effectiveWeight}</TableCell><TableCell>{row.weightedContribution ?? T.noValue}</TableCell>
          </TableRow>)}
        </TableBody></TableRoot>
      </div>
    </Modal>
  </div>;
};

import type { ReactElement } from "react";
import { Alert, TableBody, TableCell, TableHead, TableHeader, TableRoot, TableRow } from "@pte/ui";
import type { RubricSimulationResponse } from "@pte/api-client";
import type { SimulatorText } from "../types";

interface SimulationTraceProps { result: RubricSimulationResponse; text: SimulatorText }
export const SimulationTrace = ({ result, text: T }: SimulationTraceProps): ReactElement => (
  <div className="space-y-4" aria-live="polite">
    <p>{T.score}: {result.rawScore} · {T.raw}: {result.scoreTrace.rawPercent}</p>
    {result.formBand !== null && <p>{T.form}: {result.formBand}</p>}
    {result.scoreTrace.gateTriggeredBy && <Alert tone="warning">{T.gate}{result.scoreTrace.gateTriggeredBy} = 0</Alert>}
    <TableRoot><TableHeader><TableRow>
      <TableHead>{T.trait}</TableHead><TableHead>{T.achieved}</TableHead><TableHead>{T.weight}</TableHead><TableHead>{T.contribution}</TableHead>
    </TableRow></TableHeader><TableBody>
      {result.scoreTrace.contributions.map((row) => <TableRow key={row.key}>
        <TableCell>{row.key}{row.key === result.scoreTrace.gateTriggeredBy ? " ⚠" : ""}</TableCell>
        <TableCell>{row.achieved}/{row.max}</TableCell><TableCell>{row.effectiveWeight}</TableCell>
        <TableCell>{row.weightedContribution}</TableCell>
      </TableRow>)}
    </TableBody></TableRoot>
  </div>
);

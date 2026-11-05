import type { ReactElement } from "react";
import { TableRoot, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@pte/ui";
import type { RubricDiffResponse } from "@pte/api-client";
import type { RubricEditText } from "../versionTypes";

interface VersionDiffPanelProps { diff: RubricDiffResponse; text: RubricEditText }
export const VersionDiffPanel = ({ diff, text: T }: VersionDiffPanelProps): ReactElement => (
  diff.changes.length === 0 ? <p>{T.noChanges}</p> : <TableRoot>
    <TableHeader><TableRow><TableHead>{T.path}</TableHead><TableHead>{T.before}</TableHead><TableHead>{T.after}</TableHead></TableRow></TableHeader>
    <TableBody>{diff.changes.map((change) => <TableRow key={change.path}>
      <TableCell>{change.path}</TableCell><TableCell>{change.beforeValue ?? "—"}</TableCell><TableCell>{change.afterValue ?? "—"}</TableCell>
    </TableRow>)}</TableBody>
  </TableRoot>
);

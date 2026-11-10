import type { ReactElement } from "react";
import { TableRoot, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@pte/ui";
import type { RubricDiffResponse } from "@pte/api-client";
import { describeChange } from "../versionImpact";
import type { RubricEditText } from "../versionTypes";

interface VersionDiffPanelProps {
  diff: RubricDiffResponse;
  /** Trait names by "TASK_TYPE.TRAIT", so a line reads "Content · weight" instead of a parameter path. */
  traitNames: ReadonlyMap<string, string>;
  text: RubricEditText;
}

/** What the version changes, in words: the task type, the setting and the two values. */
export const VersionDiffPanel = ({ diff, traitNames, text: T }: VersionDiffPanelProps): ReactElement => (
  diff.changes.length === 0 ? <p>{T.noChanges}</p> : <TableRoot>
    <TableHeader><TableRow><TableHead>{T.taskTypeColumn}</TableHead><TableHead>{T.change}</TableHead><TableHead>{T.before}</TableHead><TableHead>{T.after}</TableHead></TableRow></TableHeader>
    <TableBody>{diff.changes.map((change) => {
      const line = describeChange(change, traitNames, T);
      return <TableRow key={change.path}>
        <TableCell className="font-mono text-xs">{line.taskType ?? "—"}</TableCell><TableCell>{line.what}</TableCell>
        <TableCell>{line.before}</TableCell><TableCell>{line.after}</TableCell>
      </TableRow>;
    })}</TableBody>
  </TableRoot>
);

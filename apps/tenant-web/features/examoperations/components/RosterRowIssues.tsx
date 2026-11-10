import type { ReactElement } from "react";
import { Alert } from "@pte/ui";
import {
  ROSTER_FIELD_LABELS,
  ROSTER_ROW_ISSUES_MAX_LISTED,
  ROSTER_ROW_ISSUES_TEXT as T,
} from "../constants";
import type { RosterRowIssue } from "../types";

interface RosterRowIssuesProps {
  issues: readonly RosterRowIssue[];
}

/** Lists the broken cells of an uploaded roster; while any are listed, no account may be created. */
export const RosterRowIssues = ({ issues }: RosterRowIssuesProps): ReactElement | null => {
  if (issues.length === 0) return null;
  const listed = issues.slice(0, ROSTER_ROW_ISSUES_MAX_LISTED);
  const hidden = issues.length - listed.length;

  return (
    <Alert tone="error" title={T.TITLE(issues.length)}>
      <p>{T.HINT}</p>
      <ul className="mt-2 list-disc pl-4">
        {listed.map((issue) => (
          <li key={`${issue.row}-${issue.field}`}>
            <span className="font-medium">
              {T.ROW(issue.row)} · {ROSTER_FIELD_LABELS[issue.field]}:
            </span>{" "}
            {issue.message}
          </li>
        ))}
      </ul>
      {hidden > 0 && <p className="mt-1">{T.MORE(hidden)}</p>}
    </Alert>
  );
};

"use client";

import type { ReactElement } from "react";
import { Alert } from "@pte/ui";
import { ROSTER_ROW_ISSUES_MAX_LISTED } from "../constants";
import { useRosterImportText } from "../hooks/useRosterImportText";
import type { RosterRowIssue } from "../types";

interface RosterRowIssuesProps {
  issues: readonly RosterRowIssue[];
}

/** Lists the broken cells of an uploaded roster; while any are listed, no account may be created. */
export const RosterRowIssues = ({ issues }: RosterRowIssuesProps): ReactElement | null => {
  const text = useRosterImportText();
  if (issues.length === 0) return null;
  const listed = issues.slice(0, ROSTER_ROW_ISSUES_MAX_LISTED);
  const hidden = issues.length - listed.length;

  return (
    <Alert tone="error" title={text.issuesTitle(issues.length)}>
      <p>{text.issuesHint}</p>
      <ul className="mt-2 list-disc pl-4">
        {listed.map((issue) => (
          <li key={`${issue.row}-${issue.field}`}>
            <span className="font-medium">
              {text.issueRow(issue.row)} · {text.fieldLabel(issue.field)}:
            </span>{" "}
            {text.issueMessage(issue.message)}
          </li>
        ))}
      </ul>
      {hidden > 0 && <p className="mt-1">{text.issueMore(hidden)}</p>}
    </Alert>
  );
};

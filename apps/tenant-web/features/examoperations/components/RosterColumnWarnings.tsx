import type { ReactElement } from "react";
import { Alert } from "@pte/ui";
import { ROSTER_COLUMN_WARNING_TEXT as T } from "../constants";
import type { RosterColumnIssues } from "../types";

interface RosterColumnWarningsProps {
  issues: RosterColumnIssues | null;
}

export const RosterColumnWarnings = ({
  issues,
}: RosterColumnWarningsProps): ReactElement | null => {
  if (!issues) return null;
  const hasIgnored = issues.ignoredColumns.length > 0;
  const hasMissing = issues.missingColumns.length > 0;
  if (!hasIgnored && !hasMissing) return null;

  return (
    <Alert tone="warning" title={T.TITLE}>
      <ul className="list-disc pl-4">
        {hasMissing && <li>{T.MISSING(issues.missingColumns)}</li>}
        {hasIgnored && <li>{T.IGNORED(issues.ignoredColumns)}</li>}
      </ul>
    </Alert>
  );
};

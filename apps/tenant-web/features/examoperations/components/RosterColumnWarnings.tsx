"use client";

import type { ReactElement } from "react";
import { Alert } from "@pte/ui";
import { useRosterImportText } from "../hooks/useRosterImportText";
import type { RosterColumnIssues } from "../types";

interface RosterColumnWarningsProps {
  issues: RosterColumnIssues | null;
}

export const RosterColumnWarnings = ({
  issues,
}: RosterColumnWarningsProps): ReactElement | null => {
  const text = useRosterImportText();
  if (!issues) return null;
  const hasIgnored = issues.ignoredColumns.length > 0;
  const hasMissing = issues.missingColumns.length > 0;
  if (!hasIgnored && !hasMissing) return null;

  return (
    <Alert tone="warning" title={text.columnWarningTitle}>
      <ul className="list-disc pl-4">
        {hasMissing && <li>{text.columnWarningMissing(issues.missingColumns.join(", "))}</li>}
        {hasIgnored && <li>{text.columnWarningIgnored(issues.ignoredColumns.join(", "))}</li>}
      </ul>
    </Alert>
  );
};

import type { ReactElement } from "react";
import type { SlotConflict } from "@pte/api-client";
import { Alert } from "@pte/ui";
import { ENROLLMENT_CONFLICT_TEXT as T } from "./constants";

interface EnrollmentConflictNoticeProps {
  conflicts?: SlotConflict[];
  studentLabels?: Record<string, string>;
}

const MAX_VISIBLE_CONFLICTS = 10;

export const EnrollmentConflictNotice = ({
  conflicts = [],
  studentLabels = {},
}: EnrollmentConflictNoticeProps): ReactElement | null => {
  if (conflicts.length === 0) return null;
  const visible = conflicts.slice(0, MAX_VISIBLE_CONFLICTS);
  return (
    <Alert tone="warning" title={T.TITLE}>
      <p>{T.SUMMARY(conflicts.length)}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {visible.map((conflict) => (
          <li key={`${conflict.studentPublicId}-${conflict.conflictingSessionPublicId}`}>
            {T.STUDENT(
              studentLabels[conflict.studentPublicId] ?? conflict.studentPublicId,
              conflict.conflictingSessionName || conflict.conflictingSessionPublicId,
            )}
          </li>
        ))}
      </ul>
      {conflicts.length > visible.length && (
        <p className="mt-2">{T.MORE(conflicts.length - visible.length)}</p>
      )}
    </Alert>
  );
};

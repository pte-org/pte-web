import { PROCTOR_ATTENDANCE_VIEW_TEXT as T, PROCTOR_ROSTER_TEXT } from "./constants";

export const getAttendanceBlockingMessage = (reason: string): string => {
  if (reason.includes("TIMING_PRE_OPEN") || reason.includes("before 30 minutes"))
    return T.REASON_PRE_OPEN;
  if (
    reason.includes("SESSION_CLOSED") ||
    reason.includes("TIMING_CLOSED") ||
    reason.includes("closed after")
  )
    return T.REASON_CLOSED;
  if (reason.includes("CANCELLED")) return T.REASON_CANCELLED;
  return PROCTOR_ROSTER_TEXT.BLOCKED_GENERIC;
};

const ACTIVITY_LABELS: Record<string, string> = {
  IN_PROGRESS: PROCTOR_ROSTER_TEXT.ACTIVITY_IN_PROGRESS,
  SUBMITTED: PROCTOR_ROSTER_TEXT.ACTIVITY_SUBMITTED,
  ABANDONED: PROCTOR_ROSTER_TEXT.ACTIVITY_ABANDONED,
  CREATED: PROCTOR_ROSTER_TEXT.ACTIVITY_CREATED,
  NOT_STARTED: PROCTOR_ROSTER_TEXT.NOT_STARTED,
};

export const getAttendanceActivityLabel = (status: string): string =>
  ACTIVITY_LABELS[status] ?? PROCTOR_ROSTER_TEXT.ACTIVITY_UNKNOWN;

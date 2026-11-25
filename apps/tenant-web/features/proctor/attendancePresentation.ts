import type { AttendanceText } from "./hooks/useAttendanceText";

/** Turns the API's blocking reason into a sentence in the user's language. */
export const getAttendanceBlockingMessage = (reason: string, text: AttendanceText): string => {
  if (reason.includes("TIMING_PRE_OPEN") || reason.includes("before 30 minutes")) return text.reasonPreOpen;
  if (
    reason.includes("SESSION_CLOSED") ||
    reason.includes("TIMING_CLOSED") ||
    reason.includes("closed after")
  )
    return text.reasonClosed;
  if (reason.includes("CANCELLED")) return text.reasonCancelled;
  return text.blockedGeneric;
};

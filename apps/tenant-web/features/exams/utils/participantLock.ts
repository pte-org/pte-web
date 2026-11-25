import type { ExamSession } from "../types";

type SessionStatus = ExamSession["status"];

/** Why a roster change is blocked. `PREPARING` covers every status before an exam is published. */
export type ParticipantLock = "PREPARING" | "STARTED" | "ENDED";

/** Mirrors the API: students can only be added or removed while the exam is Scheduled. */
export const studentRosterLock = (status: SessionStatus): ParticipantLock | null => {
  if (status === "SCHEDULED") return null;
  if (status === "OPEN") return "STARTED";
  if (status === "CLOSED") return "ENDED";
  return "PREPARING";
};

/** Mirrors the API: a proctor can be added until the exam starts, never once it is open or closed. */
export const proctorAssignmentLock = (status: SessionStatus): "STARTED" | "ENDED" | null => {
  if (status === "OPEN") return "STARTED";
  if (status === "CLOSED") return "ENDED";
  return null;
};

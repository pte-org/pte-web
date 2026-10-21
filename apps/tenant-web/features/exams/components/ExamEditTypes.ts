import type {
  AnswerIntegrityLevel,
  FormMode,
  ReplayPolicyType,
  ReusePolicy,
} from "@pte/api-client";
import { SINGLE_SITTING_RETRIES } from "../constants";
import type { ExamSession, ExamSkill } from "../types";

export type DraftFormValues = {
  name: string;
  opensAt: string;
  closesAt: string;
  capacity: string;
  maxRetriesPerStudent: string;
  selectedSkills: ExamSkill[];
  formMode: FormMode | "";
  reusePolicy: ReusePolicy | "";
  seriesKey: string;
};

export type PolicyFormValues = {
  replayPolicyType: ReplayPolicyType;
  replayPolicyLimit: string;
  deviceCheckRequired: boolean;
  proctorRequired: boolean;
  answerIntegrityLevel: AnswerIntegrityLevel;
};

export type ScheduleFormValues = {
  name: string;
  opensAt: string;
  closesAt: string;
};

const toLocalDateTime = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
};

export const draftFormFromSession = (session: ExamSession): DraftFormValues => ({
  name: session.name,
  opensAt: toLocalDateTime(session.opensAt),
  closesAt: toLocalDateTime(session.closesAt),
  capacity: String(session.capacity),
  maxRetriesPerStudent: String(SINGLE_SITTING_RETRIES),
  selectedSkills: session.selectedSkills,
  formMode: session.formMode ?? "",
  reusePolicy: session.reusePolicy ?? "",
  seriesKey: session.seriesKey ?? "",
});

export const policyFormFromSession = (session: ExamSession): PolicyFormValues => ({
  replayPolicyType: session.policy?.replayPolicyType === "LIMITED" ? "LIMITED" : "UNLIMITED",
  replayPolicyLimit: session.policy?.replayPolicyLimit?.toString() ?? "",
  deviceCheckRequired: session.policy?.deviceCheckRequired ?? false,
  proctorRequired: session.policy?.proctorRequired ?? false,
  answerIntegrityLevel: session.policy?.answerIntegrityLevel === "STRICT" ? "STRICT" : "STANDARD",
});

export const scheduleFormFromSession = (session: ExamSession): ScheduleFormValues => ({
  name: session.name,
  opensAt: toLocalDateTime(session.opensAt),
  closesAt: toLocalDateTime(session.closesAt),
});

import type {
  AudienceSourceRequest,
  ExamPolicyResponse,
  ExamMode,
  ProctorRole,
  ReusePolicy,
  SessionStatus,
  UserResponse,
} from "@pte/api-client";

export interface ExamSession {
  id: string;
  /** What hosts share and students type; falls back to the UUID when the API predates exam codes. */
  sessionCode: string;
  name: string;
  subscriptionPublicId: string;
  examVersionPublicId: string | null;
  templatePublicId: string | null;
  examDefinitionVersion: number | null;
  reusePolicy: ReusePolicy | null;
  seriesKey: string | null;
  draftVersion: number;
  opensAt: string;
  closesAt: string;
  status: SessionStatus;
  capacity: number;
  examMode: ExamMode | null;
  policy: ExamPolicyResponse | null;
  selectedSkills: ExamSkill[];
  maxRetriesPerStudent: number;
}

/** The 4 PTE sections a host picks from to generate an exam (Plan B) — 1 to 4, distinct. */
export type ExamSkill = "SPEAKING" | "WRITING" | "READING" | "LISTENING";

export interface CreateSessionInput {
  name: string;
  /** Gates creation (dev-merge subscription/billing module) — must be an ACTIVE subscription. */
  subscriptionPublicId: string;
  skills: ExamSkill[];
  opensAt: string;
  closesAt: string;
  /** Raw form value — parsed to a positive integer on submit. */
  capacity: string;
}

export interface CreateExamWorkflowInput {
  name: string;
  templatePublicId: string;
  subscriptionPublicId: string;
  opensAt: string;
  closesAt: string;
  /** Controlled input value; parsed and validated before sending to the API. */
  maxRetriesPerStudent: string;
  reusePolicy: ReusePolicy;
  seriesKey: string;
  capacity: string;
  sources: AudienceSourceRequest[];
}

export interface CreateSessionErrors {
  name?: string;
  subscriptionPublicId?: string;
  skills?: string;
  opensAt?: string;
  closesAt?: string;
  capacity?: string;
}

export interface ProctorAssignmentEntry {
  assignmentPublicId: string;
  proctor: UserResponse;
  role: ProctorRole;
}

import type {
  AudienceSourceRequest,
  ExamMode,
  FormMode,
  ProctorRole,
  ReusePolicy,
  SessionStatus,
  UserResponse,
} from "@pte/api-client";

export interface ExamSession {
  id: string;
  name: string;
  subscriptionPublicId: string;
  snapshotPublicId: string | null;
  opensAt: string;
  closesAt: string;
  status: SessionStatus;
  capacity: number;
  examMode: ExamMode | null;
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
  examMode: ExamMode;
  selectedSkills: ExamSkill[];
  /** Controlled input value; parsed and validated before sending to the API. */
  maxRetriesPerStudent: string;
  formMode: FormMode;
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

export interface AssignedClass {
  classPublicId: string;
  className: string;
  programName: string;
}

export interface ProctorAssignmentEntry {
  assignmentPublicId: string;
  proctor: UserResponse;
  role: ProctorRole;
}

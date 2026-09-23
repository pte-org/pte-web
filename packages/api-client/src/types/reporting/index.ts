export interface SkillScoreResponse {
  skill: string;
  score: number | null;
  sufficientData: boolean;
}

export interface ReportResponse {
  attemptPublicId: string;
  sessionPublicId: string;
  published: boolean;
  publishedAt: string | null;
  overall: SkillScoreResponse | null;
  communicativeSkills: SkillScoreResponse[];
}

export interface ReportPublicationBlockerResponse {
  attemptPublicId: string;
  answerPublicId: string | null;
  section: string | null;
  taskType: string | null;
  reason: string;
}

export interface ReportPublicationReadinessResponse {
  sessionPublicId: string;
  sessionClosed: boolean;
  submittedAttemptCount: number;
  readyAttemptCount: number;
  blockerCount: number;
  canPublish: boolean;
  blockers: ReportPublicationBlockerResponse[];
}

export interface ReportPublicationSummaryResponse {
  sessionPublicId: string;
  publicationPublicId: string;
  publishedByPublicId: string;
  publishedAt: string;
  cohortSize: number;
  publishedReportCount: number;
}

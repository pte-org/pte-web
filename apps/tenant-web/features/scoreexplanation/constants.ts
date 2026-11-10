/** Roles that may open a score explanation; the backend still decides (tenant and assignment checks). */
export const SCORE_EXPLANATION_ROLES = ["HOST_ADMIN", "EXAMINER"] as const;

/** 403 and 404 are shown the same way so the screen never reveals whether an attempt exists. */
export const HIDDEN_EXPLANATION_STATUSES: readonly number[] = [403, 404];
export const MAX_EXPLANATION_RETRIES = 2;

/** Placeholder for a number the API did not send. */
export const NO_VALUE = "—";

const HOST_EXAM_SUBMISSIONS_TAB = "submissions";

export const SCORE_EXPLANATION_PATHS = {
  host: (sessionPublicId: string, attemptPublicId: string): string =>
    `/host/exams/${encodeURIComponent(sessionPublicId)}/attempts/${encodeURIComponent(attemptPublicId)}/score-explanation`,
  examiner: (sessionPublicId: string, attemptPublicId: string): string =>
    `/examiner/work/${encodeURIComponent(sessionPublicId)}/${encodeURIComponent(attemptPublicId)}/score-explanation`,
  hostBack: (sessionPublicId: string): string =>
    `/host/exams/${encodeURIComponent(sessionPublicId)}?tab=${HOST_EXAM_SUBMISSIONS_TAB}`,
  examinerBack: (sessionPublicId: string, attemptPublicId: string): string =>
    `/examiner/work/${encodeURIComponent(sessionPublicId)}/${encodeURIComponent(attemptPublicId)}`,
} as const;

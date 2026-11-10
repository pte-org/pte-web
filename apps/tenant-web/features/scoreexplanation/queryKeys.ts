export const SCORE_EXPLANATION_QUERY_KEYS = {
  all: ["scoreExplanation"] as const,
  attempt: (attemptPublicId: string) =>
    [...SCORE_EXPLANATION_QUERY_KEYS.all, attemptPublicId] as const,
};

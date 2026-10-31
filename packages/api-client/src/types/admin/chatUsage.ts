/** Matches the backend's `ChatFailureCounts`: why a day's failed messages failed. The six add up to `failed`. */
export interface ChatFailureCountsResponse {
  timeout: number;
  rateLimited: number;
  authFailed: number;
  unavailable: number;
  truncated: number;
  /** Other reasons, and every failure counted before reasons were kept. */
  other: number;
}

/** Matches the backend's `ChatUsageDay`: one Vietnam day of AI chat traffic, with counts and tokens only. */
export interface ChatUsageDayResponse {
  /** ISO date (yyyy-MM-dd) in Vietnam time. */
  date: string;
  messages: number;
  ok: number;
  refused: number;
  failed: number;
  failures: ChatFailureCountsResponse;
  tokensIn: number;
  tokensOut: number;
  tokensThinking: number;
  /** Tokens times the configured prices; the provider's invoice is the real figure. */
  estimatedCostUsd: number;
}

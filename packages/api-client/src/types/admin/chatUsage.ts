/** Matches the backend's `ChatUsageDay`: one Vietnam day of AI chat traffic, with counts and tokens only. */
export interface ChatUsageDayResponse {
  /** ISO date (yyyy-MM-dd) in Vietnam time. */
  date: string;
  messages: number;
  ok: number;
  refused: number;
  failed: number;
  cacheHits: number;
  tokensIn: number;
  tokensOut: number;
  tokensThinking: number;
  /** Tokens times the configured prices; the provider's invoice is the real figure. */
  estimatedCostUsd: number;
}

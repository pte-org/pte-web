export type ReviewVerdict = "PASS" | "FAIL";

export interface ReviewCheck {
  key: string;
  /** Null while the reviewer has not said yet. */
  ok: boolean | null;
  note: string;
  estimated: string | null;
}

export interface ReviewSummary {
  verdict: ReviewVerdict | null;
  checks: ReviewCheck[];
  fixSuggestion: string | null;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const text = (value: unknown): string | null => (typeof value === "string" && value.trim() ? value : null);

/** The reviewer's (possibly half-written) answer: its verdict, every check it wrote so far and what to fix. */
export function reviewSummary(answer: unknown): ReviewSummary {
  if (!isRecord(answer)) return { verdict: null, checks: [], fixSuggestion: null };
  const verdict = answer.verdict === "PASS" || answer.verdict === "FAIL" ? answer.verdict : null;
  const checks = isRecord(answer.checks)
    ? Object.entries(answer.checks).map(([key, check]): ReviewCheck => {
        const fields = isRecord(check) ? check : {};
        return {
          key,
          ok: typeof fields.ok === "boolean" ? fields.ok : null,
          note: text(fields.note) ?? "",
          estimated: text(fields.estimated),
        };
      })
    : [];
  return { verdict, checks, fixSuggestion: text(answer.fixSuggestion) };
}

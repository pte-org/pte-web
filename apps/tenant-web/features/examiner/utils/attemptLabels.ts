export interface AttemptLabelSource {
  attemptPublicId: string;
  sessionName?: string | null;
  attemptOrdinal?: number | null;
}

/** Last-resort label when the API sent no ordinal (older backend); ids are never the primary label. */
function shortId(value: string): string {
  return value.slice(0, 8).toUpperCase();
}

/** "Bài thi #3" — position within this examiner's assignments for the session. */
export function formatAttemptNumber(attemptLabel: string, source: AttemptLabelSource): string {
  const number = source.attemptOrdinal && source.attemptOrdinal > 0
    ? String(source.attemptOrdinal)
    : shortId(source.attemptPublicId);
  return `${attemptLabel} #${number}`;
}

/** "Kỳ thi PTE tháng 10 · Bài thi #3"; just the number when the session name is unknown. */
export function formatAttemptTitle(attemptLabel: string, source: AttemptLabelSource): string {
  const number = formatAttemptNumber(attemptLabel, source);
  return source.sessionName ? `${source.sessionName} · ${number}` : number;
}

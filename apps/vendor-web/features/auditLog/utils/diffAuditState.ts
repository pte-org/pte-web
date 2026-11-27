/** One leaf that differs between two audit snapshots. `path` lists object keys and array positions from the root. */
export interface AuditFieldChange {
  path: readonly (string | number)[];
  kind: "added" | "removed" | "changed";
  before: unknown;
  after: unknown;
}

export interface AuditStateDiff {
  changes: AuditFieldChange[];
  /** True when either side was too large and the API stored only a preview. */
  truncated: boolean;
}

const TRUNCATED_KEY = "truncated";

type JsonObject = Record<string, unknown>;

const isObject = (value: unknown): value is JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isTruncationMarker = (value: unknown): boolean =>
  isObject(value) && value[TRUNCATED_KEY] === true;

const sameLeaf = (before: unknown, after: unknown): boolean =>
  before === after || (before == null && after == null);

/**
 * Compares two snapshots field by field. The API stores lists in a stable order (options by `orderIndex`,
 * template items by `sequence`), so array positions are compared directly. A whole side that is null (a
 * creation or a deletion) yields one change per leaf of the other side.
 */
export function diffAuditState(before: unknown, after: unknown): AuditStateDiff {
  if (isTruncationMarker(before) || isTruncationMarker(after)) {
    return { changes: [], truncated: true };
  }
  const changes: AuditFieldChange[] = [];
  collect([], before ?? null, after ?? null, changes);
  return { changes, truncated: false };
}

function collect(
  path: (string | number)[],
  before: unknown,
  after: unknown,
  changes: AuditFieldChange[],
): void {
  if (Array.isArray(before) || Array.isArray(after)) {
    const left = Array.isArray(before) ? before : [];
    const right = Array.isArray(after) ? after : [];
    for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
      collect([...path, index], left[index] ?? null, right[index] ?? null, changes);
    }
    return;
  }
  if (isObject(before) || isObject(after)) {
    const left = isObject(before) ? before : {};
    const right = isObject(after) ? after : {};
    const keys = [...new Set([...Object.keys(left), ...Object.keys(right)])].sort();
    keys.forEach((key) => collect([...path, key], left[key] ?? null, right[key] ?? null, changes));
    return;
  }
  if (sameLeaf(before, after)) return;
  const kind = before == null ? "added" : after == null ? "removed" : "changed";
  changes.push({ path, kind, before, after });
}

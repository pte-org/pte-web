/** How one field of a draft is shown: running text, a list (options may mark the correct ones) or small records. */
export type DraftFieldValue =
  | { kind: "text"; text: string }
  | { kind: "list"; items: string[]; correct: number[] }
  | { kind: "records"; records: Array<Array<{ key: string; text: string }>> };

export interface DraftField {
  key: string;
  value: DraftFieldValue;
}

const OPTIONS_KEY = "options";
const CORRECT_KEY = "correctIndexes";
const LIST_SEPARATOR = ", ";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Any value as one line: a list joined, a nested object as compact JSON. */
function asText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(asText).join(LIST_SEPARATOR);
  if (isRecord(value)) return JSON.stringify(value);
  return String(value);
}

function fieldValue(value: unknown, correct: number[]): DraftFieldValue {
  if (Array.isArray(value)) {
    if (value.every((entry) => isRecord(entry))) {
      return {
        kind: "records",
        records: value.map((entry) => Object.entries(entry).map(([key, inner]) => ({ key, text: asText(inner) }))),
      };
    }
    return { kind: "list", items: value.map(asText), correct };
  }
  if (isRecord(value)) {
    return { kind: "records", records: [Object.entries(value).map(([key, inner]) => ({ key, text: asText(inner) }))] };
  }
  return { kind: "text", text: asText(value) };
}

const numbers = (value: unknown): number[] =>
  Array.isArray(value) ? value.filter((entry): entry is number => typeof entry === "number") : [];

/**
 * The fields of a (possibly half-written) draft in the order the model wrote them. When the draft has options, the
 * correct indexes mark those options instead of being a field of their own.
 */
export function draftFields(draft: unknown): DraftField[] {
  if (!isRecord(draft)) return [];
  const hasOptions = Array.isArray(draft[OPTIONS_KEY]);
  const correct = numbers(draft[CORRECT_KEY]);
  return Object.entries(draft)
    .filter(([key]) => !(hasOptions && key === CORRECT_KEY))
    .map(([key, value]) => ({ key, value: fieldValue(value, key === OPTIONS_KEY ? correct : []) }));
}

/** A readable label for a key nobody named: `xLabel` becomes `X label`. */
export function humanizeKey(key: string): string {
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** Option letters: 0 is A. */
export const optionLetter = (index: number): string => String.fromCharCode("A".charCodeAt(0) + index);

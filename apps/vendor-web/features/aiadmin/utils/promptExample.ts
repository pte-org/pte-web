/** One field of an example reply, ready to show as a table row. */
export interface ExampleField {
  field: string;
  /** Plain values shown one per line: a text, the entries of a list, or the fields of each object in a list. */
  lines: string[];
}

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

const FIELD_SEPARATOR = ": ";
const PART_SEPARATOR = " · ";

const isRecord = (value: JsonValue): value is { [key: string]: JsonValue } =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** A value as one readable line: nested objects become "field: value" pairs. */
function inline(value: JsonValue): string {
  if (value === null) return "";
  if (Array.isArray(value)) return value.map(inline).join(", ");
  if (isRecord(value)) {
    return Object.entries(value)
      .map(([key, nested]) => `${key}${FIELD_SEPARATOR}${inline(nested)}`)
      .join(PART_SEPARATOR);
  }
  return String(value);
}

function linesOf(value: JsonValue): string[] {
  if (Array.isArray(value)) return value.map(inline);
  if (isRecord(value)) {
    return Object.entries(value).map(([key, nested]) => `${key}${FIELD_SEPARATOR}${inline(nested)}`);
  }
  return [inline(value)];
}

/**
 * The fields of an example JSON reply, one row per top-level field. Null when the text is not a JSON object (some
 * examples hold notes inside the JSON); the page then shows the text as it is.
 */
export function parseExample(text: string): ExampleField[] | null {
  let parsed: JsonValue;
  try {
    // JSON.parse returns any; the shape is checked right below before it is used.
    parsed = JSON.parse(text) as JsonValue;
  } catch {
    return null;
  }
  if (!isRecord(parsed)) return null;
  return Object.entries(parsed).map(([field, value]) => ({ field, lines: linesOf(value) }));
}

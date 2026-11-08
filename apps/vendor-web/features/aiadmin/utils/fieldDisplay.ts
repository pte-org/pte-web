const EMPTY_VALUE = "—";
const FREE_TEXT = "(free text)";
const PLACEHOLDER = "...";
const BULLET = "• ";
const PAIR_SEPARATOR = ": ";
const NAME_SEPARATOR = " — ";
const ITEM_SEPARATOR = ", ";
const PAIR_GLUE = "; ";
const LINE_BREAK = "\n";
const CHOICES = /^[A-Z_]+(\|[A-Z_]+)+$/;

/** Words that are read differently from how a field name spells them. */
const WORDS: Record<string, string> = { cefr: "CEFR", ai: "AI", id: "ID", ok: "Passed", estimated: "Estimated level" };

/** A field name as words with a capital first letter: passageWithSlots becomes "Passage with slots". */
export function fieldLabel(name: string): string {
  const words = name.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").trim().toLowerCase().split(/\s+/);
  if (words.length === 1 && words[0] === "") return name;
  const spoken = words.map((word) => WORDS[word] ?? word);
  return spoken[0].charAt(0).toUpperCase() + spoken[0].slice(1) + (spoken.length > 1 ? ` ${spoken.slice(1).join(" ")}` : "");
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** One value on one line: plain words for text, yes or no for true and false, a dash for nothing. */
function scalar(value: unknown): string {
  if (value === null || value === undefined) return EMPTY_VALUE;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string") {
    if (value === PLACEHOLDER) return FREE_TEXT;
    return CHOICES.test(value) ? value.split("|").join(" or ") : value;
  }
  return String(value);
}

function inline(value: unknown): string {
  if (Array.isArray(value)) return value.map(inline).join(ITEM_SEPARATOR);
  if (isPlainObject(value)) return pairs(value);
  return scalar(value);
}

function pairs(object: Record<string, unknown>): string {
  return Object.entries(object)
    .map(([key, value]) => `${fieldLabel(key)}${PAIR_SEPARATOR}${inline(value)}`)
    .join(PAIR_GLUE);
}

/**
 * A value as people read it, not as JSON: a list becomes one line per item, an object its "Name: value" pairs (a
 * group of objects one line each), and plain text stays as it is. Data nested any deeper is flattened the same way.
 */
export function valueText(parsed: unknown): string {
  if (Array.isArray(parsed)) {
    return parsed.length === 0 ? EMPTY_VALUE : parsed.map((item) => `${BULLET}${inline(item)}`).join(LINE_BREAK);
  }
  if (isPlainObject(parsed)) {
    const entries = Object.entries(parsed);
    if (entries.length > 0 && entries.every(([, value]) => isPlainObject(value))) {
      return entries.map(([key, value]) => `${fieldLabel(key)}${NAME_SEPARATOR}${pairs(value as Record<string, unknown>)}`)
        .join(LINE_BREAK);
    }
    return pairs(parsed);
  }
  return scalar(parsed);
}

/** The value of an output row as typed (JSON, or plain text) shown as people read it. */
export function fieldValueText(raw: string): string {
  try {
    return valueText(JSON.parse(raw));
  } catch {
    return raw === "" ? EMPTY_VALUE : scalar(raw);
  }
}

/** What the AI wrote, when it is a JSON object: one "Label" line over its value for every field; else the text as it is. */
export function answerText(raw: string): string {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isPlainObject(parsed)) return raw;
    return Object.entries(parsed)
      .map(([key, value]) => `${fieldLabel(key)}${LINE_BREAK}${valueText(value)}`)
      .join(`${LINE_BREAK}${LINE_BREAK}`);
  } catch {
    return raw;
  }
}

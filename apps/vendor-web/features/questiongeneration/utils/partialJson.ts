/**
 * Reads the JSON a model is still writing. The text so far is cut back to its last complete piece (a value, or the
 * part of a string written so far) and the open strings, arrays and objects are closed, so a half-written draft
 * shows every field already started. Returns undefined while there is not yet an object to show.
 */

const FENCE_START = /^\s*```[a-zA-Z]*\s*/;
const FENCE_END = /\s*```\s*$/;
/** A key with no value yet, after the brace or comma that opens it: `{"pass` closed, `, "topic":`. */
const DANGLING_KEY = /([{,])\s*"(?:[^"\\]|\\.)*"\s*:?\s*$/;
/** A literal or number cut where it is not valid yet: `tru`, `nul`, `-`, `12.`, `3e`. A whole number stays. */
const PARTIAL_LITERAL =
  /([:,[{]\s*)(?:t(?:r(?:u)?)?|f(?:a(?:l(?:s)?)?)?|n(?:u(?:l)?)?|-|-?\d*\.|-?\d+(?:\.\d+)?[eE][+-]?)$/;
/** An escape cut in the middle: a lone backslash or `\u00`. */
const PARTIAL_ESCAPE = /\\(?:u[0-9a-fA-F]{0,3})?$/;
const MAX_REPAIRS = 8;

interface ScanState {
  stack: string[];
  inString: boolean;
}

function scan(text: string): ScanState {
  const stack: string[] = [];
  let inString = false;
  let escaped = false;
  for (const char of text) {
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === "{" || char === "[") stack.push(char);
    else if (char === "}" || char === "]") stack.pop();
  }
  return { stack, inString };
}

/** Drops the unfinished tail until what is left ends on a complete piece. */
function trimTail(text: string): string {
  let current = text;
  for (;;) {
    const top = scan(current).stack.at(-1);
    let next = current.replace(/\s+$/, "").replace(/,$/, "");
    if (top === "{") next = next.replace(DANGLING_KEY, (_match, opener: string) => (opener === "{" ? "{" : ""));
    next = next.replace(PARTIAL_LITERAL, (_match, before: string) => before).replace(/\s+$/, "").replace(/[,:]$/, "");
    if (next === current) return current;
    current = next;
  }
}

function close(text: string): string {
  const { inString } = scan(text);
  const withString = inString ? `${text.replace(PARTIAL_ESCAPE, "")}"` : text;
  const trimmed = trimTail(withString);
  const closers = scan(trimmed).stack.reverse().map((open) => (open === "{" ? "}" : "]")).join("");
  return trimmed + closers;
}

function tryParse(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return undefined;
  }
}

export function parsePartialJson(raw: string): unknown {
  const text = raw.replace(FENCE_START, "").replace(FENCE_END, "");
  const start = text.indexOf("{");
  if (start < 0) return undefined;
  let candidate = text.slice(start);
  for (let repair = 0; repair < MAX_REPAIRS; repair += 1) {
    const parsed = tryParse(close(candidate));
    if (parsed !== undefined) return parsed;
    // Something the repair did not foresee: give up the last piece and try again.
    const cut = Math.max(candidate.lastIndexOf(","), candidate.lastIndexOf("{"), candidate.lastIndexOf("["));
    if (cut <= 0) return undefined;
    candidate = candidate.slice(0, cut);
  }
  return undefined;
}

/** The key of the field the model writes now: the last one opened at the top of the object. */
export function lastTopLevelKey(value: unknown): string | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  return Object.keys(value).at(-1) ?? null;
}

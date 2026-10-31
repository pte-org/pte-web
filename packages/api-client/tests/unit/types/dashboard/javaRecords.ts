/**
 * Minimal Java source reader used by the dashboard contract test to compare the TypeScript
 * types with the pte-api `overview` records. It understands exactly what those files use:
 * (nested) `record` declarations with generic components, `import` lines and simple `enum`s.
 * Test support only: never exported from the package barrels.
 */

export interface JavaType {
  /** The type name as written, qualification kept (`Map`, `HostSectionData.Learners`, `long`). */
  name: string;
  args: JavaType[];
}

export interface JavaComponent {
  name: string;
  type: JavaType;
}

export interface JavaRecord {
  name: string;
  /** Enclosing `class`/`interface` (e.g. `AdminSectionData`), or null for a top-level record. */
  outer: string | null;
  /** `Outer.Name`, or just `Name` for a top-level record. */
  qualifiedName: string;
  components: JavaComponent[];
}

export interface JavaSource {
  imports: string[];
  records: JavaRecord[];
}

export interface JavaEnum {
  name: string;
  constants: string[];
}

const OPENERS = "<({[";
const CLOSERS = ">)}]";

/** Blanks out comments (keeping offsets and line breaks) while leaving string literals alone. */
export function stripComments(source: string): string {
  let out = "";
  let i = 0;
  while (i < source.length) {
    const ch = source[i];
    const next = source[i + 1];
    if (ch === "/" && next === "/") {
      while (i < source.length && source[i] !== "\n") {
        out += " ";
        i += 1;
      }
    } else if (ch === "/" && next === "*") {
      const end = source.indexOf("*/", i + 2);
      const stop = end === -1 ? source.length : end + 2;
      for (; i < stop; i += 1) out += source[i] === "\n" ? "\n" : " ";
    } else if (ch === '"' || ch === "'") {
      let j = i + 1;
      while (j < source.length && source[j] !== ch) j += source[j] === "\\" ? 2 : 1;
      out += source.slice(i, j + 1);
      i = j + 1;
    } else {
      out += ch;
      i += 1;
    }
  }
  return out;
}

/** Splits on `separator` only at bracket depth 0 (so `Map<String, Long>` stays whole). */
function splitTopLevel(text: string, separator: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of text) {
    if (OPENERS.includes(ch)) depth += 1;
    else if (CLOSERS.includes(ch)) depth -= 1;
    if (ch === separator && depth === 0) {
      parts.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim() !== "") parts.push(current);
  return parts.map((part) => part.trim()).filter((part) => part !== "");
}

function indexOfMatchingParen(source: string, openIndex: number): number {
  let depth = 0;
  for (let i = openIndex; i < source.length; i += 1) {
    if (source[i] === "(") depth += 1;
    else if (source[i] === ")") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  throw new Error(`Unbalanced parenthesis starting at offset ${openIndex}`);
}

interface ClassSpan {
  name: string;
  start: number;
  end: number;
}

/** Body ranges of `class`/`interface` declarations, outermost first, so a nested record knows its owner. */
function classSpans(code: string): ClassSpan[] {
  const spans: ClassSpan[] = [];
  for (const match of code.matchAll(/\b(?:class|interface)\s+(\w+)[^{;]*\{/g)) {
    const start = match.index + match[0].length - 1;
    let depth = 0;
    let end = code.length;
    for (let i = start; i < code.length; i += 1) {
      if (code[i] === "{") depth += 1;
      else if (code[i] === "}") {
        depth -= 1;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    spans.push({ name: match[1], start, end });
  }
  return spans;
}

export function parseJavaType(text: string): JavaType {
  const trimmed = text.trim();
  if (trimmed.endsWith("[]")) return { name: "[]", args: [parseJavaType(trimmed.slice(0, -2))] };
  const match = /^([\w.]+)\s*(?:<([\s\S]*)>)?$/.exec(trimmed);
  if (!match) throw new Error(`Cannot parse Java type: "${text}"`);
  const args = match[2] === undefined ? [] : splitTopLevel(match[2], ",").map(parseJavaType);
  return { name: match[1], args };
}

function parseComponent(text: string): JavaComponent {
  const withoutNoise = text
    .replace(/@[\w.]+(?:\s*\([^)]*\))?/g, " ")
    .replace(/\bfinal\b/g, " ")
    .trim();
  const match = /^([\s\S]*\S)\s+(\w+)$/.exec(withoutNoise);
  if (!match) throw new Error(`Cannot parse record component: "${text}"`);
  return { name: match[2], type: parseJavaType(match[1]) };
}

/** Reads every `record` declaration (top-level or nested) and the import lines of one file. */
export function parseJavaSource(source: string): JavaSource {
  const code = stripComments(source);
  const imports = [...code.matchAll(/^\s*import\s+(?:static\s+)?([\w.*]+)\s*;/gm)].map((m) => m[1]);
  const records: JavaRecord[] = [];
  const spans = classSpans(code);

  for (const match of code.matchAll(/\brecord\s+(\w+)\s*(?:<[^>]*>)?\s*\(/g)) {
    const openIndex = match.index + match[0].length - 1;
    const closeIndex = indexOfMatchingParen(code, openIndex);
    const body = code.slice(openIndex + 1, closeIndex);
    const enclosing = spans.filter((span) => span.start < match.index && match.index < span.end);
    const outer = enclosing.length > 0 ? enclosing[enclosing.length - 1].name : null;
    records.push({
      name: match[1],
      outer,
      qualifiedName: outer === null ? match[1] : `${outer}.${match[1]}`,
      components: splitTopLevel(body, ",").map(parseComponent),
    });
  }
  return { imports, records };
}

/** Reads the first `enum` declaration of a file: its name and constant names. */
export function parseJavaEnum(source: string): JavaEnum | null {
  const code = stripComments(source);
  const match = /\benum\s+(\w+)\s*\{/.exec(code);
  if (!match) return null;
  const bodyStart = match.index + match[0].length;
  let depth = 1;
  let end = bodyStart;
  while (end < code.length && depth > 0) {
    if (code[end] === "{") depth += 1;
    else if (code[end] === "}") depth -= 1;
    end += 1;
  }
  const body = code.slice(bodyStart, end - 1);
  const constantsPart = splitTopLevel(body, ";")[0] ?? "";
  const constants = splitTopLevel(constantsPart, ",")
    .map((entry) => /^\w+/.exec(entry)?.[0])
    .filter((name): name is string => name !== undefined);
  return { name: match[1], constants };
}

export type DiffKind = "same" | "add" | "del";

export interface DiffLine {
  kind: DiffKind;
  text: string;
  /** Line number in the old text; null for an added line. */
  oldNo: number | null;
  /** Line number in the new text; null for a removed line. */
  newNo: number | null;
}

export type DiffItem = { type: "line"; line: DiffLine } | { type: "fold"; count: number };

export interface SideRow {
  left: DiffLine | null;
  right: DiffLine | null;
}

/** Above this many cells the table is not built and the whole text counts as replaced. */
const MAX_TABLE_CELLS = 4_000_000;
const CONTEXT_LINES = 3;

const linesOf = (text: string): string[] => (text === "" ? [] : text.split(/\r?\n/));

/** A line by line comparison, like the changes view of a code review: which lines stayed, went and came. */
export function diffLines(before: string, after: string): DiffLine[] {
  const a = linesOf(before);
  const b = linesOf(after);
  if (a.length * b.length > MAX_TABLE_CELLS) return replaceAll(a, b);

  const width = b.length + 1;
  const common = new Uint32Array((a.length + 1) * width);
  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      common[i * width + j] =
        a[i] === b[j] ? common[(i + 1) * width + j + 1] + 1 : Math.max(common[(i + 1) * width + j], common[i * width + j + 1]);
    }
  }

  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      result.push({ kind: "same", text: a[i], oldNo: i + 1, newNo: j + 1 });
      i += 1;
      j += 1;
    } else if (common[(i + 1) * width + j] >= common[i * width + j + 1]) {
      result.push({ kind: "del", text: a[i], oldNo: i + 1, newNo: null });
      i += 1;
    } else {
      result.push({ kind: "add", text: b[j], oldNo: null, newNo: j + 1 });
      j += 1;
    }
  }
  for (; i < a.length; i += 1) result.push({ kind: "del", text: a[i], oldNo: i + 1, newNo: null });
  for (; j < b.length; j += 1) result.push({ kind: "add", text: b[j], oldNo: null, newNo: j + 1 });
  return result;
}

function replaceAll(a: string[], b: string[]): DiffLine[] {
  return [
    ...a.map((text, index): DiffLine => ({ kind: "del", text, oldNo: index + 1, newNo: null })),
    ...b.map((text, index): DiffLine => ({ kind: "add", text, oldNo: null, newNo: index + 1 })),
  ];
}

export const hasChanges = (lines: readonly DiffLine[]): boolean => lines.some((line) => line.kind !== "same");

/** The changed lines with a few lines around each; long runs of unchanged lines fold into one marker. */
export function withContext(lines: readonly DiffLine[], context: number = CONTEXT_LINES): DiffItem[] {
  const keep = lines.map((line) => line.kind !== "same");
  lines.forEach((line, index) => {
    if (line.kind === "same") return;
    for (let near = Math.max(0, index - context); near <= Math.min(lines.length - 1, index + context); near += 1) keep[near] = true;
  });
  const items: DiffItem[] = [];
  let folded = 0;
  lines.forEach((line, index) => {
    if (keep[index]) {
      if (folded > 0) items.push({ type: "fold", count: folded });
      folded = 0;
      items.push({ type: "line", line });
    } else {
      folded += 1;
    }
  });
  if (folded > 0) items.push({ type: "fold", count: folded });
  return items;
}

/** Two columns: removed lines on the left beside the added lines that replaced them on the right. */
export function sideBySide(lines: readonly DiffLine[]): SideRow[] {
  const rows: SideRow[] = [];
  let removed: DiffLine[] = [];
  let added: DiffLine[] = [];
  const flush = (): void => {
    for (let index = 0; index < Math.max(removed.length, added.length); index += 1) {
      rows.push({ left: removed[index] ?? null, right: added[index] ?? null });
    }
    removed = [];
    added = [];
  };
  for (const line of lines) {
    if (line.kind === "del") removed.push(line);
    else if (line.kind === "add") added.push(line);
    else {
      flush();
      rows.push({ left: line, right: line });
    }
  }
  flush();
  return rows;
}

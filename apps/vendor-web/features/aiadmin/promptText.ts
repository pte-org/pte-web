import type { PromptBlock, PromptContent } from "@pte/api-client";

/** One row of a JSON reply; `id` only keeps the row in place while it is dragged or edited. */
export interface FieldRow {
  id: string;
  name: string;
  value: string;
}

/** `fields` is null for an ordinary section and the rows of the reply for an output section (its text is optional). */
export interface DocumentSection {
  id: string;
  title: string;
  text: string;
  fields: FieldRow[] | null;
}

/**
 * A prompt as free text for editing: a title, an opening, and sections that each hold one piece of text. The stored
 * form is blocks (paragraphs, lists, code); these functions turn one into the other, so a user only ever types text.
 * A line starting with "- " is a list item and a fenced ``` part is a code example; anything else is a paragraph.
 */
export interface PromptDocumentDraft {
  title: string;
  intro: string;
  sections: DocumentSection[];
}

const BULLET = "- ";
const FENCE = "```";
const CODE_LANGUAGE = "json";
const BLOCK_BREAK = "\n\n";
const LINE_BREAK = "\n";

const block = (type: PromptBlock["type"], text: string, items: string[] = []): PromptBlock => ({
  type,
  label: "",
  text,
  items,
  levels: [],
  sentToAi: true,
});

function blockText(item: PromptBlock): string {
  const label = item.label.trim() === "" ? "" : `${item.label.trim()}${LINE_BREAK}`;
  switch (item.type) {
    case "LIST":
      return label + item.items.map((entry) => `${BULLET}${entry}`).join(LINE_BREAK);
    case "CODE":
      return `${label}${FENCE}${CODE_LANGUAGE}${LINE_BREAK}${item.text}${LINE_BREAK}${FENCE}`;
    case "LEVELS":
      return label + item.levels.map((row) => `${BULLET}${row.level}: ${row.text}`).join(LINE_BREAK);
    case "FIELDS":
      return "";
    default:
      return label + item.text;
  }
}

export const blocksToText = (blocks: readonly PromptBlock[]): string =>
  blocks.filter((item) => item.type !== "FIELDS").map(blockText).join(BLOCK_BREAK);

export function textToBlocks(text: string): PromptBlock[] {
  const blocks: PromptBlock[] = [];
  let paragraph: string[] = [];
  let bullets: string[] = [];
  let code: string[] | null = null;

  const flush = (): void => {
    if (paragraph.length > 0) blocks.push(block("TEXT", paragraph.join(LINE_BREAK)));
    if (bullets.length > 0) blocks.push(block("LIST", "", bullets));
    paragraph = [];
    bullets = [];
  };

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (code !== null) {
      if (line.startsWith(FENCE)) {
        blocks.push(block("CODE", code.join(LINE_BREAK)));
        code = null;
      } else {
        code.push(raw);
      }
    } else if (line.startsWith(FENCE)) {
      flush();
      code = [];
    } else if (line.startsWith(BULLET)) {
      if (paragraph.length > 0) flush();
      bullets.push(line.slice(BULLET.length).trim());
    } else if (line === "") {
      flush();
    } else {
      if (bullets.length > 0) flush();
      paragraph.push(raw.trimEnd());
    }
  }
  if (code !== null) blocks.push(block("CODE", code.join(LINE_BREAK)));
  flush();
  return blocks;
}

const ROW_SEPARATOR = ":";

function rowsOf(items: readonly string[]): FieldRow[] {
  return items.map((item, index) => {
    const separator = item.indexOf(ROW_SEPARATOR);
    return separator < 0
      ? { id: String(index), name: item.trim(), value: "" }
      : { id: String(index), name: item.slice(0, separator).trim(), value: item.slice(separator + 1).trim() };
  });
}

const fieldsBlock = (rows: readonly FieldRow[]): PromptBlock => ({
  type: "FIELDS",
  label: "",
  text: "",
  items: rows.map((row) => `${row.name.trim()}${ROW_SEPARATOR} ${row.value.trim()}`),
  levels: [],
  sentToAi: true,
});

export const toDraft = (content: PromptContent): PromptDocumentDraft => ({
  title: content.title,
  intro: blocksToText(content.intro),
  sections: content.sections.map((section) => {
    const fields = section.blocks.find((item) => item.type === "FIELDS");
    return {
      id: section.id,
      title: section.title,
      text: blocksToText(section.blocks),
      fields: fields ? rowsOf(fields.items) : null,
    };
  }),
});

export const toContent = (draft: PromptDocumentDraft): PromptContent => ({
  title: draft.title.trim(),
  intro: textToBlocks(draft.intro),
  sections: draft.sections.map((section) => ({
    id: section.id,
    title: section.title.trim(),
    blocks: [...textToBlocks(section.text), ...(section.fields ? [fieldsBlock(section.fields)] : [])],
  })),
});

export const draftChanged = (before: PromptDocumentDraft, after: PromptDocumentDraft): boolean =>
  JSON.stringify(before) !== JSON.stringify(after);

function sectionIsComplete(section: DocumentSection): boolean {
  if (section.title.trim() === "") return false;
  if (section.fields === null) return section.text.trim() !== "";
  const names = section.fields.map((row) => row.name.trim());
  return names.length > 0 && names.every((name) => name !== "") && new Set(names).size === names.length;
}

/** What the server insists on: a title, a title and some text for every section, and some text somewhere. */
export function draftIsComplete(draft: PromptDocumentDraft): boolean {
  return (
    draft.title.trim() !== "" &&
    draft.sections.every(sectionIsComplete) &&
    (draft.intro.trim() !== "" || draft.sections.length > 0)
  );
}

import { describe, expect, it } from "vitest";
import type { PromptContent } from "@pte/api-client";
import {
  blocksToText,
  draftChanged,
  draftIsComplete,
  textToBlocks,
  toContent,
  toDraft,
} from "../../../../features/aiadmin/promptText";
import { diffLines, hasChanges, sideBySide, withContext } from "../../../../features/aiadmin/promptDiff";

const SAMPLE = [
  "Create a short passage.",
  "Keep it natural.",
  "",
  "- 50-60 words",
  "- No numbers",
  "",
  "```json",
  '{ "topic": "Daily Life" }',
  "```",
].join("\n");

describe("text and blocks", () => {
  it("reads paragraphs, lists and fenced code, keeping the line breaks of a paragraph", () => {
    const blocks = textToBlocks(SAMPLE);

    expect(blocks.map((item) => item.type)).toEqual(["TEXT", "LIST", "CODE"]);
    expect(blocks[0].text).toBe("Create a short passage.\nKeep it natural.");
    expect(blocks[1].items).toEqual(["50-60 words", "No numbers"]);
    expect(blocks[2].text).toBe('{ "topic": "Daily Life" }');
  });

  it("writes blocks back to the same text", () => {
    expect(blocksToText(textToBlocks(SAMPLE))).toBe(SAMPLE);
  });

  it("is stable: text from blocks reads back to the same blocks", () => {
    const once = textToBlocks(SAMPLE);
    expect(textToBlocks(blocksToText(once))).toEqual(once);
  });

  it("starts a new block when a list follows a paragraph without a blank line", () => {
    expect(textToBlocks("Intro\n- a\n- b\nOutro").map((item) => item.type)).toEqual(["TEXT", "LIST", "TEXT"]);
  });

  it("keeps an unclosed code fence as code and ignores blank text", () => {
    expect(textToBlocks("```\nlet x").map((item) => item.type)).toEqual(["CODE"]);
    expect(textToBlocks("  \n\n")).toEqual([]);
  });
});

describe("document draft", () => {
  const content: PromptContent = {
    title: "Read Aloud",
    intro: textToBlocks("Make a passage."),
    sections: [{ id: "requirements", title: "Requirements", blocks: textToBlocks("- 50 words") }],
  };

  it("round trips a prompt and keeps section ids", () => {
    expect(toContent(toDraft(content))).toEqual(content);
    expect(toDraft(content).sections[0]).toEqual({ id: "requirements", title: "Requirements", text: "- 50 words", fields: null });
  });

  it("knows when it changed and when it is complete", () => {
    const draft = toDraft(content);
    expect(draftChanged(draft, { ...draft })).toBe(false);
    expect(draftChanged(draft, { ...draft, intro: "More" })).toBe(true);
    expect(draftIsComplete(draft)).toBe(true);
    expect(draftIsComplete({ ...draft, title: " " })).toBe(false);
    expect(draftIsComplete({ ...draft, sections: [{ id: "a", title: "A", text: "", fields: null }] })).toBe(false);
    expect(draftIsComplete({ title: "T", intro: "", sections: [] })).toBe(false);
  });
});

describe("diff", () => {
  it("marks removed and added lines and numbers both sides", () => {
    const lines = diffLines("a\nb\nc", "a\nx\nc\nd");

    expect(lines.map((line) => `${line.kind}:${line.text}`)).toEqual(["same:a", "del:b", "add:x", "same:c", "add:d"]);
    expect(lines[1]).toMatchObject({ oldNo: 2, newNo: null });
    expect(lines[2]).toMatchObject({ oldNo: null, newNo: 2 });
    expect(hasChanges(lines)).toBe(true);
  });

  it("finds nothing to show for equal text", () => {
    expect(hasChanges(diffLines("a\nb", "a\nb"))).toBe(false);
    expect(diffLines("", "")).toEqual([]);
  });

  it("folds long unchanged runs around the changes", () => {
    const before = Array.from({ length: 20 }, (_, index) => `line ${index}`).join("\n");
    const after = before.replace("line 10", "changed");

    const items = withContext(diffLines(before, after), 2);

    expect(items.filter((item) => item.type === "fold")).toHaveLength(2);
    expect(items.filter((item) => item.type === "line")).toHaveLength(2 + 2 + 2);
  });

  it("pairs removed lines with the lines that replaced them", () => {
    const rows = sideBySide(diffLines("a\nb\nc", "a\nx\ny\nc"));

    expect(rows.map((row) => [row.left?.text ?? null, row.right?.text ?? null])).toEqual([
      ["a", "a"],
      ["b", "x"],
      [null, "y"],
      ["c", "c"],
    ]);
  });
});

describe("output rows", () => {
  const output: PromptContent = {
    title: "T",
    intro: [],
    sections: [
      {
        id: "output",
        title: "Output",
        blocks: [
          ...textToBlocks("Reply with JSON."),
          { type: "FIELDS", label: "", text: "", items: ["topic: Daily Life", "options: [\"a\", \"b\"]"], levels: [], sentToAi: true },
        ],
      },
    ],
  };

  it("shows the rows of an output section as rows and the rest as text", () => {
    const section = toDraft(output).sections[0];

    expect(section.text).toBe("Reply with JSON.");
    expect(section.fields).toEqual([
      { id: "0", name: "topic", value: "Daily Life" },
      { id: "1", name: "options", value: "[\"a\", \"b\"]" },
    ]);
  });

  it("writes the rows back as one block after the text", () => {
    const back = toContent(toDraft(output));

    expect(back.sections[0].blocks.map((item) => item.type)).toEqual(["TEXT", "FIELDS"]);
    expect(back.sections[0].blocks[1].items).toEqual(["topic: Daily Life", "options: [\"a\", \"b\"]"]);
  });

  it("is complete only when every row has its own name", () => {
    const draft = toDraft(output);
    const rows = draft.sections[0].fields ?? [];

    expect(draftIsComplete(draft)).toBe(true);
    expect(draftIsComplete({ ...draft, sections: [{ ...draft.sections[0], fields: [...rows, { id: "9", name: "", value: "" }] }] })).toBe(false);
    expect(draftIsComplete({ ...draft, sections: [{ ...draft.sections[0], fields: [rows[0], { ...rows[1], name: "topic" }] }] })).toBe(false);
    expect(draftIsComplete({ ...draft, sections: [{ ...draft.sections[0], fields: [] }] })).toBe(false);
  });
});

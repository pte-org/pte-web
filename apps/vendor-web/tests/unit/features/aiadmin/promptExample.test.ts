import { describe, expect, it } from "vitest";
import { fieldLabel, placeholderLabel } from "../../../../features/aiadmin/promptLabels";
import { parseExample } from "../../../../features/aiadmin/utils/promptExample";

describe("parseExample", () => {
  it("turns each top-level field into a row with readable lines", () => {
    const rows = parseExample(
      JSON.stringify({
        topic: "Science",
        options: ["A", "B"],
        correctIndexes: [1],
        turns: [{ speaker: "M", text: "Hello" }],
      }),
    );

    expect(rows).toEqual([
      { field: "topic", lines: ["Science"] },
      { field: "options", lines: ["A", "B"] },
      { field: "correctIndexes", lines: ["1"] },
      { field: "turns", lines: ["speaker: M · text: Hello"] },
    ]);
  });

  it("shows a nested object as one line per field", () => {
    expect(parseExample('{"chart":{"type":"bar","unit":"%"}}')).toEqual([
      { field: "chart", lines: ["type: bar", "unit: %"] },
    ]);
  });

  it("returns null for text that is not a JSON object, so the page shows it as it is", () => {
    expect(parseExample('{ "topic": "x" // note }')).toBeNull();
    expect(parseExample("[1, 2]")).toBeNull();
    expect(parseExample("plain text")).toBeNull();
  });
});

describe("labels", () => {
  it("gives a field a plain name and keeps an unknown field's technical name", () => {
    expect(fieldLabel("transcript", "vi")).toBe("Nội dung đoạn nghe");
    expect(fieldLabel("transcript", "en")).toBe("Spoken text");
    expect(fieldLabel("somethingNew", "vi")).toBe("somethingNew");
  });

  it("explains the values the system fills in and nothing else", () => {
    expect(placeholderLabel("{cefr}", "vi")).toBe("Trình độ CEFR mục tiêu");
    expect(placeholderLabel("Question: six to twenty words", "vi")).toBeUndefined();
  });
});

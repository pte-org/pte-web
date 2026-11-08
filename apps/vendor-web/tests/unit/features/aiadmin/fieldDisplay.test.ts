import { describe, expect, it } from "vitest";
import { answerText, fieldLabel, fieldValueText } from "../../../../features/aiadmin/utils/fieldDisplay";

describe("fieldLabel", () => {
  it("writes a field name as words with a capital first letter", () => {
    expect(fieldLabel("topic")).toBe("Topic");
    expect(fieldLabel("passageWithSlots")).toBe("Passage with slots");
    expect(fieldLabel("correctIndexes")).toBe("Correct indexes");
    expect(fieldLabel("xLabel")).toBe("X label");
    expect(fieldLabel("key_points")).toBe("Key points");
    expect(fieldLabel("cefrFit")).toBe("CEFR fit");
    expect(fieldLabel("ok")).toBe("Passed");
  });
});

describe("fieldValueText", () => {
  it("keeps plain text and shows a missing value as a dash", () => {
    expect(fieldValueText("History and Culture")).toBe("History and Culture");
    expect(fieldValueText("null")).toBe("—");
    expect(fieldValueText("")).toBe("—");
  });

  it("shows a list as one line per item", () => {
    expect(fieldValueText('["Rising", "Falling"]')).toBe("• Rising\n• Falling");
    expect(fieldValueText("[0, 2]")).toBe("• 0\n• 2");
    expect(fieldValueText("[]")).toBe("—");
  });

  it("shows a list of objects as named pairs", () => {
    expect(fieldValueText('[{"answer": "witnessed", "distractors": ["recorded", "showed"]}]')).toBe(
      "• Answer: witnessed; Distractors: recorded, showed",
    );
  });

  it("shows an object as named pairs and flattens deeper lists into words", () => {
    expect(fieldValueText('{"speaker": "A", "text": "Hi"}')).toBe("Speaker: A; Text: Hi");
    expect(fieldValueText("[[1, 2]]")).toBe("• 1, 2");
  });
});

describe("technical values", () => {
  it("never shows [object Object]: nested groups read as one line each", () => {
    const checks = '{"taskFidelity": {"ok": true, "note": "..."}, "cefrFit": {"ok": true, "estimated": "B2", "note": "..."}}';

    expect(fieldValueText(checks)).toBe(
      "Task fidelity — Passed: Yes; Note: (free text)\nCEFR fit — Passed: Yes; Estimated level: B2; Note: (free text)",
    );
  });

  it("reads choices, placeholders and booleans in words", () => {
    expect(fieldValueText("PASS|FAIL")).toBe("PASS or FAIL");
    expect(fieldValueText("...")).toBe("(free text)");
    expect(fieldValueText("true")).toBe("Yes");
    expect(fieldValueText("false")).toBe("No");
  });

  it("shows an answer of the AI field by field", () => {
    expect(answerText('{"topic": "Daily Life", "options": ["a", "b"]}')).toBe("Topic\nDaily Life\n\nOptions\n• a\n• b");
    expect(answerText("not json")).toBe("not json");
  });
});

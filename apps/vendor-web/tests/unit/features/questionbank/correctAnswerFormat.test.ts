import { describe, expect, it } from "vitest";
import { correctAnswerFormatError, correctAnswerHint } from "../../../../features/questionbank/correctAnswerFormat";

describe("correct answer format", () => {
  it("accepts a JSON list of words for type-in and rejects a plain comma list", () => {
    expect(correctAnswerFormatError("FILL_IN_THE_BLANKS_TYPE_IN", '["London", "ecosystem"]')).toBeNull();
    expect(correctAnswerFormatError("FILL_IN_THE_BLANKS_TYPE_IN", "London, ecosystem")).not.toBeNull();
    expect(correctAnswerFormatError("FILL_IN_THE_BLANKS_TYPE_IN", '["a,b"]')).not.toBeNull();
    expect(correctAnswerFormatError("FILL_IN_THE_BLANKS_TYPE_IN", "[]")).not.toBeNull();
  });

  it("needs distinct non-negative integers for Highlight Incorrect Words", () => {
    expect(correctAnswerFormatError("HIGHLIGHT_INCORRECT_WORDS", "[3, 8, 14]")).toBeNull();
    expect(correctAnswerFormatError("HIGHLIGHT_INCORRECT_WORDS", "[3, 3]")).not.toBeNull();
    expect(correctAnswerFormatError("HIGHLIGHT_INCORRECT_WORDS", "[-1]")).not.toBeNull();
    expect(correctAnswerFormatError("HIGHLIGHT_INCORRECT_WORDS", "[3.5]")).not.toBeNull();
    expect(correctAnswerFormatError("HIGHLIGHT_INCORRECT_WORDS", "three, five")).not.toBeNull();
  });

  it("needs one answer with a word for Answer Short Question", () => {
    expect(correctAnswerFormatError("ANSWER_SHORT_QUESTION", "thermometer / a thermometer")).toBeNull();
    expect(correctAnswerFormatError("ANSWER_SHORT_QUESTION", " / ")).not.toBeNull();
  });

  it("leaves other task types and an empty field alone", () => {
    expect(correctAnswerFormatError("WRITE_FROM_DICTATION", "Anything, really.")).toBeNull();
    expect(correctAnswerFormatError("HIGHLIGHT_INCORRECT_WORDS", "  ")).toBeNull();
  });

  it("has a hint only for the formatted task types", () => {
    expect(correctAnswerHint("ANSWER_SHORT_QUESTION")).toContain("/");
    expect(correctAnswerHint("WRITE_FROM_DICTATION")).toBeNull();
  });
});

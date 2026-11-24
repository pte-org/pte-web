import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import {
  ReorderReview,
  TypeInReview,
  normalizeGapValue,
} from "../../../../features/exams/components/AnswerPayloadSections";

const labels = {
  selected: "Selected",
  correct: "Correct",
  incorrect: "Incorrect",
  studentOrder: "Student's order",
  correctOrder: "Correct order",
  studentAnswer: "Student's answer",
  correctAnswer: "Correct answer",
  blank: "Blank",
  leftEmpty: "Left empty",
  wordIndices: "Selected word positions",
  linkedToPrevious: "Follows previous",
  notLinkedToPrevious: "Wrong neighbour",
  pairsSummary: "{correct}/{total} adjacent pairs correct",
};

describe("normalizeGapValue", () => {
  it("trims, collapses spaces and ignores case", () => {
    expect(normalizeGapValue("  The   Sea ")).toBe("the sea");
    expect(normalizeGapValue(null)).toBe("");
  });
});

describe("TypeInReview", () => {
  it("shows what was typed, the key, and marks each blank", () => {
    const html = renderToStaticMarkup(
      <TypeInReview
        gapValues={["Sea", null, "wrong"]}
        correctGapValues={["sea", "river", "lake"]}
        labels={labels}
      />,
    );
    expect(html).toContain("Blank 1");
    expect(html).toContain("Left empty");
    expect(html).toContain("river");
    expect(html.match(/Correct</g)).toHaveLength(1);
    expect(html.match(/Incorrect</g)).toHaveLength(2);
  });

  it("still shows the typed values when the key is unreadable", () => {
    const html = renderToStaticMarkup(
      <TypeInReview gapValues={["sea"]} correctGapValues={null} labels={labels} />,
    );
    expect(html).toContain("sea");
    expect(html).not.toContain("Correct answer");
  });
});

describe("ReorderReview", () => {
  const options = [
    { orderIndex: 0, text: "First", correct: true, selectedByStudent: false },
    { orderIndex: 1, text: "Second", correct: true, selectedByStudent: false },
    { orderIndex: 2, text: "Third", correct: true, selectedByStudent: false },
  ];

  it("scores by adjacent pairs, not by position", () => {
    // Correct order is 0,1,2: only the pair 1 -> 2 is right (1/2), though no position matches.
    const html = renderToStaticMarkup(
      <ReorderReview options={options} submittedOrder={[2, 0, 1]} labels={labels} />,
    );
    expect(html).toContain("1/2 adjacent pairs correct");
    expect(html.match(/Follows previous</g)).toHaveLength(1);
    expect(html.match(/Wrong neighbour</g)).toHaveLength(1);
    expect(html.indexOf("Student&#x27;s order")).toBeLessThan(html.indexOf("Correct order"));
  });
});

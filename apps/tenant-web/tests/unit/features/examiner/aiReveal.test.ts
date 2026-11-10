import { describe, expect, it, vi } from "vitest";
import type { ExaminerAnswerDetailResponse } from "@pte/api-client";

vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  useState: <T,>(initial: T) => [initial, vi.fn()],
}));

import { useAiReveal } from "../../../../features/examiner/hooks/useAiReveal";

const rubricAnswer = {
  answerPublicId: "a1", myScore: null, decision: null,
  rubric: { rubricVersionPublicId: "v1", taskType: "WRITE_ESSAY", mechanicalScores: {}, traits: [
    { key: "CONTENT", editable: true }, { key: "FORM", editable: false },
  ] },
} as unknown as ExaminerAnswerDetailResponse;

describe("useAiReveal", () => {
  it("hides the AI until every editable trait has a band", () => {
    expect(useAiReveal(rubricAnswer, {}).revealed).toBe(false);
    expect(useAiReveal(rubricAnswer, { CONTENT: null }).revealed).toBe(false);
    expect(useAiReveal(rubricAnswer, { CONTENT: 0 }).revealed).toBe(true);
  });
  it("shows the AI at once for a saved answer or an answer without a rubric", () => {
    expect(useAiReveal({ ...rubricAnswer, myScore: 40 }, {}).revealed).toBe(true);
    expect(useAiReveal({ ...rubricAnswer, rubric: null }, {}).revealed).toBe(true);
  });
});

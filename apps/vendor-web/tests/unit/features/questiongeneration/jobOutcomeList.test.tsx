import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { QuestionGenerationJobResponse } from "@pte/api-client";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
import { JobOutcomeList } from "../../../../features/questiongeneration/components/_JobOutcomeList";
import { LIVE_TEXT } from "../../../../features/questiongeneration/liveConstants";
import { failureLabel } from "../../../../features/questiongeneration/utils/failureLabel";

const job = {
  publicId: "job-1",
  succeededCount: 1,
  items: [
    { index: 0, stage: "SAVED", questionPublicId: "q-1", failureCode: null, failureNote: null },
    {
      index: 1,
      stage: "FAILED",
      questionPublicId: null,
      failureCode: "GENERATION_DUPLICATE_CONTENT",
      failureNote: null,
    },
    { index: 2, stage: "CANCELLED", questionPublicId: null, failureCode: null, failureNote: null },
  ],
} as unknown as QuestionGenerationJobResponse;

describe("failureLabel", () => {
  it("reads a failure code in the UI language and never shows the raw code", () => {
    expect(failureLabel("GENERATION_DUPLICATE_CONTENT", "vi")).toBe("Trùng với câu hỏi đã có");
    expect(failureLabel("GENERATION_DUPLICATE_CONTENT", "en")).toBe(
      "Duplicate of an existing question",
    );
    expect(failureLabel("SOMETHING_NEW", "en")).not.toContain("SOMETHING_NEW");
  });
});

describe("JobOutcomeList", () => {
  it("offers a button per saved question, no review link, and the reason of each failure", () => {
    const html = renderToStaticMarkup(<JobOutcomeList job={job} lang="en" text={LIVE_TEXT.en} />);
    expect(html).toContain(`<button`);
    expect(html).toContain(LIVE_TEXT.en.openQuestion);
    expect(html).not.toContain(LIVE_TEXT.en.reviewAll);
    expect(html).toContain("Not saved: Duplicate of an existing question");
    expect(html).toContain(LIVE_TEXT.en.cancelledItem);
    expect(html).not.toContain("GENERATION_DUPLICATE_CONTENT");
  });
});

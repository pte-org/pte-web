import { describe, expect, it } from "vitest";
import { batchReturnTrail } from "../../../../features/questionbank/batchReturnTrail";
import { questionDetailHref } from "../../../../features/questiongeneration/liveConstants";

const BATCH = "74e17d83-21d6-4a32-b0af-953c84364529";

describe("returning to an AI batch from a question", () => {
  it("adds the batch as a breadcrumb step", () => {
    expect(batchReturnTrail(BATCH, "AI question batch")).toEqual([
      { label: "AI question batch", href: `/admin/questions/ai-batches/${BATCH}` },
    ]);
  });

  it("ignores a missing or malformed batch id", () => {
    expect(batchReturnTrail(null, "x")).toBeUndefined();
    expect(batchReturnTrail("../../evil", "x")).toBeUndefined();
  });

  it("links a batch question with its batch, a plain one without", () => {
    expect(questionDetailHref("q1", BATCH)).toBe(`/admin/questions/q1?batch=${BATCH}`);
    expect(questionDetailHref("q1")).toBe("/admin/questions/q1");
  });
});

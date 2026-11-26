import { describe, expect, it } from "vitest";
import { itemStatus } from "../../../../features/questiongeneration/utils/stepPacing";

describe("step pacing", () => {
  it("gives a question row the status of its stage", () => {
    expect(itemStatus("QUEUED")).toBe("waiting");
    expect(itemStatus("REVIEWING")).toBe("active");
    expect(itemStatus("SAVED")).toBe("done");
    expect(itemStatus("READY")).toBe("done");
    expect(itemStatus("FAILED")).toBe("failed");
  });
});

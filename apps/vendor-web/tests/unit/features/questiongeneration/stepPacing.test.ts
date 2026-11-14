import { describe, expect, it } from "vitest";
import { itemStatus, pacedStatuses, settledCount } from "../../../../features/questiongeneration/utils/stepPacing";

describe("step pacing", () => {
  it("counts the finished steps from the first", () => {
    expect(settledCount(["done", "failed", "waiting"])).toBe(2);
    expect(settledCount(["done", "active", "done"])).toBe(1);
    expect(settledCount(["done", "done"])).toBe(2);
  });

  it("shows a step finished too fast as running and the later steps waiting", () => {
    expect(pacedStatuses(["done", "done", "active", "waiting"], 1)).toEqual(["done", "active", "waiting", "waiting"]);
    expect(pacedStatuses(["done", "done", "done"], 0)).toEqual(["active", "waiting", "waiting"]);
  });

  it("shows the real steps once every finished step has been revealed", () => {
    expect(pacedStatuses(["done", "active", "waiting"], 1)).toEqual(["done", "active", "waiting"]);
    expect(pacedStatuses(["done", "failed", "waiting"], 2)).toEqual(["done", "failed", "waiting"]);
  });

  it("gives a question row the status of its stage", () => {
    expect(itemStatus("QUEUED")).toBe("waiting");
    expect(itemStatus("REVIEWING")).toBe("active");
    expect(itemStatus("SAVED")).toBe("done");
    expect(itemStatus("READY")).toBe("done");
    expect(itemStatus("FAILED")).toBe("failed");
  });
});

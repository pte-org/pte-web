import { describe, expect, it } from "vitest";
import { toggleProctor } from "@/features/exams/utils/proctorSelection";

describe("proctorSelection", () => {
  it("adds a newly picked proctor and removes one picked again", () => {
    const picked = toggleProctor([], "p-1");
    expect(picked).toEqual([{ proctorPublicId: "p-1" }]);
    expect(toggleProctor(picked, "p-2")).toEqual([
      { proctorPublicId: "p-1" },
      { proctorPublicId: "p-2" },
    ]);
    expect(toggleProctor(picked, "p-1")).toEqual([]);
  });
});

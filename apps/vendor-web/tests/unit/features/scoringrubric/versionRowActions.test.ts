import { describe, expect, it } from "vitest";
import { versionRowActions } from "../../../../features/scoringrubric/versionRowActions";

const ADMIN = ["PLATFORM_ADMIN"];
const STAFF = ["ACADEMIC_STAFF"];
const EXAMINER = ["EXAMINER"];

describe("versionRowActions", () => {
  it("lets the active version be read and be the seed of a new draft", () => {
    expect(versionRowActions("ACTIVE", ADMIN)).toEqual(["VIEW", "CLONE"]);
    expect(versionRowActions("RETIRED", STAFF)).toEqual(["VIEW", "CLONE"]);
  });

  it("opens a draft in the editor and lets it be sent for review or discarded", () => {
    expect(versionRowActions("DRAFT", STAFF)).toEqual(["EDIT", "SUBMIT", "DISCARD"]);
  });

  it("opens a rejected version in the editor and lets it seed a new draft", () => {
    expect(versionRowActions("REJECTED", STAFF)).toEqual(["EDIT", "CLONE"]);
  });

  it("sends a pending version to review only for those who may approve", () => {
    expect(versionRowActions("PENDING", ADMIN)).toEqual(["VIEW", "CLONE", "REVIEW"]);
    expect(versionRowActions("PENDING", STAFF)).toEqual(["VIEW", "CLONE"]);
  });

  it("only lets someone who may not edit read", () => {
    for (const status of ["DRAFT", "PENDING", "ACTIVE", "REJECTED", "RETIRED"]) {
      expect(versionRowActions(status, EXAMINER)).toEqual(["VIEW"]);
    }
  });
});

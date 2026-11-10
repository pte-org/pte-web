import { describe, expect, it } from "vitest";
import type { PromptContent, PromptVersionResponse } from "@pte/api-client";
import {
  mayPropose,
  newSectionId,
  promptActions,
  removeAt,
  reorderByIds,
  replaceAt,
} from "../../../../features/aiadmin/promptEditing";

const content: PromptContent = { title: "Read Aloud", intro: [], sections: [] };

const version = (overrides: Partial<PromptVersionResponse> = {}): PromptVersionResponse => ({
  publicId: "v1",
  category: "GENERATION",
  key: "READ_ALOUD",
  versionNo: 2,
  status: "DRAFT",
  content,
  assembledText: "",
  placeholders: [],
  authorName: "Ann",
  authorUserPublicId: "author",
  approverName: null,
  rejectionReason: null,
  createdAt: "2026-11-08T00:00:00Z",
  submittedAt: null,
  decidedAt: null,
  activatedAt: null,
  lockVersion: 0,
  test: null,
  ...overrides,
});

const passedTest = { passed: true, current: true, note: null, testedAt: "2026-11-08T00:00:00Z", testedByName: null };

describe("list helpers", () => {
  it("replace and remove leave the original untouched", () => {
    const items = ["a", "b", "c"];
    expect(replaceAt(items, 1, "x")).toEqual(["a", "x", "c"]);
    expect(removeAt(items, 0)).toEqual(["b", "c"]);
    expect(items).toEqual(["a", "b", "c"]);
  });

  it("puts items in the order a drag and drop reports", () => {
    const items = [{ id: "a" }, { id: "b" }, { id: "c" }];
    expect(reorderByIds(items, ["c", "a", "b"]).map((item) => item.id)).toEqual(["c", "a", "b"]);
    expect(reorderByIds(items, ["b"]).map((item) => item.id)).toEqual(["b", "a", "c"]);
    expect(items.map((item) => item.id)).toEqual(["a", "b", "c"]);
  });

  it("gives a new section an id no other section uses", () => {
    expect(newSectionId("", [])).toBe("section");
    expect(newSectionId("", ["section", "section-2"])).toBe("section-3");
    expect(newSectionId("JSON Example!", [])).toBe("json-example");
  });
});

describe("promptActions", () => {
  const staff = { publicId: "author", roles: ["ACADEMIC_STAFF"] };
  const manager = { publicId: "boss", roles: ["ACADEMIC_MANAGER"] };
  const admin = { publicId: "root", roles: ["PLATFORM_ADMIN"] };

  it("lets the author edit a draft and send it only after a passing test", () => {
    const untested = promptActions(version(), staff);
    expect(untested).toMatchObject({ edit: true, submit: true, submitNeedsTest: true, approve: false, discard: true });
    expect(promptActions(version({ test: passedTest }), staff).submitNeedsTest).toBe(false);
    expect(promptActions(version({ test: { ...passedTest, current: false } }), staff).submitNeedsTest).toBe(true);
  });

  it("lets an admin skip the test and activate a draft directly", () => {
    expect(promptActions(version(), admin)).toMatchObject({ submit: true, submitNeedsTest: false, approve: true });
  });

  it("lets a manager approve or reject a pending version of someone else, not their own", () => {
    const pending = version({ status: "PENDING" });
    expect(promptActions(pending, manager)).toMatchObject({ approve: true, reject: true, edit: false });
    expect(promptActions(version({ status: "PENDING", authorUserPublicId: "boss" }), manager)).toMatchObject({
      approve: false,
      reject: false,
    });
    expect(promptActions(pending, staff)).toMatchObject({ approve: false, reject: false });
  });

  it("offers nothing on a version already in use or replaced", () => {
    for (const status of ["ACTIVE", "RETIRED"] as const) {
      expect(promptActions(version({ status }), admin)).toMatchObject({
        edit: false,
        submit: false,
        approve: false,
        reject: false,
        discard: false,
      });
    }
  });

  it("does not let another staff member edit someone else's draft", () => {
    expect(promptActions(version(), { publicId: "other", roles: ["ACADEMIC_STAFF"] }).edit).toBe(false);
    expect(promptActions(version(), manager).edit).toBe(true);
  });
});

describe("mayPropose", () => {
  it("lets academic authors start a proposal and nobody else", () => {
    expect(mayPropose({ publicId: "a", roles: ["ACADEMIC_STAFF"] })).toBe(true);
    expect(mayPropose({ publicId: "a", roles: ["PLATFORM_ADMIN"] })).toBe(true);
    expect(mayPropose({ publicId: "a", roles: ["HOST_ADMIN"] })).toBe(false);
  });
});

describe("tests of scoring and chatbot prompts", () => {
  const staffCaller = { publicId: "author", roles: ["ACADEMIC_STAFF"] };

  it("sends a scoring or chatbot change for approval without a test", () => {
    expect(promptActions(version({ category: "CHATBOT" }), staffCaller).submitNeedsTest).toBe(false);
    expect(promptActions(version({ category: "SCORING" }), staffCaller).submitNeedsTest).toBe(false);
    expect(promptActions(version({ category: "GENERATION" }), staffCaller).submitNeedsTest).toBe(true);
  });
});

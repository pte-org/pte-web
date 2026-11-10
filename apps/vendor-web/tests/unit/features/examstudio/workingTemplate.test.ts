import { describe, expect, it } from "vitest";
import {
  isEditableTemplate,
  pickDefaultTemplate,
  pickWorkingTemplate,
  selectableTemplates,
} from "../../../../features/examstudio/workingTemplate";
import { template } from "./fixtures";

describe("pickDefaultTemplate", () => {
  it("prefers the active version over a newer draft", () => {
    const picked = pickDefaultTemplate([
      template("ACTIVE", 2),
      template("DRAFT", 3),
      template("DRAFT", 4),
      template("RETIRED", 1),
    ]);
    expect(picked?.version).toBe(2);
  });

  it("falls back to the newest draft when nothing is active", () => {
    expect(pickDefaultTemplate([template("DRAFT", 3), template("DRAFT", 4)])?.version).toBe(4);
  });

  it("ignores host-owned templates", () => {
    expect(pickDefaultTemplate([template("ACTIVE", 9, [], "tenant-1"), template("ACTIVE", 2)])?.version).toBe(2);
  });

  it("returns nothing when no template qualifies", () => {
    expect(pickDefaultTemplate([template("RETIRED", 1)])).toBeUndefined();
  });
});

describe("selectableTemplates", () => {
  it("lists the active version and the drafts, newest first, without retired or host ones", () => {
    const versions = selectableTemplates([
      template("RETIRED", 1),
      template("ACTIVE", 2),
      template("DRAFT", 3),
      template("DRAFT", 9, [], "tenant-1"),
    ]).map((entry) => entry.version);
    expect(versions).toEqual([3, 2]);
  });
});

describe("pickWorkingTemplate", () => {
  const all = [template("ACTIVE", 2), template("DRAFT", 3)];

  it("shows the template the user chose", () => {
    const draft = all[1];
    expect(pickWorkingTemplate(all, draft.publicId)?.version).toBe(3);
  });

  it("falls back to the default when the choice is gone or empty", () => {
    expect(pickWorkingTemplate(all, "missing")?.version).toBe(2);
    expect(pickWorkingTemplate(all)?.version).toBe(2);
  });
});

describe("isEditableTemplate", () => {
  it("allows editing only a draft", () => {
    expect(isEditableTemplate(template("DRAFT", 3))).toBe(true);
    expect(isEditableTemplate(template("ACTIVE", 2))).toBe(false);
    expect(isEditableTemplate(undefined)).toBe(false);
  });
});

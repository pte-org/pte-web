import { describe, expect, it } from "vitest";
import { filterPickerTemplates } from "../../../../features/examstudio/templatePicker";
import { template } from "./fixtures";

describe("filterPickerTemplates", () => {
  const all = [
    template("DRAFT", 3),
    template("ACTIVE", 5),
    template("DRAFT", 4),
    { ...template("DRAFT", 7), name: "Reading only" },
  ];

  it("lists the active template first, then drafts from the newest", () => {
    expect(filterPickerTemplates(all, "").map((entry) => entry.version)).toEqual([5, 7, 4, 3]);
  });

  it("matches every word of the query against name, code, version and status", () => {
    expect(filterPickerTemplates(all, "reading").map((entry) => entry.version)).toEqual([7]);
    expect(filterPickerTemplates(all, "draft v4").map((entry) => entry.version)).toEqual([4]);
    expect(filterPickerTemplates(all, "pte_score").length).toBe(4);
    expect(filterPickerTemplates(all, "nothing")).toEqual([]);
  });
});

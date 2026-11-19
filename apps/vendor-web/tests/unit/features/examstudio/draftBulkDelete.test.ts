import { describe, expect, it, vi } from "vitest";
import { deletableIds, deleteEach, isBulkDeletable, toggleAll, toggleId } from "../../../../features/examstudio/draftBulkDelete";

describe("draft bulk delete", () => {
  it("only lets drafts the server allows to delete be picked", () => {
    expect(isBulkDeletable({ status: "draft", canDeleteDraft: true })).toBe(true);
    expect(isBulkDeletable({ status: "draft", canDeleteDraft: false })).toBe(false);
    expect(isBulkDeletable({ status: "draft" })).toBe(false);
    expect(isBulkDeletable({ status: "pending_approval", canDeleteDraft: true })).toBe(false);
    expect(isBulkDeletable({ status: "published", canDeleteDraft: true })).toBe(false);
    expect(deletableIds([
      { id: "a", status: "draft", canDeleteDraft: true },
      { id: "b", status: "published", canDeleteDraft: false },
      { id: "c", status: "draft", canDeleteDraft: true },
    ])).toEqual(["a", "c"]);
  });

  it("toggles one draft, and all of a page or none", () => {
    const one = toggleId(new Set(), "a");
    expect([...one]).toEqual(["a"]);
    expect([...toggleId(one, "a")]).toEqual([]);
    expect([...toggleAll(one, ["a", "b"])]).toEqual(["a", "b"]);
    expect([...toggleAll(new Set(["a", "b"]), ["a", "b"])]).toEqual([]);
    expect([...toggleAll(new Set(), [])]).toEqual([]);
  });

  it("keeps deleting after a refusal and counts the outcome", async () => {
    const deleteOne = vi.fn((id: string) => (id === "b" ? Promise.reject(new Error("not a draft")) : Promise.resolve()));
    await expect(deleteEach(["a", "b", "c"], deleteOne)).resolves.toEqual({ deleted: 2, failed: 1 });
    expect(deleteOne).toHaveBeenCalledTimes(3);
  });
});

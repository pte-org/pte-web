import { describe, expect, it, vi } from "vitest";
import { discardDraftOnFailure } from "../../../../features/exams/utils/discardDraftOnFailure";

describe("discardDraftOnFailure", () => {
  it("keeps the draft when every step succeeds", async () => {
    const deleteDraft = vi.fn().mockResolvedValue(undefined);
    await expect(discardDraftOnFailure(async () => "published", deleteDraft)).resolves.toBe("published");
    expect(deleteDraft).not.toHaveBeenCalled();
  });

  it("deletes the draft and rethrows when a later step fails", async () => {
    const clash = new Error("SESSION_TIME_CONFLICT");
    const deleteDraft = vi.fn().mockResolvedValue(undefined);
    await expect(discardDraftOnFailure(() => Promise.reject(clash), deleteDraft)).rejects.toBe(clash);
    expect(deleteDraft).toHaveBeenCalledOnce();
  });

  it("still reports the original error if the delete fails too", async () => {
    const clash = new Error("SESSION_TIME_CONFLICT");
    const deleteDraft = vi.fn().mockRejectedValue(new Error("network"));
    await expect(discardDraftOnFailure(() => Promise.reject(clash), deleteDraft)).rejects.toBe(clash);
  });
});

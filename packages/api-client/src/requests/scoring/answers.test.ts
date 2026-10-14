import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../../client/client";
import { listAnswers } from "./answers";

function fakeClient(): ApiClient & { request: ReturnType<typeof vi.fn> } {
  return { request: vi.fn().mockResolvedValue({}), upload: vi.fn(), download: vi.fn() } as never;
}

describe("answer requests", () => {
  it("encodes the optional server-side search parameter", async () => {
    const client = fakeClient();

    await listAnswers(client, {
      sessionPublicId: "session-id",
      page: 0,
      size: 20,
      search: "  describe & summarize ",
    });

    expect(client.request).toHaveBeenCalledWith(
      "/api/v1/answers?sessionPublicId=session-id&search=describe+%26+summarize&page=0&size=20",
    );
  });
});

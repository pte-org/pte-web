import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../../client/client";
import { getQuestionStats, listQuestions } from "./index";

function fakeClient(): ApiClient & { request: ReturnType<typeof vi.fn> } {
  return {
    request: vi.fn().mockResolvedValue({ data: [], meta: {} }),
    upload: vi.fn(),
    download: vi.fn(),
  } as unknown as ApiClient & { request: ReturnType<typeof vi.fn> };
}

describe("question requests", () => {
  it("sends server-side pagination and filters", async () => {
    const client = fakeClient();

    await listQuestions(
      client,
      { section: "READING", status: "APPROVED", q: " Packet " },
      2,
      25,
    );

    expect(client.request).toHaveBeenCalledWith(
      "/api/v1/questions?page=2&size=25&section=READING&status=APPROVED&q=+Packet+",
    );
  });

  it("loads question-bank statistics from the dedicated endpoint", async () => {
    const client = fakeClient();

    await getQuestionStats(client);

    expect(client.request).toHaveBeenCalledWith("/api/v1/questions/stats");
  });
});

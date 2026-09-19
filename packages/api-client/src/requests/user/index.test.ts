import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../../client/client";
import { listExamStaff } from "./index";

function fakeClient(): ApiClient & { request: ReturnType<typeof vi.fn> } {
  return {
    request: vi.fn().mockResolvedValue({ data: [], meta: {} }),
    upload: vi.fn(),
    download: vi.fn(),
  } as unknown as ApiClient & { request: ReturnType<typeof vi.fn> };
}

describe("exam staff requests", () => {
  it("sends server-side pagination and filters", async () => {
    const client = fakeClient();

    await listExamStaff(client, {
      page: 3,
      size: 50,
      search: " Alice ",
      role: "EXAMINER",
      status: "ACTIVE",
      sort: "FULL_NAME",
      direction: "ASC",
    });

    expect(client.request).toHaveBeenCalledWith(
      "/api/v1/users/exam-staff?page=3&size=50&role=EXAMINER&status=ACTIVE&sort=FULL_NAME&direction=ASC&search=Alice",
    );
  });
});

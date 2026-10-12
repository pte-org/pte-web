import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../../client/client";
import { listStudentRoster, STUDENT_ROSTER_ENDPOINTS } from "./studentRoster";

function fakeClient(): ApiClient & { request: ReturnType<typeof vi.fn> } {
  return {
    request: vi.fn().mockResolvedValue({}),
    upload: vi.fn(),
    uploadDownload: vi.fn(),
    download: vi.fn(),
  } as unknown as ApiClient & { request: ReturnType<typeof vi.fn> };
}

describe("student roster request contract", () => {
  it("sends search and server-side filters to the roster endpoint", async () => {
    const client = fakeClient();

    await listStudentRoster(client, {
      page: 1,
      size: 25,
      search: "  Nguyen  ",
      programPublicId: "program-1",
      status: "SUSPENDED",
    });

    expect(client.request).toHaveBeenCalledWith(
      `${STUDENT_ROSTER_ENDPOINTS.roster}?page=1&size=25&search=Nguyen&programPublicId=program-1&status=SUSPENDED`,
    );
  });
});

import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../../client/client";
import { listPracticeRubrics, publishPracticeRubric, retirePracticeRubric } from "./index";

function fakeClient(): ApiClient & { request: ReturnType<typeof vi.fn> } {
  return { request: vi.fn().mockResolvedValue({ data: [], meta: {} }), upload: vi.fn(), download: vi.fn() } as unknown as ApiClient & { request: ReturnType<typeof vi.fn> };
}

describe("practice rubric requests", () => {
  it("uses the paged rubric endpoint and filters", async () => {
    const client = fakeClient();
    await listPracticeRubrics(client, {
      page: 2,
      size: 25,
      status: "PENDING_APPROVAL",
      taskTypeKey: "WRITE_ESSAY",
      rubricKey: "PTEPREP.WRITE_ESSAY",
      authorUserPublicId: "author-1",
      version: 3,
    });
    expect(client.request).toHaveBeenCalledWith(
      "/api/v1/practice-rubrics?page=2&size=25&status=PENDING_APPROVAL&taskTypeKey=WRITE_ESSAY&rubricKey=PTEPREP.WRITE_ESSAY&authorUserPublicId=author-1&version=3",
    );
  });

  it("sends the publish reason and optimistic version", async () => {
    const client = fakeClient();
    await publishPracticeRubric(client, "rubric-1", { reason: "approved", expectedVersion: 4 });
    expect(client.request).toHaveBeenCalledWith("/api/v1/practice-rubrics/rubric-1/publish", {
      method: "POST",
      body: { reason: "approved", expectedVersion: 4 },
    });
  });

  it("passes expected version when retiring", async () => {
    const client = fakeClient();
    await retirePracticeRubric(client, "rubric-1", 5);
    expect(client.request).toHaveBeenCalledWith("/api/v1/practice-rubrics/rubric-1/retire?expectedVersion=5", {
      method: "POST",
    });
  });
});

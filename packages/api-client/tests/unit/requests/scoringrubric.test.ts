import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../../../src/client/client";
import {
  getRubricTaskType,
  getRubricVersion,
  listRubricTaskTypes,
  listRubricVersions,
} from "../../../src/requests/scoringrubric";
import { getScoreExplanation } from "../../../src/requests/scoreexplanation";
import * as packageRoot from "../../../src";

function fakeClient(): ApiClient & { request: ReturnType<typeof vi.fn> } {
  return { request: vi.fn().mockResolvedValue({}), upload: vi.fn(), download: vi.fn() } as never;
}

const VERSION_ID = "6b1f0c1e-1111-4222-8333-944445555666";

describe("scoring rubric requests", () => {
  it("lists task types of the ACTIVE version when no version is given", async () => {
    const client = fakeClient();
    await listRubricTaskTypes(client);
    await listRubricTaskTypes(client, "   ");
    expect(client.request).toHaveBeenNthCalledWith(1, "/api/v1/scoring-rubrics/task-types");
    expect(client.request).toHaveBeenNthCalledWith(2, "/api/v1/scoring-rubrics/task-types");
  });

  it("passes the pinned version as versionId", async () => {
    const client = fakeClient();
    await listRubricTaskTypes(client, VERSION_ID);
    await getRubricTaskType(client, "WRITE_ESSAY", VERSION_ID);
    expect(client.request).toHaveBeenNthCalledWith(
      1,
      `/api/v1/scoring-rubrics/task-types?versionId=${VERSION_ID}`,
    );
    expect(client.request).toHaveBeenNthCalledWith(
      2,
      `/api/v1/scoring-rubrics/task-types/WRITE_ESSAY?versionId=${VERSION_ID}`,
    );
  });

  it("encodes the task type path segment", async () => {
    const client = fakeClient();
    await getRubricTaskType(client, "A/B C");
    expect(client.request).toHaveBeenCalledWith("/api/v1/scoring-rubrics/task-types/A%2FB%20C");
  });

  it("reads versions", async () => {
    const client = fakeClient();
    await listRubricVersions(client);
    await getRubricVersion(client, VERSION_ID);
    expect(client.request).toHaveBeenNthCalledWith(1, "/api/v1/scoring-rubrics/versions");
    expect(client.request).toHaveBeenNthCalledWith(
      2,
      `/api/v1/scoring-rubrics/versions/${VERSION_ID}`,
    );
  });
});

describe("score explanation request", () => {
  it("reads one attempt's explanation with no version-comparison parameter", async () => {
    const client = fakeClient();
    await getScoreExplanation(client, "attempt-1");
    expect(client.request).toHaveBeenCalledWith(
      "/api/v1/reports/attempts/attempt-1/score-explanation",
    );
    expect(client.request.mock.calls[0]).toHaveLength(1);
    expect(String(client.request.mock.calls[0][0])).not.toMatch(/compare|version/i);
  });

  it("is exported from the package root", () => {
    expect(packageRoot.getScoreExplanation).toBe(getScoreExplanation);
    expect(packageRoot.listRubricTaskTypes).toBe(listRubricTaskTypes);
  });
});

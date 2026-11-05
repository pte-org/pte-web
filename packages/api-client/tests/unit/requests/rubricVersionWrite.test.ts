import { expect, it, vi } from "vitest";
import type { ApiClient } from "../../../src/client/client";
import { createRubricVersion, updateRubricVersion, changeRubricVersionStatus, getRubricVersionDiff, getRubricActivations } from "../../../src/requests/scoringrubric";

it("uses version create/update/status/diff/audit endpoints and preserves confirmation and optimistic version", async () => {
  const request = vi.fn().mockResolvedValue({});
  const client: ApiClient = { request, upload: vi.fn(), download: vi.fn(), uploadDownload: vi.fn(), ensureFreshAccessToken: vi.fn() };
  const payload = { parameters: { azureBandMappingVersion: 1, taskTypes: {} }, expectedLockVersion: 4 };
  await createRubricVersion(client, payload);
  await updateRubricVersion(client, "v1", payload);
  const confirmation = { action: "ACTIVATE" as const, expectedActiveVersionPublicId: "old", confirmedDiffDigest: "digest" };
  await changeRubricVersionStatus(client, "v1", confirmation);
  await getRubricVersionDiff(client, "v1");
  await getRubricActivations(client, "v1");
  expect(request).toHaveBeenNthCalledWith(1, "/api/v1/scoring-rubrics/versions", { method: "POST", body: payload });
  expect(request).toHaveBeenNthCalledWith(2, "/api/v1/scoring-rubrics/versions/v1", { method: "PUT", body: payload });
  expect(request).toHaveBeenNthCalledWith(3, "/api/v1/scoring-rubrics/versions/v1/status", { method: "PATCH", body: confirmation });
  expect(request).toHaveBeenNthCalledWith(4, "/api/v1/scoring-rubrics/versions/v1/diff");
  expect(request).toHaveBeenNthCalledWith(5, "/api/v1/scoring-rubrics/versions/v1/activations");
});

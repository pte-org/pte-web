import { expect, it, vi } from "vitest";
import type { ApiClient } from "../../../src/client/client";
import { simulateScore } from "../../../src/requests/scoringrubric";

it("POSTs simulation inputs without conversion", async () => {
  const request = vi.fn().mockResolvedValue({ rawScore: 69 });
  const client: ApiClient = { request, upload: vi.fn(), download: vi.fn(), uploadDownload: vi.fn(), ensureFreshAccessToken: vi.fn(), openStream: vi.fn() };
  const body = { taskType: "DESCRIBE_IMAGE", traitScores: { CONTENT: 4, PRONUNCIATION: 3, ORAL_FLUENCY: 4 } };
  await simulateScore(client, body);
  expect(request).toHaveBeenCalledWith("/api/v1/scoring-rubrics/simulations", { method: "POST", body });
});

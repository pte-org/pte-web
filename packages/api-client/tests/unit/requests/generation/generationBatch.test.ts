import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../../../../src/client/client";
import { ApiError } from "../../../../src/client/apiError";
import { getUserFacingApiErrorMessage } from "../../../../src/client/errorMessage";
import { listQuestionGenerationJobs } from "../../../../src/requests/generation";
import {
  cancelQuestionGenerationBatch,
  createQuestionGenerationBatch,
  deleteQuestionGenerationBatchDrafts,
  getQuestionGenerationBatch,
  listQuestionGenerationBatches,
} from "../../../../src/requests/generationBatch";

const BASE = "/api/v1/question-generation/batches";
const request = vi.fn();
const client: ApiClient = {
  request,
  upload: vi.fn(),
  download: vi.fn(),
  uploadDownload: vi.fn(),
  ensureFreshAccessToken: vi.fn(),
  openStream: vi.fn(),
};

beforeEach(() => {
  request.mockReset();
  request.mockResolvedValue({});
});

describe("batch generation requests", () => {
  it("POSTs a new batch with its rows", async () => {
    const body = {
      pool: "PRACTICE",
      rows: [{ taskType: "DESCRIBE_IMAGE", cefrLevel: "B1", count: 2, topicHints: ["climate"], imageKind: "CHART" as const }],
    };
    await createQuestionGenerationBatch(client, body);
    expect(request).toHaveBeenCalledWith(BASE, { method: "POST", body });
  });

  it("GETs one batch by id", async () => {
    await getQuestionGenerationBatch(client, "b-1");
    expect(request).toHaveBeenCalledWith(`${BASE}/b-1`);
  });

  it("lists batches with page, size and mine defaults", async () => {
    await listQuestionGenerationBatches(client);
    expect(request).toHaveBeenCalledWith(`${BASE}?page=0&size=20&mine=false`);
    await listQuestionGenerationBatches(client, { page: 2, size: 5, mine: true });
    expect(request).toHaveBeenLastCalledWith(`${BASE}?page=2&size=5&mine=true`);
  });

  it("POSTs cancel without a body", async () => {
    await cancelQuestionGenerationBatch(client, "b-1");
    expect(request).toHaveBeenCalledWith(`${BASE}/b-1/cancel`, { method: "POST" });
  });

  it("POSTs a draft delete with an empty body by default and given ids otherwise", async () => {
    await deleteQuestionGenerationBatchDrafts(client, "b-1");
    expect(request).toHaveBeenCalledWith(`${BASE}/b-1/drafts/delete`, { method: "POST", body: {} });
    await deleteQuestionGenerationBatchDrafts(client, "b-1", { questionPublicIds: ["q-1"] });
    expect(request).toHaveBeenLastCalledWith(`${BASE}/b-1/drafts/delete`, {
      method: "POST",
      body: { questionPublicIds: ["q-1"] },
    });
  });

  it("encodes the batch id in the path", async () => {
    await getQuestionGenerationBatch(client, "a/b");
    expect(request).toHaveBeenCalledWith(`${BASE}/a%2Fb`);
  });
});

describe("job list", () => {
  it("only asks for batch children when requested", async () => {
    await listQuestionGenerationJobs(client, 0, 5);
    expect(request).toHaveBeenCalledWith("/api/v1/question-generation/jobs?page=0&size=5");
    await listQuestionGenerationJobs(client, 0, 5, true);
    expect(request).toHaveBeenLastCalledWith(
      "/api/v1/question-generation/jobs?page=0&size=5&includeBatchChildren=true",
    );
  });
});

describe("batch error catalog", () => {
  it("maps a batch code to safe copy instead of the raw code", () => {
    const error = new ApiError("conflict", 409, "GENERATION_BATCH_NOT_CANCELLABLE", undefined, {
      code: "GENERATION_BATCH_NOT_CANCELLABLE",
    });
    const message = getUserFacingApiErrorMessage(error, "fallback");
    expect(message).not.toContain("GENERATION_");
    expect(message).not.toBe("fallback");
  });
});

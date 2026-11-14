import { describe, expect, it } from "vitest";
import { ApiError } from "@pte/api-client";
import { generationMessages } from "../../../../features/questiongeneration/messages/vi";
import { generationStartError } from "../../../../features/questiongeneration/utils/generationStartError";

describe("generation start error", () => {
  it("says a job of the person is still running", () => {
    const error = new ApiError("conflict", 409, "GENERATION_JOB_ALREADY_RUNNING", undefined,
      { code: "GENERATION_JOB_ALREADY_RUNNING" });
    expect(generationStartError(error, generationMessages)).toBe(generationMessages.startErrorAlreadyRunning);
  });

  it("falls back to a general message for anything else", () => {
    expect(generationStartError(new Error("network"), generationMessages)).toBe(generationMessages.startError);
  });
});

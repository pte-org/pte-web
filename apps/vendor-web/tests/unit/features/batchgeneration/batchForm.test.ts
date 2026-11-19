import { describe, expect, it } from "vitest";
import { ApiError } from "@pte/api-client";
import { batchMessages } from "../../../../features/batchgeneration/messages/en";
import { batchErrorMessage } from "../../../../features/batchgeneration/utils/batchError";
import { parseTopicHints, topicHintsError } from "../../../../features/batchgeneration/utils/batchForm";

// The batch form's row/total/request rules moved to the generation popup (generationSelection.test.ts);
// the topic rules stay here because the popup reuses them.
describe("batch topics", () => {
  it("parses topics one per line, trimming blanks and duplicates", () => {
    expect(parseTopicHints(" climate \n\nurban life\nclimate\r\n")).toEqual(["climate", "urban life"]);
  });

  it("refuses invalid characters", () => {
    expect(topicHintsError(parseTopicHints("bad <tag>"))).toBe("errTopicChars");
  });

  it("limits a row to ten topics of at most 500 characters", () => {
    const eleven = Array.from({ length: 11 }, (_, index) => `topic ${index}`);
    expect(topicHintsError(eleven)).toBe("errTopicCount");
    expect(topicHintsError(["a".repeat(501)])).toBe("errTopicLength");
    expect(topicHintsError(["climate", "urban life"])).toBeUndefined();
  });
});

describe("batch errors", () => {
  const apiError = (code: string, status = 409): ApiError =>
    new ApiError("conflict", status, code, undefined, { code });

  it("tells the person an open batch or job blocks a new one", () => {
    expect(batchErrorMessage(apiError("GENERATION_JOB_ALREADY_RUNNING"), batchMessages, "createError")).toBe(
      batchMessages.createAlreadyOpen,
    );
  });

  it("explains a disabled batch feature even though it is a 503", () => {
    expect(batchErrorMessage(apiError("GENERATION_BATCH_DISABLED", 503), batchMessages, "createError")).toBe(
      batchMessages.batchDisabled,
    );
  });

  it("falls back to the given message for unknown failures", () => {
    expect(batchErrorMessage(new Error("boom"), batchMessages, "cancelError")).toBe(batchMessages.cancelError);
  });
});


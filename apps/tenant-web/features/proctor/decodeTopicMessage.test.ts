import { describe, expect, it } from "vitest";
import { decodeTopicMessage } from "./decodeTopicMessage";

describe("decodeTopicMessage", () => {
  it("decodes commandType: FORCE_SUBMIT correctly", () => {
    const raw = JSON.stringify({
      commandType: "FORCE_SUBMIT",
      attemptPublicId: "att-123",
      examSessionPublicId: "session-456",
      dispatchedAt: "2026-10-12T00:00:00Z",
    });

    const result = decodeTopicMessage(raw);
    expect(result.type).toBe("COMMAND");
    if (result.type === "COMMAND") {
      expect(result.event.action).toBe("FORCE_SUBMIT");
      expect(result.event.attemptPublicId).toBe("att-123");
      expect(result.event.examSessionPublicId).toBe("session-456");
      expect(result.event.dispatchedAt).toBe("2026-10-12T00:00:00Z");
    }
  });

  it("decodes legacy action: FORCE_SUBMIT correctly", () => {
    const raw = JSON.stringify({
      action: "FORCE_SUBMIT",
      attemptPublicId: "att-789",
      examSessionPublicId: "session-456",
    });

    const result = decodeTopicMessage(raw);
    expect(result.type).toBe("COMMAND");
    if (result.type === "COMMAND") {
      expect(result.event.action).toBe("FORCE_SUBMIT");
      expect(result.event.attemptPublicId).toBe("att-789");
    }
  });

  it("decodes violation messages correctly", () => {
    const raw = JSON.stringify({
      publicId: "v-1",
      attemptPublicId: "att-123",
      violationType: "TAB_SWITCH",
      detail: "Switched to outside app",
      detectedAt: "2026-10-12T00:01:00Z",
    });

    const result = decodeTopicMessage(raw);
    expect(result.type).toBe("VIOLATION");
    if (result.type === "VIOLATION") {
      expect(result.event.publicId).toBe("v-1");
      expect(result.event.violationType).toBe("TAB_SWITCH");
      expect(result.event.detectedAt).toBe("2026-10-12T00:01:00Z");
    }
  });

  it("safely tags malformed payloads as UNKNOWN without throwing", () => {
    expect(decodeTopicMessage("not json").type).toBe("UNKNOWN");
    expect(decodeTopicMessage("null").type).toBe("UNKNOWN");
    expect(decodeTopicMessage("{}").type).toBe("UNKNOWN");
  });
});

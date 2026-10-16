import type { LegacyTopicCommandEvent, LegacyTopicViolationEvent, TopicMessage } from "./transportTypes";

/**
 * Parses and runtime-validates messages received on /topic/proctor-sessions/{examSessionId}.
 * Malformed or unparseable payloads are safely tagged as UNKNOWN without throwing.
 */
export function decodeTopicMessage(rawBody: string): TopicMessage {
  try {
    const parsed = JSON.parse(rawBody) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") {
      return { type: "UNKNOWN", payload: rawBody };
    }

    const isForceSubmit =
      (parsed.action === "FORCE_SUBMIT" || parsed.commandType === "FORCE_SUBMIT") &&
      typeof parsed.attemptPublicId === "string";

    if (isForceSubmit) {
      const commandEvent: LegacyTopicCommandEvent = {
        action: "FORCE_SUBMIT",
        examSessionPublicId: String(parsed.examSessionPublicId ?? ""),
        attemptPublicId: parsed.attemptPublicId as string,
        dispatchedAt: typeof parsed.dispatchedAt === "string" ? parsed.dispatchedAt : undefined,
      };
      return { type: "COMMAND", event: commandEvent };
    }

    if (
      typeof parsed.publicId === "string" &&
      typeof parsed.violationType === "string"
    ) {
      const violationEvent: LegacyTopicViolationEvent = {
        publicId: parsed.publicId,
        attemptPublicId: typeof parsed.attemptPublicId === "string" ? parsed.attemptPublicId : "",
        violationType: parsed.violationType,
        detail: typeof parsed.detail === "string" ? parsed.detail : null,
        sequenceNo: typeof parsed.sequenceNo === "number" ? parsed.sequenceNo : 0,
        hash: typeof parsed.hash === "string" ? parsed.hash : "",
        detectedAt: typeof parsed.detectedAt === "string" ? parsed.detectedAt : new Date().toISOString(),
        sessionPublicId: typeof parsed.sessionPublicId === "string" ? parsed.sessionPublicId : undefined,
        note: typeof parsed.note === "string" ? parsed.note : null,
      };
      return { type: "VIOLATION", event: violationEvent };
    }

    return { type: "UNKNOWN", payload: parsed };
  } catch {
    return { type: "UNKNOWN", payload: rawBody };
  }
}

import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../../client/client";
import {
  submitTicket,
  listTickets,
  getTicket,
  SUPPORT_TICKET_ENDPOINTS,
} from "./tickets";

function fakeClient(): ApiClient & { request: ReturnType<typeof vi.fn> } {
  return {
    request: vi.fn().mockResolvedValue({}),
    upload: vi.fn(),
    download: vi.fn(),
  } as unknown as ApiClient & { request: ReturnType<typeof vi.fn> };
}

describe("support ticket requests", () => {
  describe("submitTicket", () => {
    it("POSTs to the tickets endpoint with the given payload", async () => {
      const client = fakeClient();
      const payload = {
        category: "CONTENT_COMPLAINT" as const,
        description: "This question has a typo.",
        entityType: "QUESTION" as const,
        entityId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      };

      await submitTicket(client, payload);

      expect(client.request).toHaveBeenCalledWith(SUPPORT_TICKET_ENDPOINTS.tickets, {
        method: "POST",
        body: payload,
      });
    });

    it("submits a QUESTION entity type for the report-question feature", async () => {
      const client = fakeClient();
      const questionId = "11111111-2222-3333-4444-555555555555";
      const payload = {
        category: "CONTENT_COMPLAINT" as const,
        description: "The correct answer appears to be wrong.",
        entityType: "QUESTION" as const,
        entityId: questionId,
      };

      await submitTicket(client, payload);

      expect(client.request).toHaveBeenCalledWith(SUPPORT_TICKET_ENDPOINTS.tickets, {
        method: "POST",
        body: expect.objectContaining({
          entityType: "QUESTION",
          entityId: questionId,
          category: "CONTENT_COMPLAINT",
        }),
      });
    });

    it("submits a ticket without entityType for general reports", async () => {
      const client = fakeClient();
      const payload = {
        category: "BUG" as const,
        description: "The exam page crashes on submit.",
      };

      await submitTicket(client, payload);

      expect(client.request).toHaveBeenCalledWith(SUPPORT_TICKET_ENDPOINTS.tickets, {
        method: "POST",
        body: payload,
      });
    });

    it("submits a ticket with EXAM_SESSION entity type", async () => {
      const client = fakeClient();
      const sessionId = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
      const payload = {
        category: "BUG" as const,
        description: "Session did not start on time.",
        entityType: "EXAM_SESSION" as const,
        entityId: sessionId,
      };

      await submitTicket(client, payload);

      expect(client.request).toHaveBeenCalledWith(SUPPORT_TICKET_ENDPOINTS.tickets, {
        method: "POST",
        body: expect.objectContaining({
          entityType: "EXAM_SESSION",
          entityId: sessionId,
        }),
      });
    });
  });

  describe("listTickets", () => {
    it("fetches tickets without query params when none provided", async () => {
      const client = fakeClient();

      await listTickets(client);

      expect(client.request).toHaveBeenCalledWith(SUPPORT_TICKET_ENDPOINTS.tickets);
    });

    it("appends status and category filters as query params", async () => {
      const client = fakeClient();

      await listTickets(client, { status: "OPEN", category: "CONTENT_COMPLAINT", page: 0, size: 10 });

      expect(client.request).toHaveBeenCalledWith(
        `${SUPPORT_TICKET_ENDPOINTS.tickets}?status=OPEN&category=CONTENT_COMPLAINT&page=0&size=10`,
      );
    });
  });

  describe("getTicket", () => {
    it("fetches a single ticket by publicId", async () => {
      const client = fakeClient();
      const publicId = "ticket-public-id";

      await getTicket(client, publicId);

      expect(client.request).toHaveBeenCalledWith(SUPPORT_TICKET_ENDPOINTS.ticket(publicId));
    });
  });
});

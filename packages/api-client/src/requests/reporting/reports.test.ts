import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../../client/client";
import {
  REPORT_ENDPOINTS,
  getAttemptReport,
  getReportPublicationSummary,
  listMyReports,
  preflightReportPublication,
  publishSessionReports,
} from "./reports";

function fakeClient(): ApiClient & { request: ReturnType<typeof vi.fn> } {
  return {
    request: vi.fn().mockResolvedValue({}),
    upload: vi.fn(),
    download: vi.fn(),
  } as unknown as ApiClient & { request: ReturnType<typeof vi.fn> };
}

describe("report requests", () => {
  it("uses student and attempt report routes", async () => {
    const client = fakeClient();
    await listMyReports(client);
    await getAttemptReport(client, "attempt-id");
    await getReportPublicationSummary(client, "session-id");

    expect(client.request).toHaveBeenNthCalledWith(1, REPORT_ENDPOINTS.mine);
    expect(client.request).toHaveBeenNthCalledWith(2, REPORT_ENDPOINTS.attempt("attempt-id"));
    expect(client.request).toHaveBeenNthCalledWith(
      3,
      REPORT_ENDPOINTS.publicationSummary("session-id"),
    );
  });

  it("preflights and publishes a session through Reporting", async () => {
    const client = fakeClient();
    await preflightReportPublication(client, "session-id");
    await publishSessionReports(client, "session-id");

    expect(client.request).toHaveBeenNthCalledWith(
      1,
      REPORT_ENDPOINTS.publicationPreflight("session-id"),
      {
        method: "POST",
      },
    );
    expect(client.request).toHaveBeenNthCalledWith(
      2,
      REPORT_ENDPOINTS.publishSession("session-id"),
      {
        method: "POST",
      },
    );
  });
});

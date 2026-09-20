import { describe, expect, it, vi } from "vitest";
import { ApiError } from "./apiError";
import { createApiClient } from "./client";
import { getUserFacingApiErrorMessage } from "./errorMessage";

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function captureError(action: () => Promise<unknown>): Promise<ApiError> {
  try {
    await action();
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError);
    return error as ApiError;
  }
  throw new Error("Expected the API request to fail");
}

describe("ApiClient error contract", () => {
  it("extracts a legacy machine code without changing the legacy message", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(
        { success: false, data: null, message: "PLAN_ARCHIVED_NOT_EDITABLE" },
        409,
      ),
    );
    const client = createApiClient({ baseUrl: "https://api.example.test", fetchFn: fetchMock });

    const error = await captureError(() => client.request("/api/v1/plans/1"));

    expect(error.code).toBe("PLAN_ARCHIVED_NOT_EDITABLE");
    expect(error.message).toBe("PLAN_ARCHIVED_NOT_EDITABLE");
    expect(getUserFacingApiErrorMessage(error)).toContain("archived");
    expect(getUserFacingApiErrorMessage(error)).not.toContain("PLAN_ARCHIVED_NOT_EDITABLE");
  });

  it("prefers additive code and approved user message fields", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(
        {
          success: false,
          data: null,
          message: "LEGACY_MESSAGE",
          code: "PLAN_ARCHIVED_NOT_EDITABLE",
          userMessage: "This plan is archived. Create a new plan to continue.",
        },
        409,
      ),
    );
    const client = createApiClient({ baseUrl: "https://api.example.test", fetchFn: fetchMock });

    const error = await captureError(() => client.request("/api/v1/plans/1"));

    expect(error.code).toBe("PLAN_ARCHIVED_NOT_EDITABLE");
    expect(error.userMessage).toBe("This plan is archived. Create a new plan to continue.");
    expect(getUserFacingApiErrorMessage(error)).toBe(
      "This plan is archived. Create a new plan to continue.",
    );
  });

  it("preserves a clear validation message while hiding unknown machine codes", async () => {
    const validationFetch = vi.fn().mockResolvedValue(
      jsonResponse({ success: false, data: null, message: "Name is required" }, 400),
    );
    const validationClient = createApiClient({
      baseUrl: "https://api.example.test",
      fetchFn: validationFetch,
    });
    const validationError = await captureError(() => validationClient.request("/api/v1/plans"));
    expect(getUserFacingApiErrorMessage(validationError)).toBe("Name is required");

    const unknownFetch = vi.fn().mockResolvedValue(
      jsonResponse({ success: false, data: null, message: "NEW_INTERNAL_CODE" }, 409),
    );
    const unknownClient = createApiClient({
      baseUrl: "https://api.example.test",
      fetchFn: unknownFetch,
    });
    const unknownError = await captureError(() => unknownClient.request("/api/v1/plans"));
    const userMessage = getUserFacingApiErrorMessage(unknownError, "We could not save this plan.");

    expect(userMessage).toBe("We could not save this plan.");
    expect(userMessage).not.toContain("NEW_INTERNAL_CODE");
  });

  it("uses safe fallbacks for server, auth, forbidden, and network failures", async () => {
    const serverClient = createApiClient({
      baseUrl: "https://api.example.test",
      fetchFn: vi.fn().mockResolvedValue(
        jsonResponse({ success: false, data: null, message: "INTERNAL_ERROR" }, 500),
      ),
    });
    const serverError = await captureError(() => serverClient.request("/api/v1/plans"));
    expect(getUserFacingApiErrorMessage(serverError)).toContain("try again later");
    expect(getUserFacingApiErrorMessage(serverError)).not.toContain("INTERNAL_ERROR");

    const unauthorizedClient = createApiClient({
      baseUrl: "https://api.example.test",
      fetchFn: vi.fn().mockResolvedValue(
        jsonResponse({ success: false, data: null, message: "INVALID_LOGIN" }, 401),
      ),
    });
    const unauthorizedError = await captureError(() => unauthorizedClient.request("/login"));
    expect(getUserFacingApiErrorMessage(unauthorizedError)).toBe(
      "The username or password is incorrect.",
    );

    const forbiddenClient = createApiClient({
      baseUrl: "https://api.example.test",
      fetchFn: vi.fn().mockResolvedValue(
        jsonResponse({ success: false, data: null, message: "ACCESS_DENIED" }, 403),
      ),
    });
    const forbiddenError = await captureError(() => forbiddenClient.request("/api/v1/plans"));
    expect(getUserFacingApiErrorMessage(forbiddenError)).toContain("permission");

    const networkClient = createApiClient({
      baseUrl: "https://api.example.test",
      fetchFn: vi.fn().mockRejectedValue(new TypeError("fetch failed")),
    });
    const networkError = await captureError(() => networkClient.request("/api/v1/plans"));
    expect(getUserFacingApiErrorMessage(networkError)).toContain("connect");
    expect(getUserFacingApiErrorMessage(new Error("raw internal error"))).not.toContain(
      "raw internal error",
    );
  });
});

describe("ApiClient binary multipart uploads", () => {
  it("returns the binary response and preserves multipart request handling", async () => {
    const fetchMock = vi.fn();
    fetchMock.mockResolvedValue(
      new Response(new Blob(["xlsx-content"]), {
        status: 200,
        headers: { "Content-Disposition": 'attachment; filename="students.xlsx"' },
      }),
    );
    const client = createApiClient({
      baseUrl: "https://api.example.test",
      fetchFn: fetchMock as typeof fetch,
    });
    const formData = new FormData();
    formData.append("file", new Blob(["input"]), "students.xlsx");

    const result = await client.uploadDownload("/api/v1/students/import", formData);

    expect(result.filename).toBe("students.xlsx");
    expect(await result.blob.text()).toBe("xlsx-content");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/api/v1/students/import",
      expect.objectContaining({ method: "POST", body: formData }),
    );
    const requestInit = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(new Headers(requestInit.headers).has("Content-Type")).toBe(false);
  });
});

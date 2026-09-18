import { describe, expect, it, vi } from "vitest";
import { createApiClient } from "./client";

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

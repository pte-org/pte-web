import { describe, expect, it, vi } from "vitest";
import { createApiClient } from "../../client/client";
import { activatePlan, archivePlan, deletePlan, updatePlan } from "./plans";
import { deleteQuestion } from "../question";

describe("draft deletion contract", () => {
  it.each([
    ["plan", deletePlan, "/api/v1/plans/draft-id"],
    ["question", deleteQuestion, "/api/v1/questions/draft-id"],
  ] as const)("%s sends DELETE and accepts an empty 204", async (_name, remove, path) => {
    const fetchFn = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    const client = createApiClient({ baseUrl: "https://test.invalid", fetchFn });
    await expect(remove(client, "draft-id")).resolves.toBeUndefined();
    expect(fetchFn).toHaveBeenCalledWith("https://test.invalid" + path, expect.objectContaining({ method: "DELETE" }));
  });

  it("retains the archive POST contract", async () => {
    const fetchFn = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, data: { status: "ARCHIVED" } }), { status: 200 }));
    const client = createApiClient({ baseUrl: "https://test.invalid", fetchFn });
    await expect(archivePlan(client, "plan-id", { expectedVersion: 3 })).resolves.toEqual({ status: "ARCHIVED" });
    expect(fetchFn).toHaveBeenCalledWith("https://test.invalid/api/v1/plans/plan-id/archive", expect.objectContaining({ method: "POST" }));
    expect(fetchFn.mock.calls[0][1]).toMatchObject({ body: JSON.stringify({ expectedVersion: 3 }) });
  });

  it("sends the captured version for update and activation", async () => {
    const responses = [
      new Response(JSON.stringify({ success: true, data: { status: "DRAFT", version: 4 } }), { status: 200 }),
      new Response(JSON.stringify({ success: true, data: { status: "ACTIVE", version: 5 } }), { status: 200 }),
    ];
    const fetchFn = vi.fn().mockImplementation(() => Promise.resolve(responses.shift()));
    const client = createApiClient({ baseUrl: "https://test.invalid", fetchFn });
    await updatePlan(client, "plan-id", {
      name: "Plan",
      type: "EXAM_PACKAGE",
      price: "100000.00",
      currency: "VND",
      durationDays: 30,
      maxStudentsPerSession: 50,
      extraStudentSlots: null,
      expectedVersion: 4,
    });
    await activatePlan(client, "plan-id", { expectedVersion: 4 });
    expect(fetchFn.mock.calls[0][1]).toMatchObject({
      method: "PUT",
      body: expect.stringContaining('"expectedVersion":4'),
    });
    expect(fetchFn.mock.calls[1][1]).toMatchObject({
      method: "POST",
      body: JSON.stringify({ expectedVersion: 4 }),
    });
  });

  it("surfaces server conflict instead of pretending deletion succeeded", async () => {
    const fetchFn = vi.fn().mockResolvedValue(new Response(JSON.stringify({ code: "PLAN_HAS_REFERENCES", userMessage: "History is protected." }), { status: 409 }));
    const client = createApiClient({ baseUrl: "https://test.invalid", fetchFn });
    await expect(deletePlan(client, "draft-id")).rejects.toMatchObject({ status: 409, code: "PLAN_HAS_REFERENCES" });
  });
});

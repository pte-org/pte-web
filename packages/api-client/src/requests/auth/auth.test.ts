import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../../client/client";
import { AUTH_ENDPOINTS, login, loginAdmin, loginHost, loginStudent } from "./index";

/**
 * The login key moved from email to username in Phase 1 of the
 * commercialization work. Sending `{ email, password }` now fails the
 * backend's `@NotBlank` on `username` with a 400 — and no type error, since
 * both shapes are just strings. These tests are the thing that keeps the
 * wire payload honest.
 */

function fakeClient(): ApiClient & { request: ReturnType<typeof vi.fn> } {
  const request = vi.fn().mockResolvedValue({
    accessToken: "a",
    refreshToken: "r",
    tokenType: "Bearer",
    expiresInSeconds: 900,
  });
  return {
    request,
    upload: vi.fn(),
    download: vi.fn(),
  } as unknown as ApiClient & { request: ReturnType<typeof vi.fn> };
}

describe("auth requests", () => {
  it("posts username, never email, to the login endpoint", async () => {
    const client = fakeClient();

    await login(client, { username: "admin@test.local", password: "pw" });

    expect(client.request).toHaveBeenCalledWith(AUTH_ENDPOINTS.login, {
      method: "POST",
      body: { username: "admin@test.local", password: "pw" },
    });
    const [, options] = client.request.mock.calls[0];
    expect(options.body).not.toHaveProperty("email");
  });

  it("passes a student username straight through without email mapping", async () => {
    const client = fakeClient();

    // `{tenant.code}.{random}` — not an email address at all. The previous
    // implementation mapped this onto an `email` field, which the backend
    // never accepted.
    await loginStudent(client, { username: "acme-school.k7m2p9qr", password: "pw" });

    const [, options] = client.request.mock.calls[0];
    expect(options.body).toEqual({ username: "acme-school.k7m2p9qr", password: "pw" });
  });

  it("routes admin and host logins through the same single endpoint", async () => {
    const adminClient = fakeClient();
    const hostClient = fakeClient();

    await loginAdmin(adminClient, { username: "admin@test.local", password: "pw" });
    await loginHost(hostClient, { username: "host@school.edu.vn", password: "pw" });

    // One backend AuthController, one route — there is no per-role login
    // endpoint, and these two wrappers must not drift apart.
    expect(adminClient.request.mock.calls[0][0]).toBe(AUTH_ENDPOINTS.login);
    expect(hostClient.request.mock.calls[0][0]).toBe(AUTH_ENDPOINTS.login);
  });

  it("targets the flat /api/auth paths", () => {
    expect(AUTH_ENDPOINTS.login).toBe("/api/auth/login");
    expect(AUTH_ENDPOINTS.refresh).toBe("/api/auth/refresh");
    expect(AUTH_ENDPOINTS.logout).toBe("/api/auth/logout");
  });
});

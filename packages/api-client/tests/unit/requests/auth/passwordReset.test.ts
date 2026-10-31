import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../../../../src/client/client";
import {
  AUTH_ENDPOINTS,
  changePassword,
  confirmPasswordReset,
  requestPasswordReset,
} from "../../../../src/requests/auth";

function fakeClient(): ApiClient & { request: ReturnType<typeof vi.fn> } {
  return {
    request: vi.fn().mockResolvedValue(null),
    upload: vi.fn(),
    uploadDownload: vi.fn(),
    download: vi.fn(),
  } as unknown as ApiClient & { request: ReturnType<typeof vi.fn> };
}

describe("password reset request contract", () => {
  it("asks for a reset link by e-mail", async () => {
    const client = fakeClient();

    await requestPasswordReset(client, { email: "host@x.vn" });

    expect(AUTH_ENDPOINTS.passwordResetRequest).toBe("/api/v1/auth/password-reset/request");
    expect(client.request).toHaveBeenCalledWith(AUTH_ENDPOINTS.passwordResetRequest, {
      method: "POST",
      body: { email: "host@x.vn" },
    });
  });

  it("spends the link with the new password", async () => {
    const client = fakeClient();

    await confirmPasswordReset(client, { token: "raw", newPassword: "NewPassword456" });

    expect(AUTH_ENDPOINTS.passwordResetConfirm).toBe("/api/v1/auth/password-reset/confirm");
    expect(client.request).toHaveBeenCalledWith(AUTH_ENDPOINTS.passwordResetConfirm, {
      method: "POST",
      body: { token: "raw", newPassword: "NewPassword456" },
    });
  });

  it("sends the caller's refresh token with a password change so the other sessions are signed out", async () => {
    const client = fakeClient();

    await changePassword(client, {
      currentPassword: "Old",
      newPassword: "NewPassword456",
      refreshToken: "refresh-1",
    });

    expect(client.request).toHaveBeenCalledWith(AUTH_ENDPOINTS.changePassword, {
      method: "POST",
      body: { currentPassword: "Old", newPassword: "NewPassword456", refreshToken: "refresh-1" },
    });
  });
});

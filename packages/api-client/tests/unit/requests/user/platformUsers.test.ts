import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../../../../src/client/client";
import {
  createPlatformUser,
  archivePlatformUser,
  listPlatformUsers,
  PLATFORM_USER_ENDPOINTS,
  resetPlatformUserPassword,
  restorePlatformUser,
  suspendPlatformUser,
  updatePlatformUserProfile,
  updatePlatformUserRoles,
} from "../../../../src/requests/user/index";

function fakeClient(): ApiClient & { request: ReturnType<typeof vi.fn> } {
  return {
    request: vi.fn().mockResolvedValue({}),
    upload: vi.fn(),
    download: vi.fn(),
  } as unknown as ApiClient & { request: ReturnType<typeof vi.fn> };
}

describe("platform user request contract", () => {
  it("lists bounded platform users with page parameters", async () => {
    const client = fakeClient();
    await listPlatformUsers(client, { page: 2, size: 50 });
    expect(client.request).toHaveBeenCalledWith(`${PLATFORM_USER_ENDPOINTS.users}?page=2&size=50`);
  });

  it("sends search, role, and status filters to the platform-user endpoint", async () => {
    const client = fakeClient();
    await listPlatformUsers(client, {
      page: 0,
      size: 100,
      search: "  Academic staff  ",
      role: "ACADEMIC_STAFF",
      status: "SUSPENDED",
    });
    expect(client.request).toHaveBeenCalledWith(
      `${PLATFORM_USER_ENDPOINTS.users}?page=0&size=100&search=Academic+staff&role=ACADEMIC_STAFF&status=SUSPENDED`,
    );
  });

  it("includes archived rows only when explicitly requested", async () => {
    const client = fakeClient();
    await listPlatformUsers(client, { page: 0, size: 20, includeArchived: true });
    expect(client.request).toHaveBeenCalledWith(
      `${PLATFORM_USER_ENDPOINTS.users}?page=0&size=20&includeArchived=true`,
    );
  });

  it("creates a tenantless platform user without a client-managed password", async () => {
    const client = fakeClient();
    await createPlatformUser(client, {
      email: "manager@example.test",
      fullName: "Platform Manager",
      roles: ["PLATFORM_MANAGER"],
    });
    expect(client.request).toHaveBeenCalledWith(PLATFORM_USER_ENDPOINTS.users, {
      method: "POST",
      body: {
        email: "manager@example.test",
        fullName: "Platform Manager",
        roles: ["PLATFORM_MANAGER"],
      },
    });
  });

  it("uses PATCH for role updates and for the status action of a suspension", async () => {
    const client = fakeClient();
    await updatePlatformUserRoles(client, "user/1", { roles: ["ACADEMIC_STAFF"] });
    await suspendPlatformUser(client, "user/1");
    expect(client.request).toHaveBeenNthCalledWith(1, PLATFORM_USER_ENDPOINTS.roles("user/1"), {
      method: "PATCH",
      body: { roles: ["ACADEMIC_STAFF"] },
    });
    expect(client.request).toHaveBeenNthCalledWith(2, PLATFORM_USER_ENDPOINTS.status("user/1"), {
      method: "PATCH",
      body: { action: "SUSPEND" },
    });
  });

  it("uses the dedicated profile, password, archive, and restore contracts", async () => {
    const client = fakeClient();
    await updatePlatformUserProfile(client, "user/1", {
      fullName: "Updated User",
      phone: "0909",
      dateOfBirth: "1990-01-02",
    });
    await resetPlatformUserPassword(client, "user/1");
    await archivePlatformUser(client, "user/1");
    await restorePlatformUser(client, "user/1");

    expect(client.request).toHaveBeenNthCalledWith(1, PLATFORM_USER_ENDPOINTS.user("user/1"), {
      method: "PATCH",
      body: { fullName: "Updated User", phone: "0909", dateOfBirth: "1990-01-02" },
    });
    expect(client.request).toHaveBeenNthCalledWith(
      2,
      PLATFORM_USER_ENDPOINTS.resetPassword("user/1"),
      { method: "POST" },
    );
    expect(client.request).toHaveBeenNthCalledWith(3, PLATFORM_USER_ENDPOINTS.status("user/1"), {
      method: "PATCH",
      body: { action: "ARCHIVE" },
    });
    expect(client.request).toHaveBeenNthCalledWith(4, PLATFORM_USER_ENDPOINTS.status("user/1"), {
      method: "PATCH",
      body: { action: "RESTORE" },
    });
  });
});

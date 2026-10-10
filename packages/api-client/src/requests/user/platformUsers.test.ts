import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../../client/client";
import {
  createPlatformUser,
  listPlatformUsers,
  PLATFORM_USER_ENDPOINTS,
  suspendPlatformUser,
  updatePlatformUserRoles,
} from "./index";

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

  it("creates only the tenantless platform-user payload", async () => {
    const client = fakeClient();
    await createPlatformUser(client, {
      email: "manager@example.test",
      fullName: "Platform Manager",
      password: "password8",
      roles: ["PLATFORM_MANAGER"],
    });
    expect(client.request).toHaveBeenCalledWith(PLATFORM_USER_ENDPOINTS.users, {
      method: "POST",
      body: {
        email: "manager@example.test",
        fullName: "Platform Manager",
        password: "password8",
        roles: ["PLATFORM_MANAGER"],
      },
    });
  });

  it("uses PATCH for role updates and POST for suspension", async () => {
    const client = fakeClient();
    await updatePlatformUserRoles(client, "user/1", { roles: ["ACADEMIC_STAFF"] });
    await suspendPlatformUser(client, "user/1");
    expect(client.request).toHaveBeenNthCalledWith(1, PLATFORM_USER_ENDPOINTS.roles("user/1"), {
      method: "PATCH",
      body: { roles: ["ACADEMIC_STAFF"] },
    });
    expect(client.request).toHaveBeenNthCalledWith(2, PLATFORM_USER_ENDPOINTS.suspend("user/1"), {
      method: "POST",
    });
  });
});

import { describe, expect, it } from "vitest";
import { resolveWorkspace } from "../../../../features/auth/resolveWorkspace";
import { AUTH_ROUTES } from "../../../../features/auth/constants";

describe("resolveWorkspace", () => {
  it("gives STUDENT no workspace, even next to another role", () => {
    const studentOnly = resolveWorkspace(["STUDENT"]);
    expect(studentOnly.defaultRoute).toBe(AUTH_ROUTES.login);
    expect(studentOnly.allowedWorkspaces).toHaveLength(0);

    const withHost = resolveWorkspace(["HOST_ADMIN", "STUDENT"]);
    expect(withHost.defaultRoute).toBe(AUTH_ROUTES.hostDashboard);
    expect(withHost.allowedWorkspaces.map((w) => w.id)).toEqual(["host"]);
  });

  it("routes single-role HOST_ADMIN to hostDashboard", () => {
    const result = resolveWorkspace(["HOST_ADMIN"]);
    expect(result.defaultRoute).toBe(AUTH_ROUTES.hostDashboard);
    expect(result.allowedWorkspaces.map((w) => w.id)).toEqual(["host"]);
  });

  it("routes single-role EXAMINER to examinerWork", () => {
    const result = resolveWorkspace(["EXAMINER"]);
    expect(result.defaultRoute).toBe(AUTH_ROUTES.examinerWork);
    expect(result.allowedWorkspaces.map((w) => w.id)).toEqual(["examiner"]);
  });

  it("routes EXAMINER + HOST_ADMIN to hostDashboard", () => {
    const result = resolveWorkspace(["EXAMINER", "HOST_ADMIN"]);
    expect(result.defaultRoute).toBe(AUTH_ROUTES.hostDashboard);
    expect(result.allowedWorkspaces.map((w) => w.id)).toEqual(["host", "examiner"]);
  });

  it("routes PROCTOR-only to proctorSessions", () => {
    const result = resolveWorkspace(["PROCTOR"]);
    expect(result.defaultRoute).toBe(AUTH_ROUTES.proctorSessions);
    expect(result.allowedWorkspaces).toHaveLength(1);
    expect(result.allowedWorkspaces[0]?.href).toBe(AUTH_ROUTES.proctorSessions);
  });

  it("routes multi-role PROCTOR + HOST_ADMIN to hostDashboard with switcher option", () => {
    const result = resolveWorkspace(["PROCTOR", "HOST_ADMIN"]);
    expect(result.defaultRoute).toBe(AUTH_ROUTES.hostDashboard);
    expect(result.allowedWorkspaces.map((w) => w.id)).toContain("proctor");
    expect(result.allowedWorkspaces.map((w) => w.id)).toContain("host");
  });

  it("routes empty roles to login route", () => {
    const result = resolveWorkspace([]);
    expect(result.defaultRoute).toBe(AUTH_ROUTES.login);
    expect(result.allowedWorkspaces).toHaveLength(0);
  });
});

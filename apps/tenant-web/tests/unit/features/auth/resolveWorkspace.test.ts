import { describe, expect, it } from "vitest";
import { resolveWorkspace } from "../../../../features/auth/resolveWorkspace";
import { AUTH_ROUTES } from "../../../../features/auth/constants";

describe("resolveWorkspace", () => {
  it("preserves exact legacy precedence for HOST_ADMIN + STUDENT multi-role users (R5 requirement)", () => {
    const result = resolveWorkspace(["HOST_ADMIN", "STUDENT"], false);
    // Legacy LoginView sent HOST_ADMIN + STUDENT to studentResults
    expect(result.defaultRoute).toBe(AUTH_ROUTES.studentResults);
    expect(result.allowedWorkspaces.map((w) => w.id)).toEqual(["host", "student"]);
  });

  it("routes single-role HOST_ADMIN to hostDashboard", () => {
    const result = resolveWorkspace(["HOST_ADMIN"], false);
    expect(result.defaultRoute).toBe(AUTH_ROUTES.hostDashboard);
    expect(result.allowedWorkspaces.map((w) => w.id)).toEqual(["host"]);
  });

  it("routes single-role EXAMINER to examinerWork", () => {
    const result = resolveWorkspace(["EXAMINER"], false);
    expect(result.defaultRoute).toBe(AUTH_ROUTES.examinerWork);
    expect(result.allowedWorkspaces.map((w) => w.id)).toEqual(["examiner"]);
  });

  it("routes EXAMINER + HOST_ADMIN to hostDashboard", () => {
    const result = resolveWorkspace(["EXAMINER", "HOST_ADMIN"], false);
    expect(result.defaultRoute).toBe(AUTH_ROUTES.hostDashboard);
    expect(result.allowedWorkspaces.map((w) => w.id)).toEqual(["host", "examiner"]);
  });

  it("routes single-role STUDENT to studentResults", () => {
    const result = resolveWorkspace(["STUDENT"], false);
    expect(result.defaultRoute).toBe(AUTH_ROUTES.studentResults);
    expect(result.allowedWorkspaces.map((w) => w.id)).toEqual(["student"]);
  });

  it("routes PROCTOR-only to proctorSessions when feature flag is enabled", () => {
    const result = resolveWorkspace(["PROCTOR"], true);
    expect(result.defaultRoute).toBe(AUTH_ROUTES.proctorSessions);
    expect(result.allowedWorkspaces).toHaveLength(1);
    expect(result.allowedWorkspaces[0]?.href).toBe(AUTH_ROUTES.proctorSessions);
  });

  it("routes PROCTOR-only to proctorUnavailable when feature flag is disabled", () => {
    const result = resolveWorkspace(["PROCTOR"], false);
    expect(result.defaultRoute).toBe(AUTH_ROUTES.proctorUnavailable);
    expect(result.allowedWorkspaces).toHaveLength(1);
    expect(result.allowedWorkspaces[0]?.href).toBe(AUTH_ROUTES.proctorUnavailable);
  });

  it("routes multi-role PROCTOR + HOST_ADMIN to hostDashboard with switcher option", () => {
    const result = resolveWorkspace(["PROCTOR", "HOST_ADMIN"], true);
    expect(result.defaultRoute).toBe(AUTH_ROUTES.hostDashboard);
    expect(result.allowedWorkspaces.map((w) => w.id)).toContain("proctor");
    expect(result.allowedWorkspaces.map((w) => w.id)).toContain("host");
  });

  it("routes empty roles to login route", () => {
    const result = resolveWorkspace([], false);
    expect(result.defaultRoute).toBe(AUTH_ROUTES.login);
    expect(result.allowedWorkspaces).toHaveLength(0);
  });
});

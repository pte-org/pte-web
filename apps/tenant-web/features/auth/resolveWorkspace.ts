import type { SessionRole } from "@pte/ui";
import { AUTH_ROUTES } from "./constants";

export interface WorkspaceOption {
  id: "host" | "examiner" | "proctor";
  labelKey: string;
  defaultLabel: string;
  href: string;
}

export interface WorkspaceResolution {
  defaultRoute: string;
  allowedWorkspaces: WorkspaceOption[];
}

/** Resolves default navigation destination and allowed workspaces based on user roles. */
export function resolveWorkspace(
  roles: readonly SessionRole[] | readonly string[],
): WorkspaceResolution {
  const roleSet = new Set(roles);
  const allowedWorkspaces: WorkspaceOption[] = [];

  const hasHost = roleSet.has("HOST_ADMIN");
  const hasExaminer = roleSet.has("EXAMINER");
  const hasProctor = roleSet.has("PROCTOR");

  if (hasHost) {
    allowedWorkspaces.push({
      id: "host",
      labelKey: "workspace.host",
      defaultLabel: "Host Admin",
      href: AUTH_ROUTES.hostDashboard,
    });
  }

  if (hasExaminer) {
    allowedWorkspaces.push({
      id: "examiner",
      labelKey: "workspace.examiner",
      defaultLabel: "Examiner",
      href: AUTH_ROUTES.examinerWork,
    });
  }

  if (hasProctor) {
    allowedWorkspaces.push({
      id: "proctor",
      labelKey: "workspace.proctor",
      defaultLabel: "Proctor",
      href: AUTH_ROUTES.proctorSessions,
    });
  }

  let defaultRoute: string;
  // EXAMINER (without HOST_ADMIN) -> examinerWork, HOST_ADMIN -> hostDashboard. STUDENT has no web workspace.
  if (hasExaminer && !hasHost) {
    defaultRoute = AUTH_ROUTES.examinerWork;
  } else if (hasHost) {
    defaultRoute = AUTH_ROUTES.hostDashboard;
  } else if (hasProctor) {
    defaultRoute = AUTH_ROUTES.proctorSessions;
  } else {
    defaultRoute = AUTH_ROUTES.login;
  }

  return {
    defaultRoute,
    allowedWorkspaces,
  };
}

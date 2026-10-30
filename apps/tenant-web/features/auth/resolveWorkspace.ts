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

export function isProctorUiEnabled(): boolean {
  return process.env.NEXT_PUBLIC_PROCTOR_UI_ENABLED === "true";
}

/**
 * Resolves default navigation destination and allowed workspaces based on user roles and
 * the proctor feature flag. Preserves exact legacy routing when PROCTOR role is absent.
 */
export function resolveWorkspace(
  roles: readonly SessionRole[] | readonly string[],
  proctorUiEnabled: boolean = isProctorUiEnabled(),
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
      href: proctorUiEnabled ? AUTH_ROUTES.proctorSessions : AUTH_ROUTES.proctorUnavailable,
    });
  }

  let defaultRoute: string;
  // EXAMINER (without HOST_ADMIN) -> examinerWork, HOST_ADMIN -> hostDashboard. STUDENT has no web workspace.
  if (hasExaminer && !hasHost) {
    defaultRoute = AUTH_ROUTES.examinerWork;
  } else if (hasHost) {
    defaultRoute = AUTH_ROUTES.hostDashboard;
  } else if (hasProctor) {
    defaultRoute = proctorUiEnabled ? AUTH_ROUTES.proctorSessions : AUTH_ROUTES.proctorUnavailable;
  } else {
    defaultRoute = AUTH_ROUTES.login;
  }

  return {
    defaultRoute,
    allowedWorkspaces,
  };
}

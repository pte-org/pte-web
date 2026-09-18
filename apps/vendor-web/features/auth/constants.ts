import type { SessionRole } from "@pte/ui";

export const CURRENT_USER_QUERY_KEY = ["currentUser"] as const;

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export const VENDOR_ROLES = ["admin", "host"] as const;

/**
 * Real backend roles allowed into `/admin/*` vs `/host` respectively —
 * shared between `DashboardChrome`'s per-call-site `allowedRoles` and
 * `LoginView.tsx`'s post-login redirect decision, so the two can never
 * silently disagree about which roles belong on which side.
 */
export const ADMIN_ROLES: SessionRole[] = ["PLATFORM_ADMIN", "PLATFORM_AUTHOR"];
export const HOST_ROLES: SessionRole[] = ["HOST_ADMIN"];

export const AUTH_ROUTES = {
  login: "/login",
  adminDashboard: "/admin",
  hostDashboard: "/host",
} as const;

export const AUTH_TEXT = {
  BRAND: "PTE Hub",
  WELCOME_TITLE: "Welcome Back",
  WELCOME_SUBTITLE: "Please enter your institutional credentials to continue.",
  PANEL_HEADING: "Ready to Manage?",
  PANEL_TEXT:
    "Sign in to access your institutional dashboard, manage exams, and track your results.",
  // Username, not email: the backend login key moved off email in Phase 1
  // of the commercialization work. A PLATFORM_ADMIN's username IS their
  // email (the backend sets username = email for every non-STUDENT role),
  // which is why the placeholder still shows one — but the field carries
  // username semantics and must not be email-typed or email-validated.
  USERNAME_LABEL: "Username",
  USERNAME_PLACEHOLDER: "admin@institution.edu",
  PASSWORD_LABEL: "Password",
  FORGOT: "Forgot password?",
  LOGIN_BUTTON: "Login",
  LOGGING_IN: "Signing in...",
  SHOW_PASSWORD: "Show password",
  HIDE_PASSWORD: "Hide password",
  EMPTY_FIELDS: "Please enter username and password.",
  INVALID_CREDENTIALS: "Username or password is incorrect.",
  GENERIC_ERROR: "Login failed. Please try again.",
} as const;

import type { SessionRole } from "@pte/ui";

export const CURRENT_USER_QUERY_KEY = ["currentUser"] as const;

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

/**
 * Real backend roles allowed into `/host/*` — mirrors vendor-web's
 * `HOST_ROLES`. HOST_ADMIN can already provision HOST_AUTHOR via iam's
 * `POST /users`, so excluding it here would lock out an account the
 * backend already allows, not a "not yet supported" gap.
 */
export const HOST_ROLES: SessionRole[] = ["HOST_ADMIN", "HOST_AUTHOR"];

export const AUTH_ROUTES = {
  login: "/login",
  register: "/register",
  applicationStatus: "/application-status",
  hostDashboard: "/host/dashboard",
} as const;

export const AUTH_TEXT = {
  BRAND: "PTE Hub",
  WELCOME_TITLE: "Welcome Back",
  WELCOME_SUBTITLE: "Sign in to manage learners and exams for your organization.",
  PANEL_HEADING: "Ready to manage?",
  PANEL_TEXT: "Sign in to import learners, assign exams, and monitor results.",
  // Username, not email: the backend login key moved off email in Phase 1
  // of the commercialization work. A HOST_ADMIN's username IS their email
  // (the backend sets username = email for every non-STUDENT role), which
  // is why the placeholder still shows one — but a STUDENT signing in uses
  // `{tenant.code}.{random}`, so the field must not be email-typed or
  // email-validated.
  USERNAME_LABEL: "Username",
  USERNAME_PLACEHOLDER: "host@school.edu.vn",
  USERNAME_HINT: "Use your email address, or the account issued by your organization.",
  PASSWORD_LABEL: "Password",
  FORGOT: "Forgot password?",
  LOGIN_BUTTON: "Login",
  LOGGING_IN: "Signing in...",
  OR_CONTINUE: "Or continue with",
  SSO_GOOGLE: "Google",
  SSO_MICROSOFT: "Microsoft",
  SHOW_PASSWORD: "Show password",
  HIDE_PASSWORD: "Hide password",
  EMPTY_FIELDS: "Please enter username and password.",
  INVALID_CREDENTIALS: "Username or password is incorrect.",
  GENERIC_ERROR: "Login failed. Please try again.",
} as const;

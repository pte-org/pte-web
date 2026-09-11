import type { SessionRole } from "@pte/ui";

export const CURRENT_USER_QUERY_KEY = ["currentUser"] as const;

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

/**
 * Real backend roles allowed into `/host/*` — mirrors vendor-web's
 * `HOST_ROLES`. HOST_ADMIN can already provision HOST_AUTHOR via iam's
 * `POST /users`, so excluding it here would lock out an account the
 * backend already allows, not a "not yet supported" gap.
 */
export const HOST_ROLES: SessionRole[] = ["HOST_ADMIN", "HOST_AUTHOR"];

export const AUTH_ROUTES = {
  login: "/login",
  hostDashboard: "/host/dashboard",
} as const;

export const AUTH_TEXT = {
  BRAND: "PTE Hub",
  WELCOME_TITLE: "Welcome Back",
  WELCOME_SUBTITLE:
    "Sign in to manage learners and exams for your organization.",
  PANEL_HEADING: "Ready to manage?",
  PANEL_TEXT:
    "Sign in to import learners, assign exams, and monitor results.",
  EMAIL_LABEL: "Email address",
  EMAIL_PLACEHOLDER: "host@school.edu.vn",
  PASSWORD_LABEL: "Password",
  FORGOT: "Forgot password?",
  LOGIN_BUTTON: "Login",
  LOGGING_IN: "Signing in...",
  OR_CONTINUE: "Or continue with",
  SSO_GOOGLE: "Google",
  SSO_MICROSOFT: "Microsoft",
  SHOW_PASSWORD: "Show password",
  HIDE_PASSWORD: "Hide password",
  EMPTY_FIELDS: "Please enter email and password.",
  INVALID_CREDENTIALS: "Email or password is incorrect.",
  GENERIC_ERROR: "Login failed. Please try again.",
} as const;

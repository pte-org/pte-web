import type { SessionRole } from "@aptis/ui";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export const VENDOR_ROLES = ["admin", "host"] as const;

/**
 * Real backend roles allowed into `/admin/*` vs `/host` respectively —
 * shared between `DashboardChrome`'s per-call-site `allowedRoles` and
 * `LoginView.tsx`'s post-login redirect decision, so the two can never
 * silently disagree about which roles belong on which side.
 */
export const ADMIN_ROLES: SessionRole[] = ["PLATFORM_ADMIN"];
export const HOST_ROLES: SessionRole[] = ["HOST_ADMIN", "HOST_AUTHOR"];

export const AUTH_ROUTES = {
  login: "/login",
  adminDashboard: "/admin",
  hostDashboard: "/host",
} as const;

export const AUTH_TEXT = {
  BRAND: "Aptis Hub",
  WELCOME_TITLE: "Welcome Back",
  WELCOME_SUBTITLE: "Please enter your institutional credentials to continue.",
  PANEL_HEADING: "Ready to Manage?",
  PANEL_TEXT:
    "Sign in to access your institutional dashboard, manage exams, and track your results.",
  EMAIL_LABEL: "Email address",
  EMAIL_PLACEHOLDER: "admin@institution.edu",
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

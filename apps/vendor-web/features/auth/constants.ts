import type { ForgotPasswordFormText, ResetPasswordFormText, SessionRole } from "@pte/ui";
import {
  ACADEMIC_AUTHOR_ROLES,
  PLATFORM_ADMIN_ROLES,
  PLATFORM_OPERATION_ROLES,
} from "./permissions";

export const CURRENT_USER_QUERY_KEY = ["currentUser"] as const;

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export const VENDOR_ROLES = ["admin", "host"] as const;

/**
 * Real backend roles allowed into `/admin/*` vs `/host` respectively —
 * shared between `DashboardChrome`'s per-call-site `allowedRoles` and
 * `LoginView.tsx`'s post-login redirect decision, so the two can never
 * silently disagree about which roles belong on which side.
 */
export const ADMIN_ROLES: SessionRole[] = [
  ...PLATFORM_OPERATION_ROLES,
  "ACADEMIC_MANAGER",
  "ACADEMIC_STAFF",
];
export const PLATFORM_ADMIN_ONLY: SessionRole[] = PLATFORM_ADMIN_ROLES;
export const PLATFORM_OPERATIONS_ROLES: SessionRole[] = PLATFORM_OPERATION_ROLES;
export const ACADEMIC_ROLES: SessionRole[] = ACADEMIC_AUTHOR_ROLES;
export const HOST_ROLES: SessionRole[] = ["HOST_ADMIN"];

export const AUTH_ROUTES = {
  login: "/login",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  changePassword: "/change-password",
  adminDashboard: "/admin",
  hostDashboard: "/host",
} as const;

export const PASSWORD_CHANGE_TEXT = {
  TITLE: "Change your password",
  SUBTITLE: "Your temporary password must be replaced before you can open a workspace.",
  CURRENT_LABEL: "Current password",
  NEW_LABEL: "New password",
  CONFIRM_LABEL: "Confirm new password",
  REQUIRED: "Enter all password fields.",
  MISMATCH: "The new passwords do not match.",
  TOO_SHORT: "Use at least 8 characters for the new password.",
  SUBMIT: "Change password",
  SUBMITTING: "Changing password...",
  FAILED: "Password could not be changed. Check the current password and try again.",
  SUCCESS: "Password changed. You are now signed in.",
} as const;

export const AUTH_TEXT = {
  BRAND: "PTE Prep",
  PORTAL_ADMIN_LABEL: "Admin portal",
  PORTAL_HOST_LABEL: "Organization portal",
  FOOTER_LABEL: "Legal and support",
  FOOTER_COPYRIGHT: "© {year} PTE Prep",
  FOOTER_TERMS: "Terms",
  FOOTER_PRIVACY: "Privacy",
  FOOTER_SUPPORT: "Contact support",
  WELCOME_TITLE: "Welcome Back",
  WELCOME_SUBTITLE: "Please enter your institutional credentials to continue.",
  // Username, not email: the backend login key moved off email in Phase 1
  // of the commercialization work. A PLATFORM_ADMIN's username IS their
  // email (the backend sets username = email for every non-STUDENT role),
  // which is why the placeholder still shows one — but the field carries
  // username semantics and must not be email-typed or email-validated.
  USERNAME_LABEL: "Email",
  USERNAME_PLACEHOLDER: "admin@institution.edu",
  ORGANIZATION_LABEL: "Organization",
  ORGANIZATION_PLACEHOLDER: "Select your organization",
  ORGANIZATION_REQUIRED: "Please select your organization.",
  PASSWORD_LABEL: "Password",
  PASSWORD_PLACEHOLDER: "Enter your password",
  FORGOT: "Forgot password?",
  LOGIN_BUTTON: "Login",
  LOGGING_IN: "Signing in...",
  SHOW_PASSWORD: "Show password",
  HIDE_PASSWORD: "Hide password",
  USERNAME_REQUIRED: "Please enter your email.",
  USERNAME_INVALID_EMAIL: "Please enter a valid email address.",
  PASSWORD_REQUIRED: "Please enter your password.",
  INVALID_CREDENTIALS: "Username or password is incorrect.",
  GENERIC_ERROR: "Login failed. Please try again.",
} as const;

export const FORGOT_PASSWORD_TEXT: ForgotPasswordFormText = {
  title: "Forgot your password?",
  subtitle: "Enter the email of your account and we will send you a link to choose a new password.",
  emailLabel: "Email",
  submit: "Send reset link",
  submitting: "Sending...",
  required: "Enter your email address.",
  sentTitle: "Check your inbox",
  sentMessage:
    "If that email belongs to an account, a reset link is on its way. The link works once and expires in 30 minutes.",
};

export const RESET_PASSWORD_TEXT: ResetPasswordFormText & { failed: string } = {
  title: "Choose a new password",
  subtitle: "Pick a password you have not used here before. The link works once.",
  newLabel: "New password",
  confirmLabel: "Confirm new password",
  submit: "Reset password",
  submitting: "Saving...",
  required: "Enter both password fields.",
  tooShort: "Use at least 8 characters for the new password.",
  mismatch: "The new passwords do not match.",
  invalidLinkTitle: "This link cannot be used",
  invalidLinkMessage: "The reset link is missing, invalid or has expired. Request a new one to continue.",
  checkingTitle: "Checking your link",
  checkingMessage: "One moment while we make sure it can still be used.",
  showPassword: "Show password",
  hidePassword: "Hide password",
  failed: "The password could not be reset. Request a new link and try again.",
};

export const PASSWORD_RESET_LINKS = {
  BACK_TO_LOGIN: "Back to sign in",
  REQUEST_NEW_LINK: "Request a new link",
  RESET_DONE: "Password updated. Sign in with your new password.",
} as const;

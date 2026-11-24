import type { ForgotPasswordFormText, ResetPasswordFormText, SessionRole } from "@pte/ui";

export const CURRENT_USER_QUERY_KEY = ["currentUser"] as const;

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

/**
 * Real backend roles allowed into `/host/*` — mirrors vendor-web's
 * `HOST_ROLES`. HOST_ADMIN is the only tenant-administrator role in the
 * canonical identity taxonomy.
 */
export const HOST_ROLES: SessionRole[] = ["HOST_ADMIN"];

/**
 * Real backend roles allowed into `/proctor/*`. PROCTOR is the only
 * monitoring role in the canonical identity taxonomy. PROCTOR users
 * reach proctor routes via deep-link from the host UI; the sidebar nav
 * for proctor accounts is built by `buildProctorNav()` in
 * `lib/navigation.tsx`.
 */
export const PROCTOR_ROLES: SessionRole[] = ["PROCTOR"];

export const AUTH_ROUTES = {
  login: "/login",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  changePassword: "/change-password",
  register: "/register",
  hostDashboard: "/host/dashboard",
  hostProfile: "/host/profile",
  examinerWork: "/examiner/work",
  proctorSessions: "/proctor/sessions",
} as const;

export const USER_MENU_TEXT = {
  PROFILE: "Profile & organization",
  CHANGE_PASSWORD: "Change password",
  LOGOUT: "Log out",
} as const;

export const PASSWORD_CHANGE_TEXT = {
  TITLE: "Change your password",
  SUBTITLE: "Your temporary password must be replaced before you can open a workspace.",
  VOLUNTARY_SUBTITLE: "Enter your current password, then choose a new one.",
  CANCEL: "Cancel",
  SUCCESS_VOLUNTARY: "Password changed.",
  CURRENT_LABEL: "Current password",
  NEW_LABEL: "New password",
  CONFIRM_LABEL: "Confirm new password",
  REQUIRED: "Enter all password fields.",
  MISMATCH: "The new passwords do not match.",
  EDGE_SPACES: "The password cannot start or end with a space.",
  TOO_SHORT: "Use at least 8 characters for the new password.",
  SUBMIT: "Change password",
  SUBMITTING: "Changing password...",
  FAILED: "Password could not be changed. Check the current password and try again.",
  SUCCESS: "Password changed. You are now signed in.",
} as const;

export const AUTH_TEXT = {
  BRAND: "PTE Prep",
  PORTAL_LABEL: "Organization portal",
  FOOTER_LABEL: "Legal and support",
  FOOTER_COPYRIGHT: "© {year} PTE Prep",
  FOOTER_TERMS: "Terms",
  FOOTER_PRIVACY: "Privacy",
  FOOTER_SUPPORT: "Contact support",
  WELCOME_TITLE: "Welcome Back",
  WELCOME_SUBTITLE: "Sign in to manage learners and exams for your organization.",
  // Every organization account (Host, proctor, examiner, student) signs in with the generated
  // `{tenant.code}.{random}` username that was e-mailed when the account was created — the e-mail
  // address is not the login key for new accounts, so the field is not e-mail-typed or e-mail-validated.
  // Accounts created before generated usernames keep their e-mail as username.
  USERNAME_LABEL: "Username",
  USERNAME_PLACEHOLDER: "school.k7m2p9qx",
  USERNAME_HINT: "Use the username your organization sent to your email.",
  PASSWORD_LABEL: "Password",
  PASSWORD_PLACEHOLDER: "Enter your password",
  FORGOT: "Forgot password?",
  LOGIN_BUTTON: "Login",
  LOGGING_IN: "Signing in...",
  SHOW_PASSWORD: "Show password",
  HIDE_PASSWORD: "Hide password",
  USERNAME_REQUIRED: "Please enter your username.",
  PASSWORD_REQUIRED: "Please enter your password.",
  INVALID_CREDENTIALS: "Username or password is incorrect.",
  STUDENT_ACCOUNT_NOT_ALLOWED:
    "Student accounts cannot sign in to this portal. Your results are sent to your email when they are published.",
  GENERIC_ERROR: "Login failed. Please try again.",
  NETWORK_ERROR: "Unable to connect to the server. Check your connection and try again.",
  SERVICE_UNAVAILABLE: "Sign-in is temporarily unavailable. Please try again later.",
  RATE_LIMITED: "Too many sign-in attempts. Please wait a moment and try again.",
} as const;

export const REGISTRATION_TEXT = {
  requestedCodeHint:
    "3–32 lowercase letters, numbers, or hyphens. This code cannot change after approval.",
  requestedCodeInvalid: "Use 3–32 lowercase letters, numbers, or hyphens.",
  duplicateCode: "This tenant code is already in use. Choose another code.",
  duplicateName: "This organization name is already in use. Choose another name.",
  duplicateTaxCode: "This tax code already belongs to an organization. Check it or contact support.",
  applicationInvalid: "Some details are not valid. Check the form and try again.",
  networkError: "Could not reach the server. Check your connection and try again.",
  rateLimited: "The system is receiving many applications. Try again in a few minutes.",
  submitFailed: "Application could not be submitted. Try again.",
  organizationNameRequired: "Enter your organization name.",
  organizationTypeRequired: "Select an organization type.",
  emailRequired: "Enter your email address.",
  emailInvalid: "Enter a valid email address.",
  taxCodeRequired: "Enter your organization's tax code.",
  applicationReceived: "Application received",
  reviewTitle: "Your organization is in review.",
  reviewDescription: "We will contact you at the email provided after the review is complete.",
  signIn: "Sign in",
  detailsTitle: "Organization details",
  detailsSubtitle: "Submit an application. Platform staff will create access after review.",
  organizationNameLabel: "Organization name",
  organizationNamePlaceholder: "e.g. Bright English Center",
  organizationTypeLabel: "Organization type",
  organizationTypePlaceholder: "Select type",
  requestedCodeLabel: "Requested tenant code",
  requestedCodePlaceholder: "bright-center",
  phoneLabel: "Phone number",
  phonePlaceholder: "Your contact number",
  workEmailLabel: "Work email",
  workEmailPlaceholder: "admin@organization.com",
  taxCodeLabel: "Tax code",
  taxCodeHelper: "Required for organization verification.",
  taxCodePlaceholder: "Enter your tax code",
  alreadyHaveAccount: "Already have an account?",
  submitting: "Submitting...",
  submitApplication: "Submit application",
  submitIcon: "→",
} as const;

export type RegistrationText = { [Key in keyof typeof REGISTRATION_TEXT]: string };

export const REGISTRATION_ORGANIZATION_TYPES = [
  { label: "School", value: "school" },
  { label: "Language center", value: "language-center" },
  { label: "University", value: "university" },
  { label: "Other", value: "other" },
];

export const FORGOT_PASSWORD_TEXT: ForgotPasswordFormText = {
  title: "Forgot your password?",
  subtitle:
    "Enter your username and the email on that account and we will send you a link to choose a new password. Forgot your username? Ask your centre administrator.",
  usernameLabel: "Username",
  emailLabel: "Email",
  submit: "Send reset link",
  submitting: "Sending...",
  required: "Enter your email address.",
  usernameRequired: "Enter your username.",
  sentTitle: "Check your inbox",
  sentMessage:
    "If that username and email belong to the same account, a reset link is on its way. The link works once and expires in 30 minutes.",
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
  edgeSpaces: "The password cannot start or end with a space.",
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

/** First sign-in with a temporary password: the same two fields as a reset, shown on the sign-in page. */
export const FIRST_PASSWORD_TEXT: ResetPasswordFormText & { failed: string; backToLogin: string; success: string } = {
  title: "Set a new password",
  subtitle: "This is your first sign-in. Choose a new password to continue.",
  newLabel: "New password",
  confirmLabel: "Confirm new password",
  submit: "Save and continue",
  submitting: "Saving...",
  required: "Enter both password fields.",
  tooShort: "Use at least 8 characters for the new password.",
  mismatch: "The new passwords do not match.",
  edgeSpaces: "The password cannot start or end with a space.",
  invalidLinkTitle: "",
  invalidLinkMessage: "",
  checkingTitle: "",
  checkingMessage: "",
  showPassword: "Show password",
  hidePassword: "Hide password",
  failed: "Password could not be changed. Try again.",
  backToLogin: "Back to sign in",
  success: "Password changed. You are now signed in.",
};

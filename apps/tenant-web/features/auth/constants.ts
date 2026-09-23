import type { SessionRole } from "@pte/ui";

export const CURRENT_USER_QUERY_KEY = ["currentUser"] as const;

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

/**
 * Real backend roles allowed into `/host/*` — mirrors vendor-web's
 * `HOST_ROLES`. HOST_ADMIN is the only tenant-administrator role in the
 * canonical identity taxonomy.
 */
export const HOST_ROLES: SessionRole[] = ["HOST_ADMIN"];

export const AUTH_ROUTES = {
  login: "/login",
  register: "/register",
  hostDashboard: "/host/dashboard",
  examinerWork: "/examiner/work",
} as const;

export const AUTH_TEXT = {
  BRAND: "PTE Prep",
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
  ORGANIZATION_LABEL: "Organization",
  ORGANIZATION_PLACEHOLDER: "Select your organization",
  ORGANIZATION_REQUIRED: "Please select your organization.",
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

export const REGISTRATION_TEXT = {
  requestedCodeHint:
    "3–32 lowercase letters, numbers, or hyphens. This code cannot change after approval.",
  requestedCodeInvalid: "Use 3–32 lowercase letters, numbers, or hyphens.",
  duplicateCode: "This tenant code is already in use. Choose another code.",
  duplicateName: "This organization name is already in use. Choose another name.",
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

export const REGISTRATION_ORGANIZATION_TYPES = [
  { label: "School", value: "school" },
  { label: "Language center", value: "language-center" },
  { label: "University", value: "university" },
  { label: "Other", value: "other" },
];

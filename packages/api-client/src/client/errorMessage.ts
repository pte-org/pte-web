import { ApiError, type ApiErrorKind } from "./apiError";

const GENERIC_ERROR_MESSAGE =
  "We couldn't complete this action. Please try again or contact support.";
const NETWORK_ERROR_MESSAGE =
  "Unable to connect to the server. Please check your connection and try again.";
const MAX_USER_MESSAGE_LENGTH = 240;

const USER_FACING_ERROR_MESSAGES: Record<string, string> = {
  PLAN_ARCHIVED_NOT_EDITABLE:
    "This plan is archived and can no longer be edited. Create a new plan if you need different pricing or capacity.",
  PLAN_MUST_BE_DRAFT_TO_ACTIVATE: "Only draft plans can be published.",
  ORDER_PLAN_NOT_ACTIVE:
    "This plan is no longer available for purchase. Please choose another active plan.",
  SUBSCRIPTION_PLAN_NOT_ACTIVE:
    "This plan is no longer active. Please contact the platform administrator.",
  LICENSE_CODE_PLAN_NOT_ACTIVE:
    "This license is linked to a plan that is no longer active. Please contact the platform administrator.",
  TENANT_NAME_ALREADY_USED: "An organization with this name already exists.",
  TENANT_CODE_ALREADY_USED: "This organization code is already in use.",
  REQUESTED_CODE_ALREADY_USED: "This organization code is already in use.",
  STUDENT_ALREADY_IN_CLASS: "This student is already enrolled in the selected class.",
  EMAIL_ALREADY_USED: "An account with this email already exists.",
  DUPLICATE_EMAIL_IN_BATCH: "Some email addresses appear more than once in the uploaded file.",
  INVALID_LOGIN: "The username or password is incorrect.",
  ACCESS_DENIED: "You do not have permission to complete this action.",
  LICENSE_CODE_IDEMPOTENCY_KEY_REQUIRED: "Reload this page before issuing a license code.",
  LICENSE_CODE_IDEMPOTENCY_KEY_INVALID: "Reload this page to generate a valid issuance key.",
  LICENSE_CODE_IDEMPOTENCY_KEY_REUSED: "This request belongs to another issuance. Recover the original result or explicitly start a new issuance.",
  LICENSE_CODE_ISSUE_RETRYABLE: "The result is not confirmed. Recover this request using the same issuance key.",
  LICENSE_CODE_ISSUE_FAILED: "The issuance could not be confirmed. Recover this request before starting another.",
  LICENSE_CODE_ISSUE_RESULT_MISSING: "The original issuance is retained in history but its code is unavailable. Contact support.",
  LICENSE_CODE_EXAM_PLAN_REQUIRED: "Select an active exam package and try again.",
  LICENSE_CODE_EXPIRY_INVALID: "Code expiry must be in the future. Correct it and start a new issuance.",
  LICENSE_CODE_EXPIRY_PRECISION_INVALID: "Expiry supports microsecond precision at most.",
  LICENSE_CODE_NOT_FOUND: "We couldn't find that license code. Please check it and try again.",
  LICENSE_CODE_ALREADY_REDEEMED: "This license code has already been redeemed.",
  LICENSE_CODE_REVOKED: "This license code has been revoked.",
  LICENSE_CODE_EXPIRED: "This license code has expired.",
  LICENSE_CODE_NOT_REDEEMABLE: "This license code cannot be redeemed.",
  LICENSE_CODE_REVOKE_SCOPE_CHANGED:
    "The license revoke scope changed. Refresh the preview and review it again.",
  LICENSE_CODE_REVOKE_PREVIEW_EXPIRED:
    "The license revoke preview expired. Refresh the preview and review it again.",
  LICENSE_CODE_REVOKE_CONFIRMATION_REQUIRED:
    "Confirm the revoke scope and all required acknowledgements before continuing.",
  LICENSE_CODE_REVOKE_CAPACITY_UNSUPPORTED:
    "This redeemed capacity code cannot be reversed from the admin screen.",
  LICENSE_CODE_REVOKE_TENANT_MISMATCH:
    "The linked subscription does not match this license code.",
  LICENSE_CODE_REVOKE_IMPACT_UNAVAILABLE:
    "The current exam impact could not be verified. Try again later.",
  LICENSE_CODE_REVOKE_LEGACY_ENDPOINT:
    "This revoke link is outdated. Open the license code from the admin screen and preview it again.",
  EXAM_PREFLIGHT_FAILED:
    "This exam is not ready yet. Review the template, schedule, subscription, and audience selections.",
  EXAM_DRAFT_NOT_EDITABLE:
    "This exam can no longer be edited because generation or publishing has already started.",
  EXAM_GENERATION_NOT_READY:
    "The exam questions are still being prepared. Please wait and try again.",
  EXAM_DRAFT_VERSION_CONFLICT:
    "This exam was changed in another window. Refresh the page and review your changes again.",
  EXAM_DRAFT_CONFIGURATION_INVALID:
    "Some exam settings are incompatible. Review the selected mode and reuse rule.",
  LOCKDOWN_MODE_INVALID_FOR_EXAM_MODE:
    "The selected security policy is not compatible with this exam mode.",
  LOCKDOWN_MODE_REQUIRED:
    "The exam security policy could not be resolved. Refresh the exam and try again.",
  AUDIENCE_SOURCE_NOT_FOUND:
    "We couldn't find one of the selected audience sources. Refresh the page and try again.",
  AUDIENCE_CHANGED_REQUIRES_REGENERATION:
    "The student audience changed while the exam was being prepared. Generate the exam again before publishing.",
  EXAM_AUDIENCE_LOCKED:
    "This exam audience is already locked for preparation or publishing and cannot be changed here.",
  LEGACY_SESSION_CREATE_REQUIRES_NEW_WORKFLOW:
    "This exam creation form is outdated. Use the new exam workflow so the template, audience, and student rules can be checked before publishing.",
  SESSION_SUBSCRIPTION_NOT_FOUND:
    "The selected subscription could not be found. Choose another active subscription.",
  SESSION_WINDOW_OUTSIDE_SUBSCRIPTION:
    "The exam schedule must stay within the selected subscription period.",
  SESSION_CAPACITY_EXCEEDED:
    "The selected audience is larger than the capacity allowed by the subscription.",
  SESSION_CAPACITY_EXCEEDS_SUBSCRIPTION:
    "The requested exam capacity is higher than the limit in the selected subscription.",
  SESSION_ENROLLMENTS_EXCEED_SUBSCRIPTION:
    "This exam already has more enrolled students than the selected subscription allows.",
  SESSION_TIME_CONFLICT:
    "Some students already have another exam during this time. Review the audience or schedule.",
  SESSION_NOT_READY_TO_OPEN: "Publish the exam before opening it for students.",
  SESSION_NOT_CANCELLABLE: "This exam can no longer be cancelled in its current state.",
  INVALID_SESSION_WINDOW:
    "Choose a valid exam window where the closing time is after the opening time.",
  HOST_CONTEXT_REQUIRED: "Your host organization could not be identified. Please sign in again.",
  PROGRAM_NOT_FOUND: "The selected program could not be found or is no longer active.",
  PROGRAM_NAME_ALREADY_USED: "A program with this name already exists in your organization.",
  PROGRAM_HAS_ACTIVE_CLASSES:
    "This program still has active classes. Please archive all classes before archiving the program.",
  CLASS_NOT_FOUND: "The selected class could not be found or is no longer active.",
  CLASS_NAME_ALREADY_USED: "A class with this name already exists in this program.",
  CLASS_HAS_ACTIVE_MEMBERS:
    "This class still has active members. Please remove all members before archiving the class.",
  CLASS_MEMBERSHIP_NOT_FOUND: "The class membership could not be found.",
  STUDENT_NOT_FOUND: "The selected student could not be found.",
};

const KIND_FALLBACKS: Record<ApiErrorKind, string> = {
  validation: "Please check the submitted information and try again.",
  unauthorized: "Your session has expired. Please sign in again.",
  forbidden: "You do not have permission to complete this action.",
  conflict: "This action conflicts with the current data. Please review it and try again.",
  network: NETWORK_ERROR_MESSAGE,
  server: "The server encountered a problem. Please try again later.",
  unknown: GENERIC_ERROR_MESSAGE,
};

/** Machine codes are for control flow and diagnostics, never direct UI output. */
export function isMachineErrorCode(value: unknown): boolean {
  return typeof value === "string" && /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+$/.test(value);
}

function isSafeUserMessage(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const message = value.trim();
  if (!message || message.length > MAX_USER_MESSAGE_LENGTH || isMachineErrorCode(message)) {
    return false;
  }
  if (message.includes("\n") || message.includes("{") || message.includes("}")) {
    return false;
  }
  if (/\b(?:Exception|Error)\b|at\s+\w+\s*\(/i.test(message)) return false;
  return true;
}

function fallbackFor(error: ApiError, fallback?: string): string {
  if (isSafeUserMessage(fallback)) return fallback;
  return KIND_FALLBACKS[error.kind] ?? GENERIC_ERROR_MESSAGE;
}

/**
 * Converts an unknown caught value into text safe for a user-facing UI.
 * Callers must use this boundary instead of rendering `Error.message` directly.
 */
export function getUserFacingApiErrorMessage(error: unknown, fallback?: string): string {
  if (!(error instanceof ApiError)) {
    return isSafeUserMessage(fallback) ? fallback : GENERIC_ERROR_MESSAGE;
  }

  if (error.kind === "network") return NETWORK_ERROR_MESSAGE;
  if (error.kind === "server" || error.status >= 500) {
    return KIND_FALLBACKS.server;
  }

  if (isSafeUserMessage(error.userMessage)) return error.userMessage;

  const catalogMessage = error.code ? USER_FACING_ERROR_MESSAGES[error.code] : undefined;
  if (catalogMessage) return catalogMessage;

  if (error.kind === "validation" && isSafeUserMessage(error.message)) {
    return error.message;
  }

  return fallbackFor(error, fallback);
}

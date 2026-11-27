import { ApiError, type ApiErrorKind } from "./apiError";
import { USER_FACING_ERROR_MESSAGES_VI } from "./userMessagesVi";

export type UserMessageLanguage = "en" | "vi";

/** The wording of the messages every screen can show, in each language the apps offer. */
const GENERAL_MESSAGES: Record<UserMessageLanguage, Record<"generic" | "network" | "rateLimited", string>> = {
  en: {
    generic: "We couldn't complete this action. Please try again or contact support.",
    network: "Unable to connect to the server. Please check your connection and try again.",
    rateLimited: "The system is busy right now. Please wait a few seconds and try again.",
  },
  vi: {
    generic: "Không thể thực hiện thao tác. Vui lòng thử lại hoặc liên hệ hỗ trợ.",
    network: "Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.",
    rateLimited: "Hệ thống đang bận. Vui lòng đợi vài giây rồi thử lại.",
  },
};

/**
 * The chosen language lives on `globalThis`, not in a module variable: a hot reload of this file in development
 * would otherwise reset it to English until the next language change, and errors would turn English on a Vietnamese screen.
 */
const LANGUAGE_KEY = "__pteUserMessageLanguage";
const languageStore = globalThis as typeof globalThis & { [LANGUAGE_KEY]?: UserMessageLanguage };

const currentLanguage = (): UserMessageLanguage => languageStore[LANGUAGE_KEY] ?? "en";

/**
 * Chooses the language of the shared messages (the general ones and the per-kind fallbacks). The apps call it
 * whenever the person changes language; messages that belong to one specific error code stay in English.
 */
export function setUserMessageLanguage(next: UserMessageLanguage): void {
  languageStore[LANGUAGE_KEY] = next;
}

const RATE_LIMITED_STATUS = 429;
const MAX_USER_MESSAGE_LENGTH = 240;

export const USER_FACING_ERROR_MESSAGES: Record<string, string> = {
  PLAN_ARCHIVED_NOT_EDITABLE:
    "This plan is archived and can no longer be edited. Create a new plan if you need different pricing or capacity.",
  PLAN_MUST_BE_DRAFT_TO_ACTIVATE: "Only draft plans can be published.",
  ANNOUNCEMENT_INVALID: "The announcement is not valid. Check the title, the message and the dates: the end must be after the start.",
  ANNOUNCEMENT_NOT_FOUND: "We couldn't find this announcement. It may have been deleted.",
  ANNOUNCEMENT_VERSION_CONFLICT: "This announcement was changed by someone else. Reload it and try again.",
  ANNOUNCEMENT_PUBLISHED: "A published announcement can no longer be changed.",
  ANNOUNCEMENT_NOT_PUBLISHED: "Only a published announcement can be sent again.",
  ANNOUNCEMENT_CORRECTION_INVALID: "A correction must refer to a published announcement.",
  ORDER_PLAN_NOT_ACTIVE:
    "This plan is no longer available for purchase. Please choose another active plan.",
  SUBSCRIPTION_PLAN_NOT_ACTIVE:
    "This plan is no longer active. Please contact the platform administrator.",
  LICENSE_CODE_PLAN_NOT_ACTIVE:
    "This license is linked to a plan that is no longer active. Please contact the platform administrator.",
  TENANT_NAME_ALREADY_USED: "An organization with this name already exists.",
  TENANT_CODE_ALREADY_USED: "This organization code is already in use.",
  TENANT_TAX_CODE_ALREADY_USED:
    "Another organization already uses this tax code.",
  APPLICATION_EMAIL_ALREADY_PENDING:
    "An application from this email is already waiting for review.",
  REQUESTED_CODE_ALREADY_USED: "This organization code is already in use.",
  STUDENT_ALREADY_IN_CLASS: "This student is already enrolled in the selected class.",
  EMAIL_ALREADY_USED: "An account with this email already exists.",
  DUPLICATE_EMAIL_IN_BATCH: "Some email addresses appear more than once in the uploaded file.",
  ROSTER_VALIDATION_FAILED:
    "Some student details are missing or not valid. Every student needs a valid email and a full name.",
  INVALID_LOGIN: "The username or password is incorrect.",
  ACCESS_DENIED: "You do not have permission to complete this action.",
  TENANT_SUSPENDED:
    "This organization is suspended. New activity is blocked, but ongoing attempts and published reports remain available.",
  TENANT_SUSPENSION_IMPACT_STALE:
    "The live suspension impact changed. Refresh the preview and review it again before confirming.",
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
  TEMPLATE_NOT_ACTIVE:
    "The selected exam template is not active. Choose an active template and try again.",
  LOCKDOWN_MODE_INVALID_FOR_EXAM_MODE:
    "The selected security policy is not compatible with this exam mode.",
  LOCKDOWN_MODE_REQUIRED:
    "The exam security policy could not be resolved. Refresh the exam and try again.",
  AUDIENCE_SOURCE_NOT_FOUND:
    "We couldn't find one of the selected audience sources. Refresh the page and try again.",
  AUDIENCE_CHANGED_REQUIRES_REGENERATION:
    "The student audience changed while the exam was being prepared. Generate the exam again before publishing.",
  EXAM_AUDIENCE_LOCKED:
    "Students can't be added or removed while the exam is being prepared or running. Try again before it starts or after it ends.",
  ENROLLED_STUDENT_ALREADY_STARTED:
    "This student already started the exam, so they can't be removed from it.",
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
  FORBIDDEN_USER_MANAGEMENT: "You do not have permission to manage platform users.",
  FORBIDDEN_PASSWORD_RESET: "You do not have permission to reset this user's password.",
  FORBIDDEN_ROLE_ASSIGNMENT: "The selected platform role is not allowed.",
  USER_EMAIL_REQUIRED: "This account has no email address for credential delivery.",
  USER_NOT_FOUND: "The selected platform user could not be found or is no longer available.",
  STUDENT_ATTEMPT_IN_PROGRESS:
    "This student is taking an exam right now. Try again after they submit.",
  INVALID_PASSWORD_RESET_TOKEN:
    "This reset link is invalid or has expired. Request a new link and try again.",
  GENERATION_BATCH_NOT_FOUND: "This generation batch could not be found.",
  GENERATION_BATCH_NOT_CANCELLABLE: "This batch has already finished and can no longer be cancelled.",
  GENERATION_BATCH_NOT_PAUSABLE: "Only a running batch can be paused.",
  GENERATION_BATCH_NOT_RESUMABLE: "The batch is still stopping. Try again in a moment.",
  GENERATION_BATCH_PAUSE_EXPIRED: "The batch stayed paused too long and was cancelled. Saved questions were kept.",
  GENERATION_BATCH_SIZE_OUT_OF_RANGE:
    "Each row needs at least one question and the batch total must stay within the per-batch limit.",
  GENERATION_BATCH_ROWS_OUT_OF_RANGE: "A batch must have between 1 and 150 rows.",
  GENERATION_BATCH_TOPIC_HINTS_OUT_OF_RANGE: "A row can have at most 10 topics.",
  GENERATION_PICTURE_DISABLED: "AI pictures are turned off. Choose Auto or Chart for Describe Image.",
  GENERATION_JOB_PART_OF_BATCH: "This job belongs to a batch. Cancel the batch instead.",
  GENERATION_JOB_ALREADY_RUNNING: "You already have a generation running. Wait for it to finish first.",
  GENERATION_DAILY_LIMIT_REACHED: "You have reached your daily question generation limit.",
  GENERATION_GLOBAL_LIMIT_REACHED: "The platform has reached today's question generation limit.",
  GENERATION_VOICE_UNKNOWN: "This voice is not available. Pick another one.",
  GENERATION_VOICE_NOT_SUPPORTED_FOR_TASK:
    "The voice of this question cannot be changed. Only generated questions with a single speaker can be.",
  GENERATION_VOICE_UNCHANGED: "The question already uses this voice. Pick a different one.",
  GENERATION_VOICE_BUSY: "Another voice is being generated right now. Try again in a moment.",
  GENERATION_MEDIA_FAILED: "The audio could not be generated. Try again in a moment.",
  GENERATION_AUDIO_DURATION_OUT_OF_RANGE:
    "This voice reads the text too fast or too slow for the task. Pick another voice.",
};

const KIND_FALLBACKS: Record<UserMessageLanguage, Record<ApiErrorKind, string>> = {
  en: {
    validation: "Please check the submitted information and try again.",
    unauthorized: "Your session has expired. Please sign in again.",
    forbidden: "You do not have permission to complete this action.",
    conflict: "This action conflicts with the current data. Please review it and try again.",
    network: GENERAL_MESSAGES.en.network,
    server: "The server encountered a problem. Please try again later.",
    unknown: GENERAL_MESSAGES.en.generic,
  },
  vi: {
    validation: "Vui lòng kiểm tra lại thông tin đã nhập và thử lại.",
    unauthorized: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
    forbidden: "Bạn không có quyền thực hiện thao tác này.",
    conflict: "Thao tác này xung đột với dữ liệu hiện tại. Vui lòng kiểm tra lại và thử lại.",
    network: GENERAL_MESSAGES.vi.network,
    server: "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.",
    unknown: GENERAL_MESSAGES.vi.generic,
  },
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
  return KIND_FALLBACKS[currentLanguage()][error.kind] ?? GENERAL_MESSAGES[currentLanguage()].generic;
}

/**
 * Converts an unknown caught value into text safe for a user-facing UI.
 * Callers must use this boundary instead of rendering `Error.message` directly.
 */
export function getUserFacingApiErrorMessage(error: unknown, fallback?: string): string {
  if (!(error instanceof ApiError)) {
    return isSafeUserMessage(fallback) ? fallback : GENERAL_MESSAGES[currentLanguage()].generic;
  }

  if (error.kind === "network") return GENERAL_MESSAGES[currentLanguage()].network;
  if (error.status === RATE_LIMITED_STATUS) return GENERAL_MESSAGES[currentLanguage()].rateLimited;
  if (error.kind === "server" || error.status >= 500) {
    return KIND_FALLBACKS[currentLanguage()].server;
  }

  // In Vietnamese the app's own wording of a coded error wins over the English text the server sends with it.
  const translated = currentLanguage() === "vi" && error.code ? USER_FACING_ERROR_MESSAGES_VI[error.code] : undefined;
  if (translated) return translated;

  if (isSafeUserMessage(error.userMessage)) return error.userMessage;

  const catalogMessage = error.code ? USER_FACING_ERROR_MESSAGES[error.code] : undefined;
  if (catalogMessage) return catalogMessage;

  if (error.kind === "validation" && isSafeUserMessage(error.message)) {
    return error.message;
  }

  return fallbackFor(error, fallback);
}

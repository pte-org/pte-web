import { CREATE_SESSION_ERRORS } from "../constants";
import type { CreateSessionErrors, CreateSessionInput } from "../types";

export function validateCreateSession(input: CreateSessionInput): CreateSessionErrors {
  const errors: CreateSessionErrors = {};

  if (!input.name.trim()) {
    errors.name = CREATE_SESSION_ERRORS.NAME_REQUIRED;
  }
  if (!input.blueprintPublicId) {
    errors.blueprintPublicId = CREATE_SESSION_ERRORS.BLUEPRINT_REQUIRED;
  }
  if (!input.opensAt) {
    errors.opensAt = CREATE_SESSION_ERRORS.OPENS_AT_REQUIRED;
  } else if (new Date(input.opensAt).getTime() <= Date.now()) {
    errors.opensAt = CREATE_SESSION_ERRORS.OPENS_AT_FUTURE;
  }
  if (!input.closesAt) {
    errors.closesAt = CREATE_SESSION_ERRORS.CLOSES_AT_REQUIRED;
  } else if (
    input.opensAt &&
    new Date(input.closesAt).getTime() <= new Date(input.opensAt).getTime()
  ) {
    errors.closesAt = CREATE_SESSION_ERRORS.CLOSES_AT_AFTER_OPENS;
  }

  return errors;
}

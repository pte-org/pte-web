import { CREATE_EXAM_WIZARD_ERRORS } from "../constants";
import type { CreateExamWorkflowInput } from "../types";

export interface CreateExamWorkflowErrors {
  name?: string;
  templatePublicId?: string;
  subscriptionPublicId?: string;
  opensAt?: string;
  closesAt?: string;
  capacity?: string;
  seriesKey?: string;
  sources?: string;
}

export function validateCreateExamWorkflow(
  input: CreateExamWorkflowInput,
  now = Date.now(),
  requireAudience = true,
): CreateExamWorkflowErrors {
  const errors: CreateExamWorkflowErrors = {};

  if (!input.name.trim()) errors.name = CREATE_EXAM_WIZARD_ERRORS.NAME_REQUIRED;
  if (!input.templatePublicId)
    errors.templatePublicId = CREATE_EXAM_WIZARD_ERRORS.TEMPLATE_REQUIRED;
  if (!input.subscriptionPublicId) {
    errors.subscriptionPublicId = CREATE_EXAM_WIZARD_ERRORS.SUBSCRIPTION_REQUIRED;
  }
  if (!input.opensAt) {
    errors.opensAt = CREATE_EXAM_WIZARD_ERRORS.OPENS_REQUIRED;
  } else if (new Date(input.opensAt).getTime() <= now) {
    errors.opensAt = CREATE_EXAM_WIZARD_ERRORS.OPEN_FUTURE;
  }
  if (!input.closesAt) {
    errors.closesAt = CREATE_EXAM_WIZARD_ERRORS.CLOSES_REQUIRED;
  } else if (
    input.opensAt &&
    new Date(input.closesAt).getTime() <= new Date(input.opensAt).getTime()
  ) {
    errors.closesAt = CREATE_EXAM_WIZARD_ERRORS.CLOSES_AFTER_OPENS;
  }
  if (
    !input.capacity.trim() ||
    !Number.isInteger(Number(input.capacity)) ||
    Number(input.capacity) <= 0
  ) {
    errors.capacity = CREATE_EXAM_WIZARD_ERRORS.CAPACITY_REQUIRED;
  }
  if (input.reusePolicy !== "ALLOW" && !input.seriesKey.trim()) {
    errors.seriesKey = CREATE_EXAM_WIZARD_ERRORS.SERIES_REQUIRED;
  }
  if (requireAudience && input.sources.length === 0) {
    errors.sources = CREATE_EXAM_WIZARD_ERRORS.AUDIENCE_REQUIRED;
  }

  return errors;
}

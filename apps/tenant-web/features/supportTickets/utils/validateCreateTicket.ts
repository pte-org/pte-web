import { CREATE_TICKET_ERRORS as E } from "../constants";
import type { CreateTicketErrors, CreateTicketInput } from "../types";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateCreateTicket(input: CreateTicketInput): CreateTicketErrors {
  const errors: CreateTicketErrors = {};

  if (!input.category) errors.category = E.CATEGORY_REQUIRED;
  if (!input.description.trim()) {
    errors.description = E.DESCRIPTION_REQUIRED;
  } else if (input.description.length > 2000) {
    errors.description = E.DESCRIPTION_TOO_LONG;
  }

  if (input.entityType && !input.entityId.trim()) {
    errors.entityId = E.ENTITY_ID_REQUIRED;
  } else if (input.entityId.trim() && !UUID_REGEX.test(input.entityId.trim())) {
    errors.entityId = E.ENTITY_ID_INVALID;
  }

  return errors;
}

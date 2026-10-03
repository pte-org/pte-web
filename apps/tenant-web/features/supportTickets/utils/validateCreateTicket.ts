import { CREATE_TICKET_ERRORS as E } from "../constants";
import type { CreateTicketErrors, CreateTicketInput } from "../types";

export function validateCreateTicket(input: CreateTicketInput): CreateTicketErrors {
  const errors: CreateTicketErrors = {};

  if (!input.category) errors.category = E.CATEGORY_REQUIRED;
  if (!input.description.trim()) {
    errors.description = E.DESCRIPTION_REQUIRED;
  } else if (input.description.length > 2000) {
    errors.description = E.DESCRIPTION_TOO_LONG;
  }

  return errors;
}

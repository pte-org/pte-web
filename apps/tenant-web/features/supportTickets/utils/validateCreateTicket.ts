import { CREATE_TICKET_ERRORS as E } from "../constants";
import type { CreateTicketErrors, CreateTicketInput } from "../types";

export interface CreateTicketMessages {
  CATEGORY_REQUIRED: string;
  DESCRIPTION_REQUIRED: string;
  DESCRIPTION_TOO_LONG: string;
}

export function validateCreateTicket(
  input: CreateTicketInput,
  messages: CreateTicketMessages = E,
): CreateTicketErrors {
  const errors: CreateTicketErrors = {};

  if (!input.category) errors.category = messages.CATEGORY_REQUIRED;
  if (!input.description.trim()) {
    errors.description = messages.DESCRIPTION_REQUIRED;
  } else if (input.description.length > 2000) {
    errors.description = messages.DESCRIPTION_TOO_LONG;
  }

  return errors;
}

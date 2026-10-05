import type { BadgeVariant } from "@pte/ui";
import type { CreateTicketInput, TicketCategory, TicketStatus } from "../types";

export const SUPPORT_TICKETS_QUERY_KEY = ["support-tickets"] as const;
export const SUPPORT_TICKET_QUERY_KEY = (id: string) => ["support-tickets", id] as const;

export const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export const STATUS_VARIANTS: Record<TicketStatus, BadgeVariant> = {
  OPEN: "neutral",
  IN_PROGRESS: "warning",
  RESOLVED: "success",
  CLOSED: "neutral",
};

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  BUG: "Bug / Technical",
  CONTENT_COMPLAINT: "Content Complaint",
  GENERAL_FEEDBACK: "General Feedback",
};

export const CATEGORY_VARIANTS: Record<TicketCategory, BadgeVariant> = {
  BUG: "danger",
  CONTENT_COMPLAINT: "warning",
  GENERAL_FEEDBACK: "neutral",
};

export const ENTITY_TYPE_LABELS = {
  EXAM_SESSION: "Exam Session",
  QUESTION: "Question",
} as const;

export const SUPPORT_TICKETS_TEXT = {
  TITLE: "Support Tickets",
  SUBTITLE: "Submit and track your support requests.",
  CREATE_BUTTON: "New Ticket",
  EMPTY_TITLE: "No tickets yet",
  EMPTY_TEXT: "Submit a ticket to report issues or provide feedback.",
  FILTER_ALL_STATUS: "All statuses",
  FILTER_ALL_CATEGORY: "All categories",
  TOTAL_ITEMS: (n: number) => `${n} ticket${n === 1 ? "" : "s"}`,
  NOTES_SECTION: "Admin Notes",
  NO_NOTES: "No admin notes yet.",
  ENTITY_SECTION: "Linked Entity",
  TICKET_DETAILS: "Ticket Details",
  CREATED_AT: "Submitted",
  BACK: "Back to tickets",
} as const;

export const SUPPORT_TICKET_TABLE_HEADERS = {
  ID: "ID",
  CATEGORY: "Category",
  STATUS: "Status",
  DESCRIPTION: "Description",
  SUBMITTED: "Submitted",
  ACTIONS: "",
} as const;

export const TICKET_ACTIONS_TEXT = {
  ACTIONS: "Ticket actions",
  VIEW_DETAIL: "View detail",
  CLOSE: "Close ticket",
  CONFIRM_CLOSE_TITLE: "Close this ticket?",
  CONFIRM_CLOSE_DESCRIPTION:
    "The support team will stop working on this ticket. A closed ticket cannot be reopened.",
  CANCEL: "Cancel",
  CLOSE_SUCCESS_TOAST: "Ticket closed.",
  CLOSE_FAILED: "We couldn't close this ticket. Please try again.",
} as const;

export const CREATE_TICKET_TEXT = {
  TITLE: "Submit Support Ticket",
  CATEGORY_LABEL: "Category",
  CATEGORY_PLACEHOLDER: "Select a category",
  DESCRIPTION_LABEL: "Description",
  DESCRIPTION_PLACEHOLDER: "Describe the issue or feedback in detail (max 2000 characters)",
  CANCEL: "Cancel",
  SUBMIT: "Submit Ticket",
  SUCCESS_TOAST: "Your ticket has been submitted.",
} as const;

export const CREATE_TICKET_ERRORS = {
  CATEGORY_REQUIRED: "Please select a category.",
  DESCRIPTION_REQUIRED: "Description is required.",
  DESCRIPTION_TOO_LONG: "Description must be 2000 characters or fewer.",
} as const;


export const REPORT_QUESTION_TEXT = {
  TITLE: "Report Question Issue",
  QUESTION_ID_LABEL: "Question ID",
  DESCRIPTION_LABEL: "Describe the issue",
  DESCRIPTION_PLACEHOLDER: "What is wrong with this question? (max 2000 characters)",
  CANCEL: "Cancel",
  SUBMIT: "Submit Report",
  SUCCESS_TOAST: "Your report has been submitted.",
} as const;

export const EMPTY_CREATE_TICKET: CreateTicketInput = {
  category: "",
  description: "",
};

export const CATEGORY_OPTIONS = [
  { value: "BUG", label: CATEGORY_LABELS.BUG },
  { value: "GENERAL_FEEDBACK", label: CATEGORY_LABELS.GENERAL_FEEDBACK },
] as const;

import type { BadgeVariant } from "@pte/ui";
import type { TicketCategory, TicketStatus } from "../types";

export const SUPPORT_TICKET_BREADCRUMB_ID_LENGTH = 8;

export const ADMIN_SUPPORT_TICKETS_QUERY_KEY = ["admin-support-tickets"] as const;
export const ADMIN_SUPPORT_TICKET_QUERY_KEY = (id: string) => ["admin-support-tickets", id];

export const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed by host",
};

export const STATUS_VARIANTS: Record<TicketStatus, BadgeVariant> = {
  // Blue, as in the organization portal, so an open request stands out from a closed one.
  OPEN: "info",
  IN_PROGRESS: "warning",
  RESOLVED: "success",
  CLOSED: "neutral",
};

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  BUG: "Bug",
  CONTENT_COMPLAINT: "Content Complaint",
  GENERAL_FEEDBACK: "General Feedback",
};

export const CATEGORY_VARIANTS: Record<TicketCategory, BadgeVariant> = {
  BUG: "danger",
  CONTENT_COMPLAINT: "warning",
  GENERAL_FEEDBACK: "neutral",
};

export const STATUS_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  OPEN: ["IN_PROGRESS"],
  IN_PROGRESS: ["RESOLVED"],
  RESOLVED: [],
  CLOSED: [],
};

export const TRANSITION_LABELS: Record<TicketStatus, string> = {
  OPEN: "Start handling",
  IN_PROGRESS: "Resolve",
  RESOLVED: "",
  CLOSED: "",
};

export const ADMIN_SUPPORT_TICKETS_TEXT = {
  TITLE: "Support Tickets",
  SUBTITLE: "Review and manage support requests from tenants.",
  EMPTY_TITLE: "No support tickets",
  EMPTY_TEXT: "No tickets match the current filters.",
  FILTER_ALL_STATUS: "All statuses",
  FILTER_ALL_CATEGORY: "All categories",
  FILTER_ALL_TENANTS: "All tenants",
  TOTAL_ITEMS: (n: number) => `${n} ticket${n !== 1 ? "s" : ""}`,
} as const;

export const ADMIN_TICKET_TABLE_HEADERS = {
  TENANT: "Tenant",
  CATEGORY: "Category",
  STATUS: "Status",
  DESCRIPTION: "Description",
  SUBMITTED: "Submitted",
  ACTIONS: "Actions",
  VIEW_ACTION: "View",
} as const;

export const ADMIN_TICKET_DETAIL_TEXT = {
  BACK: "← Back to tickets",
  LOADING: "Loading ticket…",
  NOT_FOUND: "Ticket not found.",
  SECTION_INFO: "Ticket information",
  SECTION_CONTENT: "Request details",
  SECTION_NOTES: "Reply to the organization",
  STATUS_LABEL: "Status",
  TENANT_LABEL: "Tenant",
  CATEGORY_LABEL: "Category",
  ENTITY_TYPE_LABEL: "Related entity type",
  DESCRIPTION_LABEL: "Description",
  SUBMITTED_LABEL: "Submitted",
  UPDATED_LABEL: "Last updated",
  EMPTY_NOTES_TITLE: "No replies yet",
  EMPTY_NOTES_TEXT: "Send the first reply to update the organization on the result.",
  ADD_NOTE_PLACEHOLDER: "Write a reply to the organization…",
  ADD_NOTE_SUBMIT: "Send reply",
  ADD_NOTE_SUCCESS: "Reply sent.",
  VISIBLE_HINT: "Visible to the organization",
  SENT_AT: "Sent at",
  ADMIN_ROLE: "Admin",
  REQUEST_ID_LABEL: "Request ID",
  SUBMITTER_LABEL: "Submitted by",
  UPDATE_STATUS_SUCCESS: "Status updated.",
  UPDATE_STATUS_ERROR: "We couldn't update the status. Please try again.",
  ADD_NOTE_ERROR: "We couldn't send the reply. Please try again.",
  EMPTY_VALUE: "—",
  TICKET_TITLE: "Ticket Details",
} as const;

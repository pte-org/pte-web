import { pluralize } from "@/features/orgLabels/constants";

export const MY_ORGANIZATIONS_QUERY_KEY = ["myOrganizations"] as const;
export const PROGRAMS_QUERY_KEY = ["programs"] as const;
export const PROGRAM_QUERY_KEY = ["program"] as const;

export const PROGRAM_STATUS_LABELS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  SUSPENDED: "Suspended",
} as const;

export const PROGRAM_STATUS_VARIANT = {
  ACTIVE: "success",
  INACTIVE: "neutral",
  SUSPENDED: "warning",
} as const;

export const PROGRAMS_TEXT = {
  subtitle: (label: string) => `Manage your organization's ${label.toLowerCase()}.`,
  emptyDate: "…",
  addButton: "Create Program",
  emptyTitle: (label: string) => `No ${label} yet`,
  emptyText: (label: string) => `Create your first ${label.toLowerCase()} to start adding classes.`,
  organizationLabel: "Organization",
  organizationPlaceholder: "Select an organization",
  viewDetails: "View Details",
} as const;

export const PROGRAM_TABLE_HEADERS = {
  NAME: "Name",
  STATUS: "Status",
  DATES: "Dates",
  ACTIONS: "Actions",
} as const;

export const CREATE_PROGRAM_TEXT = {
  title: "Create Program",
  nameLabel: (label: string) => `${label} name`,
  namePlaceholder: (label: string) => `e.g. ${label} 12`,
  descriptionLabel: "Description",
  startDateLabel: "Start date",
  endDateLabel: "End date",
  cancel: "Cancel",
  submit: "Create Program",
  submitting: "Creating...",
} as const;

export const CREATE_PROGRAM_ERRORS = {
  nameRequired: (label: string) => `${label} name is required.`,
  endDateBeforeStartDate: "End date must be on or after the start date.",
} as const;

export const EMPTY_CREATE_PROGRAM = {
  name: "",
  description: "",
  startDate: "",
  endDate: "",
} as const;

export const PROGRAM_DETAIL_TEXT = {
  back: (label: string) => `Back to ${pluralize(label)}`,
  activate: "Activate",
  deactivate: "Deactivate",
  suspend: "Suspend",
  archive: "Archive",
  missingOrganization:
    "Missing organization context — go back to the list and open this from there.",
  backToList: (label: string) => `Back to ${pluralize(label)}`,
  loadFailed: "Couldn't load this — it may have been archived or you may not have access.",
  activateSuccess: (label: string) => `${label} activated successfully.`,
  suspendSuccess: (label: string) => `${label} suspended successfully.`,
  archiveSuccess: (label: string) => `${label} archived successfully.`,
  confirmArchiveTitle: (label: string) => `Archive ${label}`,
  confirmArchiveDescription: (name: string, label: string) =>
    `Are you sure you want to archive "${name}"? This ${label.toLowerCase()} will be archived and no longer active.`,
  confirmArchiveButton: "Archive",
  cancel: "Cancel",
  archiveConfirmTitle: (label: string) => `Archive ${label}?`,
  archiveCascadeWarning: (classCount: number, studentCount: number, label: string) =>
    `Archiving this ${label.toLowerCase()} will also archive its ${classCount} ${classCount === 1 ? "class" : "classes"} and unassign ${studentCount} ${studentCount === 1 ? "student" : "students"}. This cannot be undone.`,
  archiveCountsLoading: "Loading impact...",
  activateFailed: (label: string) => `Couldn't activate this ${label.toLowerCase()}.`,
  suspendFailed: (label: string) => `Couldn't suspend this ${label.toLowerCase()}.`,
  archiveFailed: (label: string) => `Couldn't archive this ${label.toLowerCase()}.`,
} as const;

export const PROGRAM_DASHBOARD_TEXT = {
  title: "Overview",
  overviewTitle: "Program overview",
  overviewSubtitle: "Classes and students at a glance.",
  classCount: (label: string) => pluralize(label),
  studentCount: "Students",
  loadFailed: "Couldn't load the overview.",
  tableHeading: (label: string) => `Students per ${label.toLowerCase()}`,
} as const;

export const PROGRAM_DASHBOARD_TABLE_HEADERS = {
  NAME: "Name",
  STUDENTS: "Students",
} as const;

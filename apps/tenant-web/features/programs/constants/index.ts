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
  addButton: (label: string) => `+ Create ${label}`,
  emptyTitle: (label: string) => `No ${label} yet`,
  emptyText: (label: string) => `Create your first ${label.toLowerCase()} to start adding classes.`,
  organizationLabel: "Organization",
  organizationPlaceholder: "Select an organization",
} as const;

export const PROGRAM_TABLE_HEADERS = {
  NAME: "Name",
  STATUS: "Status",
  DATES: "Dates",
} as const;

export const CREATE_PROGRAM_TEXT = {
  title: (label: string) => `Create ${label}`,
  nameLabel: (label: string) => `${label} name`,
  namePlaceholder: (label: string) => `e.g. ${label} 12`,
  descriptionLabel: "Description",
  startDateLabel: "Start date",
  endDateLabel: "End date",
  cancel: "Cancel",
  submit: (label: string) => `Create ${label}`,
  submitting: "Creating...",
} as const;

export const CREATE_PROGRAM_ERRORS = {
  nameRequired: (label: string) => `${label} name is required.`,
} as const;

export const EMPTY_CREATE_PROGRAM = {
  name: "",
  description: "",
  startDate: "",
  endDate: "",
} as const;

export const PROGRAM_DETAIL_TEXT = {
  back: (label: string) => `Back to ${label}s`,
  activate: "Activate",
  deactivate: "Deactivate",
  suspend: "Suspend",
  archive: "Archive",
  missingOrganization: "Missing organization context — go back to the list and open this from there.",
  backToList: (label: string) => `Back to ${label}s`,
  loadFailed: "Couldn't load this — it may have been archived or you may not have access.",
} as const;

export const COORDINATOR_ASSIGNMENTS_QUERY_KEY = ["coordinatorAssignments"] as const;

export const COORDINATOR_SECTION_TEXT = {
  title: "Program Coordinators",
  addButton: "+ Add Coordinator",
  emptyTitle: "No coordinators assigned yet",
  assignedCount: (count: number) => `${count} coordinator(s) assigned`,
  unassign: "Remove from Program",
} as const;

export const COORDINATOR_TABLE_HEADERS = {
  FULL_NAME: "Full name",
  EMAIL: "Email",
  ACTIONS: "Action",
} as const;

export const ASSIGN_COORDINATOR_TEXT = {
  title: "Add Coordinator to Program",
  tabExisting: "Pick Existing",
  tabNew: "Create New",
  existingLabel: "Coordinator",
  existingPlaceholder: "Select a coordinator",
  noExisting: "No existing coordinators in your organization yet — create one below.",
  emailLabel: "Email",
  emailPlaceholder: "coordinator@school.edu.vn",
  fullNameLabel: "Full name",
  passwordLabel: "Password",
  passwordHelper: "At least 8 characters. Share this with the coordinator directly.",
  cancel: "Cancel",
  submit: "Add to Program",
  submitting: "Adding...",
} as const;

export const CREATE_COORDINATOR_ERRORS = {
  emailRequired: "Email is required.",
  emailInvalid: "Enter a valid email address.",
  fullNameRequired: "Full name is required.",
  passwordTooShort: "Password must be at least 8 characters.",
} as const;

export const EMPTY_CREATE_COORDINATOR = { email: "", fullName: "", password: "" } as const;

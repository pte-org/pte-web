export const CLASSES_QUERY_KEY = ["classes"] as const;

export const CLASS_STATUS_LABELS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  SUSPENDED: "Suspended",
} as const;

export const CLASS_STATUS_VARIANT = {
  ACTIVE: "success",
  INACTIVE: "neutral",
  SUSPENDED: "warning",
} as const;

export const CLASSES_SECTION_TEXT = {
  countLabel: (count: number, label: string) => `${count} ${label.toLowerCase()}${count === 1 ? "" : "s"}`,
  addButton: (label: string) => `+ Create ${label}`,
  emptyTitle: (label: string) => `No ${label} yet`,
  emptyText: (label: string) => `Create your first ${label.toLowerCase()} to start assigning students.`,
} as const;

export const CLASS_TABLE_HEADERS = {
  NAME: "Name",
  STATUS: "Status",
  ACTIONS: "Actions",
} as const;

export const CLASS_ROW_ACTIONS_TEXT = {
  activate: "Activate",
  deactivate: "Deactivate",
  suspend: "Suspend",
  archive: "Archive",
} as const;

export const CREATE_CLASS_TEXT = {
  title: (label: string) => `Create ${label}`,
  nameLabel: (label: string) => `${label} name`,
  namePlaceholder: "e.g. 12A1",
  cancel: "Cancel",
  submit: (label: string) => `Create ${label}`,
  submitting: "Creating...",
} as const;

export const CREATE_CLASS_ERRORS = {
  nameRequired: (label: string) => `${label} name is required.`,
} as const;

export const CLASSES_QUERY_KEY = ["classes"] as const;
export const ALL_TENANT_CLASSES_QUERY_KEY = ["allTenantClasses"] as const;

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

export const CLASS_ROSTER_TEXT = {
  back: (label: string) => `Back to ${label}`,
  addButton: "Import / Assign Students",
  emptyTitle: "No students assigned yet",
  emptyText: "Import a roster or assign an existing student to get started.",
  loadFailed: "Couldn't load this — it may have been archived or you may not have access.",
  missingContext: "Missing organization/program context — go back to the list and open this from there.",
} as const;

export const CLASS_ROSTER_TABLE_HEADERS = {
  FULL_NAME: "Full name",
  EMAIL: "Email",
  PHONE: "Phone",
  ACTIONS: "Actions",
} as const;

export const CLASS_ROSTER_ROW_ACTIONS_TEXT = {
  transfer: "Transfer",
  unassign: "Unassign",
} as const;

export const IMPORT_OR_ASSIGN_TEXT = {
  title: "Add Students",
  tabExisting: "Pick Existing",
  tabImport: "Import Excel",
  tabAdd: "Add Individually",
  close: "Close",
  existingLabel: "Student",
  existingPlaceholder: "Select a student",
  noExisting: "No unassigned students in your organization yet — import or add one below.",
  assign: "Assign to Class",
  assigning: "Assigning...",
  alreadyInAnotherClass:
    "This student is already assigned to another Class. Use Transfer from that Class's roster instead.",
  importHeading: "Import Learners",
  dropPrompt: "Drag a .xlsx file here or click to choose a file",
  checkFile: "Review File",
  reviewRows: "Rows found",
  createAccounts: "Create Accounts",
  creating: "Creating accounts",
  accountsCreated: "{count} account(s) created.",
  download: "Download Credentials",
  assignAll: "Assign to Class",
  assigningAll: "Assigning",
  assignErrorTitle: "Accounts created, but assignment failed — retry assigning",
  addIndividuallyHeading: "Add One Student",
  emailLabel: "Email",
  fullNameLabel: "Full name",
  studentCodeLabel: "Student code",
  phoneLabel: "Phone",
  dobLabel: "Date of birth",
  submit: "Add Student",
  submitting: "Adding...",
} as const;

export const PENDING_CLASS_ASSIGNMENT_TEXT = {
  recoveryTitle: "Unfinished import found",
  recoveryText:
    "Accounts were created but not yet confirmed assigned to this Class. Download the credentials if you haven't, then retry assigning.",
  redownload: "Re-download Credentials",
  retryAssign: "Retry Assigning",
  dismiss: "Dismiss (I'll assign these separately)",
} as const;

export const LECTURER_ASSIGNMENTS_QUERY_KEY = ["lecturerAssignments"] as const;

export const LECTURER_SECTION_TEXT = {
  title: "Lecturers",
  addButton: "+ Add Lecturer",
  emptyTitle: "No lecturers assigned yet",
  assignedCount: (count: number) => `${count} lecturer(s) assigned`,
  unassign: "Remove from Class",
} as const;

export const LECTURER_TABLE_HEADERS = {
  FULL_NAME: "Full name",
  EMAIL: "Email",
  ACTIONS: "Action",
} as const;

export const ASSIGN_LECTURER_TEXT = {
  title: "Add Lecturer to Class",
  tabExisting: "Pick Existing",
  tabNew: "Create New",
  existingLabel: "Lecturer",
  existingPlaceholder: "Select a lecturer",
  noExisting: "No existing lecturers in your organization yet — create one below.",
  emailLabel: "Email",
  emailPlaceholder: "lecturer@school.edu.vn",
  fullNameLabel: "Full name",
  passwordLabel: "Password",
  passwordHelper: "At least 8 characters. Share this with the lecturer directly.",
  cancel: "Cancel",
  submit: "Add to Class",
  submitting: "Adding...",
} as const;

export const CREATE_LECTURER_ERRORS = {
  emailRequired: "Email is required.",
  emailInvalid: "Enter a valid email address.",
  fullNameRequired: "Full name is required.",
  passwordTooShort: "Password must be at least 8 characters.",
} as const;

export const EMPTY_CREATE_LECTURER = { email: "", fullName: "", password: "" } as const;

export const TRANSFER_STUDENT_TEXT = {
  title: (label: string) => `Transfer from ${label}`,
  targetLabel: "Target Class",
  targetPlaceholder: "Select a Class",
  cancel: "Cancel",
  submit: "Transfer",
  submitting: "Transferring...",
  pendingEnrollmentTitle: "This student has upcoming exam enrollment(s)",
  pendingEnrollmentText:
    "Transferring will not change or cancel these — the Host may want to review them separately:",
} as const;

export const MERGE_CLASSES_SELECTION_TEXT = {
  startButton: (label: string) => `Merge ${label}s`,
  cancelSelection: "Cancel",
  selectedCount: (count: number) => `${count} selected`,
  confirmButton: "Merge Selected",
  needAtLeastTwo: "Select at least 2 to merge.",
} as const;

export const MERGE_CLASSES_TEXT = {
  title: (label: string) => `Merge ${label}s`,
  destinationLabel: (label: string) => `Merge into which ${label.toLowerCase()}?`,
  sourcesLabel: (label: string) => `The rest will be merged into it and their students moved. The source ${label.toLowerCase()}(s) themselves are not archived — archive them separately afterward if you want.`,
  cancel: "Cancel",
  submit: "Merge",
  submitting: "Merging...",
  successTitle: (count: number) => `${count} student(s) moved.`,
  done: "Done",
} as const;

export const SPLIT_CLASS_SELECTION_TEXT = {
  startButton: "Split Class",
  cancelSelection: "Cancel",
  selectedCount: (count: number) => `${count} selected`,
  confirmButton: "Split Selected",
  needAtLeastOne: "Select at least 1 student to move into the new Class.",
} as const;

export const SPLIT_CLASS_TEXT = {
  title: (label: string) => `Split ${label}`,
  newClassNameLabel: (label: string) => `New ${label} name`,
  newClassNamePlaceholder: "e.g. 12A2",
  movingCount: (count: number) => `${count} student(s) will move to the new Class.`,
  cancel: "Cancel",
  submit: "Split",
  submitting: "Splitting...",
  successTitle: (count: number, className: string) => `${count} student(s) moved to "${className}".`,
  done: "Done",
} as const;

export const SPLIT_CLASS_ERRORS = {
  newClassNameRequired: (label: string) => `New ${label.toLowerCase()} name is required.`,
} as const;

export const CLASS_MEMBERSHIPS_QUERY_KEY = ["classMemberships"] as const;
export const STUDENT_ROSTER_QUERY_KEY = ["studentRoster"] as const;

export const STUDENT_SEARCH_TEXT = {
  title: "Students",
  subtitle:
    "Search for a student across your entire organization — no need to pick a Program/Class first.",
  placeholder: "Search by name or phone number",
  emptyTitle: "No students found",
  emptyText: "Try a different name or phone number.",
  unassigned: "Unassigned",
} as const;

export const STUDENT_SEARCH_ACTIONS_TEXT = {
  add: "Add student",
  import: "Import students",
} as const;

export const MANAGE_STUDENTS_TEXT = {
  title: "Add students",
  tabAdd: "Add student",
  tabImport: "Import students",
  scopeNote: "Students are created in your organization. Assign them to a Class separately.",
  emailLabel: "Email",
  fullNameLabel: "Full name",
  studentCodeLabel: "Student code",
  classLabel: "Class",
  phoneLabel: "Phone",
  dateOfBirthLabel: "Date of birth",
  addSubmit: "Add student",
  adding: "Adding...",
  fileLabel: "Student roster (.xlsx)",
  fileDescription: "Drag an .xlsx file here or choose a file from your computer",
  reviewFile: "Review file",
  rowsFound: (count: number) => `${count} row(s) ready to import`,
  reviewEmail: "Email",
  reviewName: "Full name",
  createAccounts: "Create student accounts",
  creatingAccounts: "Creating accounts...",
  accountsCreated: (count: number) => `${count} student account(s) created.`,
  downloadCredentials: "Download credentials",
  noAccountsCreated: "No new accounts were created.",
  close: "Close",
} as const;

export const STUDENT_SEARCH_TABLE_HEADERS = {
  NAME: "Full name",
  CODE: "Student code",
  EMAIL: "Email",
  PHONE: "Phone",
  CLASS: "Class",
  PROGRAM: "Program",
  STATUS: "Status",
} as const;

export const STUDENT_ROSTER_FILTER_TEXT = {
  searchPlaceholder: "Search by name, email, phone, or student code",
  organizationLabel: "Organization",
  programLabel: "Program",
  programPlaceholder: "All programs",
  classLabel: "Class",
  classPlaceholder: "All classes",
  assignmentLabel: "Assignment",
  assignmentAll: "All students",
  assignmentAssigned: "Assigned",
  assignmentUnassigned: "Unassigned",
  sortLabel: "Sort by",
  sortCreatedAt: "Newest first",
  sortFullName: "Full name",
  sortStudentCode: "Student code",
  directionLabel: "Direction",
  ascending: "A–Z / oldest",
  descending: "Z–A / newest",
  pageSizeLabel: "Rows per page",
  firstPage: "First",
  lastPage: "Last",
  totalItems: (count: number) => `${count} student(s)`,
  statusActive: "Active",
  statusSuspended: "Suspended",
  suspend: "Suspend",
  reactivate: "Reactivate",
  actions: "Actions",
  loadFailed: "Unable to load students. Please try again.",
  emptyDescription: "No students match the current search and filters.",
  noPrograms: "No programs available",
  noClasses: "Select a program first",
  syncing: "Updating the roster…",
  confirmSuspendTitle: "Suspend student account",
  confirmSuspendDescription: (fullName: string) =>
    `Suspend ${fullName}'s account? They will not be able to sign in until reactivated.`,
  confirm: "Suspend account",
  cancel: "Cancel",
} as const;

export const STUDENT_ROSTER_SORT_OPTIONS = [
  { value: "CREATED_AT_DESC", label: "Recently added", sort: "CREATED_AT", direction: "DESC" },
  { value: "FULL_NAME_ASC", label: "Full name: A–Z", sort: "FULL_NAME", direction: "ASC" },
  { value: "FULL_NAME_DESC", label: "Full name: Z–A", sort: "FULL_NAME", direction: "DESC" },
  {
    value: "STUDENT_CODE_ASC",
    label: "Student code: A–Z",
    sort: "STUDENT_CODE",
    direction: "ASC",
  },
  {
    value: "STUDENT_CODE_DESC",
    label: "Student code: Z–A",
    sort: "STUDENT_CODE",
    direction: "DESC",
  },
] as const;

export const STUDENT_ROSTER_PAGE_SIZE_OPTIONS = [20, 50, 100] as const;

export const STUDENT_STATUS_LABELS = {
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
} as const;

export const STUDENT_STATUS_VARIANT = {
  ACTIVE: "success",
  SUSPENDED: "warning",
} as const;

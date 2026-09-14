export const CLASS_MEMBERSHIPS_QUERY_KEY = ["classMemberships"] as const;

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
  PHONE: "Phone",
  CLASS: "Class",
  PROGRAM: "Program",
} as const;

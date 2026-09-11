export const CLASS_MEMBERSHIPS_QUERY_KEY = ["classMemberships"] as const;

export const STUDENT_SEARCH_TEXT = {
  title: "Students",
  subtitle: "Search for a student across your entire organization — no need to pick a Program/Class first.",
  placeholder: "Search by name or phone number",
  emptyTitle: "No students found",
  emptyText: "Try a different name or phone number.",
  unassigned: "Unassigned",
} as const;

export const STUDENT_SEARCH_TABLE_HEADERS = {
  NAME: "Full name",
  PHONE: "Phone",
  CLASS: "Class",
  PROGRAM: "Program",
} as const;

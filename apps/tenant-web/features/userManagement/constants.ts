export const USER_MANAGEMENT_TEXT = {
  ACCOUNT_DETAILS_TITLE: "Account details",
  PASSWORDS_NOT_SHOWN:
    "Existing passwords are never shown here. Use the available credential action to issue a fresh temporary password; it will be shown only once.",
  USERNAME: "Username",
  EMAIL: "Email",
  FULL_NAME: "Full name",
  ROLES: "Roles",
  STATUS: "Status",
  PASSWORD_CHANGE: "First-login password change",
  STUDENT_CODE: "Student code",
  CLASS: "Class",
  PHONE: "Phone",
  DATE_OF_BIRTH: "Date of birth",
  SUSPENDED: "Suspended",
  ACTIVE: "Active",
  REQUIRED: "Required",
  NOT_REQUIRED: "Not required",
  EMPTY_VALUE: "—",
  CREDENTIALS_TITLE: "Temporary credentials",
  DONE: "Done",
  EMAIL_DELIVERY: (email: string) =>
    `The temporary password was generated and queued to ${email}. Save it now; it will not be shown again.`,
  NO_EMAIL_DELIVERY:
    "The temporary password was generated without email delivery. Save it now; it will not be shown again.",
  TEMPORARY_PASSWORD: "Temporary password",
} as const;

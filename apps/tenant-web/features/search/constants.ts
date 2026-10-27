export const TENANT_SEARCH_TEXT = {
  auditLog: {
    placeholder: "Search by resource name, code, action, or summary",
    ariaLabel: "Search system log by resource name, code, action, or summary",
  },
  supportTickets: {
    placeholder: "Search by ticket ID, description, category, or status",
    ariaLabel: "Search support tickets by ticket ID, description, category, or status",
  },
  classes: {
    placeholder: "Search by class name, program, or status",
    ariaLabel: "Search classes by name, program, or status",
  },
  classSection: {
    placeholder: "Search by class name or status",
    ariaLabel: "Search classes by name or status",
  },
  className: {
    placeholder: "Search by class name",
    ariaLabel: "Search classes by name",
  },
  students: {
    placeholder: "Search by name, email, phone, or student code",
    ariaLabel: "Search students by name, email, phone, or student code",
  },
  roster: {
    placeholder: "Search by name, email, or student code",
    ariaLabel: "Search students by name, email, or student code",
  },
  liveMonitoring: {
    placeholder: "Search by attempt ID, student name, or status",
    ariaLabel: "Search live attempts by ID, student name, or status",
  },
  programs: {
    placeholder: "Search by program name or status",
    ariaLabel: "Search programs by name or status",
  },
  orders: {
    placeholder: "Search by order code, plan name, or status",
    ariaLabel: "Search orders by order code, plan name, or status",
  },
  answers: {
    placeholder: "Search by answer ID, task type, or status",
    ariaLabel: "Search answers by answer ID, task type, or status",
  },
  examinerRoster: {
    placeholder: "Search by student name or email",
    ariaLabel: "Search students by name or email",
  },
  proctors: {
    placeholder: "Search by proctor name, email, or role",
    ariaLabel: "Search proctors by name, email, or role",
  },
  sessions: {
    placeholder: "Search by exam name, session code, or status",
    ariaLabel: "Search exam sessions by name, code, or status",
  },
} as const;

export type TenantSearchSurface = keyof typeof TENANT_SEARCH_TEXT;

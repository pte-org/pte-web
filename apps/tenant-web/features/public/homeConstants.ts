export const HOME_TEXT = {
  signIn: "Sign in",
  dashboard: "Open dashboard",
  plans: "Plans",
  examPackages: "Exam packages",
  studentCapacity: "Student capacity",
  currentlyUsing: "Currently using",
  skipContent: "Skip to content",
  navigation: "Main navigation",
  duration: (days: number) => `${days} days`,
  platform: "The platform",
  workflow: "How it works",
  getStarted: "Get started",
  eyebrow: "For PTE schools & training centers",
  title: "A little less admin.",
  titleAccent: "A lot more clarity.",
  description:
    "Bring your students, exam sessions, and results together. Give your team one place to prepare for the next exam day.",
  register: "Register your organization",
  reassurance: "Built around the way your team works.",
  rolesLabel: "One workspace for your team",
  roles: ["School administrators", "Exam coordinators", "Teachers & examiners"],
  workflowEyebrow: "From setup to exam day",
  workflowTitle: "Good preparation starts with the everyday details.",
  workflowDescription:
    "A straightforward path for your team, from adding the first student to reviewing the last result.",
  teamEyebrow: "Less back-and-forth",
  teamTitle: "Your team should be on the same page.",
  teamDescription:
    "Student records in one spreadsheet. Sessions in another. Results somewhere else. Bring the work together so your team can spend less time looking for the latest version.",
  teamLink: "Find the right access for your school",
  plansEyebrow: "Room for your next chapter",
  plansTitle: "Start with what you need.",
  plansDescription:
    "Choose exam access for your schedule. Add student capacity as your school grows.",
  examDescription: "Time-bound exam packages with a defined student limit per session.",
  capacityDescription: "Permanent capacity add-ons, purchased separately from your exam access.",
  plansLoading: "Loading plans...",
  plansError: "Plans could not be loaded. Please try again shortly.",
  plansEmpty: "No active plans are available right now.",
  choosePlan: "Choose this plan",
  permanent: "Permanent access",
  existingOrganization: "Existing organization?",
  manageSubscriptions: "Sign in to manage your subscriptions",
  closingTitle: "Make space for a smoother exam day.",
  closingDescription: "Start with your organization. Bring your team along.",
  footer: "Organization portal · Practice today. Higher tomorrow.",
} as const;

export const HOME_STEPS = [
  {
    label: "01 / ORGANIZE",
    title: "Know who’s taking part.",
    description:
      "Keep student details and class lists together. Build your roster before you build your next exam session.",
  },
  {
    label: "02 / COORDINATE",
    title: "Give every exam a plan.",
    description:
      "Set up sessions, assign your team, and make sure everyone knows where they need to be.",
  },
  {
    label: "03 / REVIEW",
    title: "See what comes next.",
    description:
      "Bring results back into the same workspace, ready for your team to review and follow up.",
  },
] as const;

// Marketing artwork is illustrative and never represents the signed-in organization's data.
export const HOME_PREVIEW = {
  label: "Illustrative exam management screen",
  sampleLabel: "Illustrative interface · Sample data",
  rosterLabel: "Student roster concept · Fictional names",
  windowTitle: "PTE Prep / Workspace",
  workspace: "Your workspace",
  title: "Ready for the week ahead.",
  avatar: "AL",
  navigation: ["Overview", "Students", "Exam sessions", "Results"],
  metrics: [
    { label: "Students", value: "128" },
    { label: "Upcoming sessions", value: "04" },
    { label: "Results available", value: "86" },
  ],
  upcoming: "Upcoming sessions",
  month: "OCT",
  sessions: [
    {
      day: "24",
      title: "PTE Academic · Morning",
      detail: "09:00 — 11:00 · 24 students",
      status: "Published",
    },
    {
      day: "26",
      title: "PTE Academic · Afternoon",
      detail: "14:00 — 16:00 · 18 students",
      status: "Draft",
    },
  ],
  annotation: "The details, all in one place.",
  annotationDetail: "One roster. Clear sessions. A shared view.",
  rosterTitle: "A class, ready for its next step.",
  rosterCount: "Class A · 3 shown",
  className: "Academic preparation · Class A",
  enrolled: "Enrolled",
  students: [
    { initials: "MA", name: "Minh Anh Nguyen" },
    { initials: "HL", name: "Hoang Long Tran" },
    { initials: "TP", name: "Thao Phuong Le" },
  ],
} as const;

export const HOME_LAYOUT = {
  container: "mx-auto w-full max-w-[1240px] px-6 lg:px-10",
  eyebrow:
    "mb-6 flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-action before:h-px before:w-6 before:bg-current before:content-['']",
  heading:
    "text-3xl font-medium leading-tight tracking-[-0.04em] text-[var(--home-navy)] sm:text-4xl",
  primaryLink:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-action px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-action-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-action",
  secondaryLink:
    "inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--home-border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--home-navy)] transition-colors hover:bg-[var(--home-paper)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-action",
  textLink:
    "inline-flex items-center gap-2 text-xs font-semibold text-action hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-action",
} as const;

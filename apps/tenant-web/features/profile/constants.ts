export const PROFILE_TEXT = {
  title: "Profile",
  loading: "Loading profile",
  loadFailed: "Could not load profile",
  loadFailedDescription: "Refresh and try again.",
  tabs: {
    organization: "Organization",
    personal: "Personal information",
    ariaLabel: "Profile sections",
  },
  organization: {
    title: "Organization information",
    description: "Organization details linked to your account.",
    edit: "Edit",
    save: "Save changes",
    cancel: "Cancel",
    saved: "Organization information updated.",
    saveFailed: "Could not update organization information. Try again.",
    nameRequired: "Enter the organization name.",
    name: "Organization name",
    type: "Organization type",
    facilityType: "Facility type",
    address: "Address",
    addressDetail: "Detailed address",
    addressPlaceholder: "House number, street, area...",
    province: "Province / city",
    ward: "Ward / commune",
    provincePlaceholder: "Select a province / city",
    wardPlaceholder: "Select a ward / commune",
    wardRequiresProvince: "Select a province / city first",
    notSelected: "Not selected",
    locationLoadFailed: "Could not load Vietnam address options. Try again.",
    status: "Status",
    emptyTitle: "No organization information",
    emptyDescription: "Your account is not linked to an organization.",
  },
  personal: {
    title: "Personal information",
    description: "Account information used in your organization.",
    edit: "Edit",
    save: "Save changes",
    cancel: "Cancel",
    saved: "Profile updated.",
    saveFailed: "Could not update your profile. Try again.",
    fullNameRequired: "Enter your full name.",
    fullName: "Full name",
    email: "Email",
    phone: "Phone number",
    dateOfBirth: "Date of birth",
    role: "Role",
    status: "Status",
  },
  status: {
    active: "Active",
    suspended: "Suspended",
  },
  roles: {
    HOST_ADMIN: "Organization administrator",
  },
  organizationTypes: {
    SCHOOL: "School",
    CENTER: "Center",
    UNIVERSITY: "University",
  },
  facilityTypes: {
    MAIN: "Main facility",
    BRANCH: "Branch",
    TEST_CENTER: "Test center",
  },
} as const;

export const PROFILE_LOCATION_STALE_TIME_MS = 86_400_000;

export const PROFILE_TAB_IDS = {
  organization: "organization",
  personal: "personal",
} as const;

export type ProfileTabId = (typeof PROFILE_TAB_IDS)[keyof typeof PROFILE_TAB_IDS];

export const PROFILE_LABEL_KEYS = {
  roles: {
    HOST_ADMIN: {
      key: "tenant.profile.roles.hostAdmin",
      fallback: PROFILE_TEXT.roles.HOST_ADMIN,
    },
  },
  organizationTypes: {
    SCHOOL: {
      key: "tenant.profile.organizationTypes.school",
      fallback: PROFILE_TEXT.organizationTypes.SCHOOL,
    },
    CENTER: {
      key: "tenant.profile.organizationTypes.center",
      fallback: PROFILE_TEXT.organizationTypes.CENTER,
    },
    UNIVERSITY: {
      key: "tenant.profile.organizationTypes.university",
      fallback: PROFILE_TEXT.organizationTypes.UNIVERSITY,
    },
  },
  facilityTypes: {
    MAIN: {
      key: "tenant.profile.facilityTypes.main",
      fallback: PROFILE_TEXT.facilityTypes.MAIN,
    },
    BRANCH: {
      key: "tenant.profile.facilityTypes.branch",
      fallback: PROFILE_TEXT.facilityTypes.BRANCH,
    },
    TEST_CENTER: {
      key: "tenant.profile.facilityTypes.testCenter",
      fallback: PROFILE_TEXT.facilityTypes.TEST_CENTER,
    },
  },
} as const;

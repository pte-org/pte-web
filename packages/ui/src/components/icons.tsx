import type { ReactElement } from "react";

interface IconProps {
  className?: string;
}

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const GridIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

export const HomeIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <path d="m3 10 9-7 9 7" />
    <path d="M5 9v11h14V9" />
    <path d="M9 20v-6h6v6" />
  </svg>
);

export const BuildingIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16" />
    <path d="M15 9h4a1 1 0 0 1 1 1v11" />
    <path d="M3 21h18" />
    <path d="M8 8h.01M11 8h.01M8 12h.01M11 12h.01M8 16h.01M11 16h.01" />
  </svg>
);

export const ClipboardIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <rect x="5" y="4" width="14" height="17" rx="2" />
    <path d="M9 4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2H9z" />
    <path d="M9 12h6M9 16h4" />
  </svg>
);

export const DocumentIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
    <path d="M14 3v5h5" />
    <path d="M9 13h6M9 17h6" />
  </svg>
);

export const LicenseIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
    <path d="M14 3v5h5" />
    <circle cx="12" cy="14" r="2" />
    <path d="M11 16l-1 3 2-1 2 1-1-3" />
  </svg>
);

export const UsersIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
    <path d="M16 5.5a3.2 3.2 0 0 1 0 6" />
    <path d="M17.5 20a5.5 5.5 0 0 0-3-4.9" />
  </svg>
);

export const AlertTriangleIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <path d="M12 4 2.5 20h19L12 4z" />
    <path d="M12 10v4M12 18h.01" />
  </svg>
);

export const GlobeIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" />
  </svg>
);

export const SunIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
  </svg>
);

export const MoonIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <path d="M20.5 15.2A8.5 8.5 0 0 1 8.8 3.5 8.5 8.5 0 1 0 20.5 15.2z" />
  </svg>
);

export const BellIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <path d="M6 9a6 6 0 0 1 12 0c0 4.5 1.8 5.6 1.8 5.6H4.2S6 13.5 6 9z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </svg>
);

export const BookOpenIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <path d="M12 6v14" />
    <path d="M12 6C10 4.3 6.5 4.3 3.5 5.2v13c3-.9 6.5-.9 8.5.8 2-1.7 5.5-1.7 8.5-.8v-13C17.5 4.3 14 4.3 12 6z" />
  </svg>
);

export const HeadphoneIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <path d="M4 14a8 8 0 0 1 16 0" />
    <rect x="3" y="13.5" width="4" height="7" rx="1.5" />
    <rect x="17" y="13.5" width="4" height="7" rx="1.5" />
  </svg>
);

export const MicIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <rect x="9" y="2" width="6" height="11" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0" />
    <path d="M12 17v4" />
    <path d="M8 21h8" />
  </svg>
);

export const PencilIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

export const CheckCircleIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12 3 3 5-6" />
  </svg>
);

export const InfoIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </svg>
);

export const CopyIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h8" />
  </svg>
);

export const DotsVerticalIcon = ({ className }: IconProps): ReactElement => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <circle cx="12" cy="5" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="12" cy="19" r="1.6" />
  </svg>
);

export const DotsHorizontalIcon = ({ className }: IconProps): ReactElement => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <circle cx="5" cy="12" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="19" cy="12" r="1.6" />
  </svg>
);

export const XIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const MenuIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const ChevronLeftIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <path d="m15 18-6-6 6-6" />
  </svg>
);

export const ChevronRightIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export const ChevronDownIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const UploadIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <path d="M12 16V4" />
    <path d="m7 9 5-5 5 5" />
    <path d="M5 20h14" />
  </svg>
);

export const SearchIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <circle cx="11" cy="11" r="7" />
    <path d="m16 16 4 4" />
  </svg>
);

export const BanIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="m5.5 5.5 13 13" />
  </svg>
);

export const TrashIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <path d="M4 7h16" />
    <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
    <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

export const ShieldIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const FolderPlusIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    <path d="M12 11v6M9 14h6" />
  </svg>
);

const softNavigationBase = {
  viewBox: "0 0 18 18",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const NavDashboardIcon = ({ className }: IconProps): ReactElement => (
  <svg {...softNavigationBase} className={className}>
    <rect x="2.5" y="2.5" width="5" height="5" rx="1.25" />
    <rect x="10.5" y="2.5" width="5" height="5" rx="1.25" />
    <rect x="2.5" y="10.5" width="5" height="5" rx="1.25" />
    <rect x="10.5" y="10.5" width="5" height="5" rx="1.25" />
  </svg>
);

export const NavUserGroupIcon = ({ className }: IconProps): ReactElement => (
  <svg {...softNavigationBase} className={className}>
    <circle cx="9" cy="5.25" r="2.5" />
    <path d="M4.25 15.75c.35-2.35 1.8-3.75 4.75-3.75s4.4 1.4 4.75 3.75" />
    <path d="M3.25 7.5a2.25 2.25 0 0 0 0 4.25M14.75 7.5a2.25 2.25 0 0 1 0 4.25" />
  </svg>
);

export const NavUserIcon = ({ className }: IconProps): ReactElement => (
  <svg {...softNavigationBase} className={className}>
    <circle cx="9" cy="5.25" r="2.5" />
    <path d="M4.25 15.75c.35-2.35 1.8-3.75 4.75-3.75s4.4 1.4 4.75 3.75" />
  </svg>
);

export const NavClassIcon = ({ className }: IconProps): ReactElement => (
  <svg {...softNavigationBase} className={className}>
    <rect x="2.5" y="2.5" width="5" height="5" rx="1" />
    <rect x="10.5" y="2.5" width="5" height="5" rx="1" />
    <rect x="2.5" y="10.5" width="5" height="5" rx="1" />
    <path d="M10.5 10.5h5v5h-5zM13 12v2M12 13h2" />
  </svg>
);

export const NavAuditLogIcon = ({ className }: IconProps): ReactElement => (
  <svg {...softNavigationBase} className={className}>
    <rect x="3" y="2.5" width="12" height="13" rx="1.5" />
    <path d="M6 6h.01M8.5 6h4M6 9h.01M8.5 9h4M6 12h.01M8.5 12h2.5" />
  </svg>
);

export const NavBillingIcon = ({ className }: IconProps): ReactElement => (
  <svg {...softNavigationBase} className={className}>
    <rect x="2.5" y="4" width="13" height="10" rx="1.5" />
    <path d="M2.5 7.25h13M5.5 11h2.25" />
  </svg>
);

export const NavTenantIcon = ({ className }: IconProps): ReactElement => (
  <svg {...softNavigationBase} className={className}>
    <path d="M2.75 15.75h12.5" />
    <path d="M4.25 15.75V3.5a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v12.25" />
    <path d="M10.25 7h2.75a.75.75 0 0 1 .75.75v8" />
    <path d="M6.25 6.25h.01M8.25 6.25h.01M6.25 9h.01M8.25 9h.01M6.25 11.75h.01M8.25 11.75h.01" />
  </svg>
);

export const NavApplicationIcon = ({ className }: IconProps): ReactElement => (
  <svg {...softNavigationBase} className={className}>
    <path d="M4.25 2.25h5.5l3.5 3.5v9.5a.5.5 0 0 1-.5.5h-8.5a.5.5 0 0 1-.5-.5v-12.5a.5.5 0 0 1 .5-.5Z" />
    <path d="M9.75 2.25v3.5h3.5" />
    <path d="m6.25 10 1.25 1.25 2.75-2.75" />
  </svg>
);

export const NavPlanCatalogIcon = ({ className }: IconProps): ReactElement => (
  <svg {...softNavigationBase} className={className}>
    <path d="m9 2.25 6 3.25-6 3.25-6-3.25 6-3.25Z" />
    <path d="m3 9 6 3.25L15 9" />
    <path d="m3 12.75 6 3.25 6-3.25" />
  </svg>
);

export const NavLicenseCodeIcon = ({ className }: IconProps): ReactElement => (
  <svg {...softNavigationBase} className={className}>
    <circle cx="5.25" cy="9" r="2.25" />
    <path d="m6.9 10.6 8.1-8.1" />
    <path d="m10.75 6.75 1.75 1.75M12.5 5l1.75 1.75" />
  </svg>
);

export const NavSettingsIcon = ({ className }: IconProps): ReactElement => (
  <svg {...softNavigationBase} className={className}>
    <circle cx="9" cy="9" r="2.25" />
    <path d="M9 1.75v1.5M9 14.75v1.5M1.75 9h1.5M14.75 9h1.5M3.87 3.87l1.06 1.06M13.07 13.07l1.06 1.06M14.13 3.87l-1.06 1.06M4.93 13.07l-1.06 1.06" />
  </svg>
);

export const NavAnnouncementIcon = ({ className }: IconProps): ReactElement => (
  <svg {...softNavigationBase} className={className}>
    <path d="m2.25 8.25 11.25-3.75v9L2.25 9.75a.75.75 0 0 1 0-1.5Z" />
    <path d="M13.5 7h1.5a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5h-1.5" />
    <path d="m4.25 10.5 1.5 4.5h1.5L6 10.25" />
  </svg>
);

export const NavQuestionBankIcon = ({ className }: IconProps): ReactElement => (
  <svg {...softNavigationBase} className={className}>
    <path d="M9 4.25v11.5" />
    <path d="M9 4.25C7.3 2.9 4.6 2.9 2.5 3.7v10.8c2.1-.8 4.8-.8 6.5.5 1.7-1.3 4.4-1.3 6.5-.5V3.7c-2.1-.8-4.8-.8-6.5.55Z" />
  </svg>
);

export const NavTaskTypeIcon = ({ className }: IconProps): ReactElement => (
  <svg {...softNavigationBase} className={className}>
    <rect x="2.5" y="2.5" width="13" height="13" rx="2" />
    <path d="m5 6 1 1 1.75-2M9.5 6h3.5M5 10l1 1 1.75-2M9.5 10h3.5M5 14l1 1 1.75-2M9.5 14h3.5" />
  </svg>
);

export const NavExamTemplateIcon = ({ className }: IconProps): ReactElement => (
  <svg {...softNavigationBase} className={className}>
    <rect x="2.25" y="3.5" width="13.5" height="12.25" rx="1.5" />
    <path d="M5.25 2.25v2.5M12.75 2.25v2.5M2.25 7h13.5" />
    <path d="M5.25 10h.01M9 10h.01M12.75 10h.01M5.25 13h.01M9 13h.01" />
  </svg>
);

export const NavSupportTicketIcon = ({ className }: IconProps): ReactElement => (
  <svg {...softNavigationBase} className={className}>
    <path d="M3 3.75h12a1.5 1.5 0 0 1 1.5 1.5v7.5a1.5 1.5 0 0 1-1.5 1.5H9l-3.5 2.5v-2.5H3a1.5 1.5 0 0 1-1.5-1.5v-7.5A1.5 1.5 0 0 1 3 3.75Z" />
    <path d="M6 8.75h.01M9 8.75h.01M12 8.75h.01" />
  </svg>
);

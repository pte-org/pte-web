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
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="5" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="12" cy="19" r="1.6" />
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

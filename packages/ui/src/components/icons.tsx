import type { ReactElement } from "react";
import {
  NextAdminAltArrowDownIcon,
  NextAdminAltArrowLeftIcon,
  NextAdminAltArrowRightIcon,
  NextAdminAlphabetIcon,
  NextAdminAuthIcon,
  NextAdminCalendarIcon,
  NextAdminCloseIcon,
  NextAdminHomeIcon,
  NextAdminLetterIcon,
  NextAdminLogoutIcon,
  NextAdminMenuDotsIcon,
  NextAdminSearchIcon,
  NextAdminTableIcon,
  NextAdminThreeDots,
  NextAdminUserGroupIcon,
  NextAdminUserIcon,
  NextAdminWidget4Icon,
  NextAdminWindowIcon,
} from "./nextAdminIcons";

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

const dashboardHeaderIconBase = {
  viewBox: "0 0 20 20",
  fill: "none",
  "aria-hidden": true,
};

export const GridIcon = ({ className }: IconProps): ReactElement => (
  <NextAdminWidget4Icon className={className} />
);

export const HomeIcon = ({ className }: IconProps): ReactElement => (
  <NextAdminHomeIcon className={className} />
);

export const BuildingIcon = ({ className }: IconProps): ReactElement => (
  <NextAdminWindowIcon className={className} />
);

export const ClipboardIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <rect x="5" y="4" width="14" height="17" rx="2" />
    <path d="M9 4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2H9z" />
    <path d="M9 12h6M9 16h4" />
  </svg>
);

export const DocumentIcon = ({ className }: IconProps): ReactElement => (
  <NextAdminLetterIcon className={className} />
);

export const LicenseIcon = ({ className }: IconProps): ReactElement => (
  <NextAdminAuthIcon className={className} />
);

export const UsersIcon = ({ className }: IconProps): ReactElement => (
  <NextAdminUserGroupIcon className={className} />
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

/** Filled header icons shared with the NextAdmin dashboard reference. */
export const SunIcon = ({ className }: IconProps): ReactElement => (
  <svg {...dashboardHeaderIconBase} className={className}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.18124 2.33448C5.30901 2.74335 2.29175 6.01923 2.29175 9.99984C2.29175 14.257 5.74289 17.7082 10.0001 17.7082C13.9807 17.7082 17.2566 14.6909 17.6654 10.8187C16.5598 12.2222 14.8439 13.1248 12.9167 13.1248C9.58003 13.1248 6.87508 10.4199 6.87508 7.08317C6.87508 5.15599 7.77771 3.44009 9.18124 2.33448ZM1.04175 9.99984C1.04175 5.05229 5.05253 1.0415 10.0001 1.0415C10.5973 1.0415 10.8962 1.51755 10.9475 1.89673C10.9967 2.26148 10.8619 2.72538 10.4426 2.97873C9.05229 3.81884 8.12508 5.34302 8.12508 7.08317C8.12508 9.72954 10.2704 11.8748 12.9167 11.8748C14.6569 11.8748 16.1811 10.9476 17.0212 9.55731C17.2745 9.13804 17.7384 9.00321 18.1032 9.05247C18.4824 9.10368 18.9584 9.40265 18.9584 9.99984C18.9584 14.9474 14.9476 18.9582 10.0001 18.9582C5.05253 18.9582 1.04175 14.9474 1.04175 9.99984Z"
      fill="currentColor"
    />
  </svg>
);

export const MoonIcon = ({ className }: IconProps): ReactElement => (
  <svg {...dashboardHeaderIconBase} className={className}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.18112 2.33473C5.30889 2.74359 2.29163 6.01948 2.29163 10.0001C2.29163 14.2573 5.74276 17.7084 9.99996 17.7084C13.9806 17.7084 17.2564 14.6912 17.6653 10.8189C16.5597 12.2225 14.8438 13.1251 12.9166 13.1251C9.57991 13.1251 6.87496 10.4201 6.87496 7.08341C6.87496 5.15623 7.77759 3.44033 9.18112 2.33473ZM1.04163 10.0001C1.04163 5.05253 5.05241 1.04175 9.99996 1.04175C10.5972 1.04175 10.8961 1.5178 10.9473 1.89697C10.9966 2.26173 10.8618 2.72563 10.4425 2.97897C9.05217 3.81909 8.12496 5.34327 8.12496 7.08341C8.12496 9.72978 10.2703 11.8751 12.9166 11.8751C14.6568 11.8751 16.181 10.9479 17.0211 9.55755C17.2744 9.13828 17.7383 9.00345 18.1031 9.05271C18.4822 9.10392 18.9583 9.40289 18.9583 10.0001C18.9583 14.9476 14.9475 18.9584 9.99996 18.9584C5.05241 18.9584 1.04163 14.9476 1.04163 10.0001Z"
      fill="currentColor"
      fillOpacity="0.9"
    />
  </svg>
);

export const BellIcon = ({ className }: IconProps): ReactElement => (
  <svg {...dashboardHeaderIconBase} className={className}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.99999 1.0415C6.43315 1.0415 3.54166 3.933 3.54166 7.49984V8.08659C3.54166 8.66736 3.36975 9.23513 3.0476 9.71836L2.09043 11.1541C0.979516 12.8205 1.82761 15.0855 3.75977 15.6125C4.38944 15.7842 5.02444 15.9294 5.66311 16.0482L5.66469 16.0525C6.30552 17.7624 8.01828 18.9582 9.99994 18.9582C11.9816 18.9582 13.6944 17.7624 14.3352 16.0525L14.3368 16.0483C14.9755 15.9295 15.6105 15.7842 16.2402 15.6125C18.1724 15.0855 19.0205 12.8205 17.9096 11.1541L16.9524 9.71836C16.6302 9.23513 16.4583 8.66736 16.4583 8.08659V7.49984C16.4583 3.933 13.5668 1.0415 9.99999 1.0415ZM12.8137 16.2806C10.9445 16.504 9.05533 16.504 7.1862 16.2806C7.77866 17.1319 8.80914 17.7082 9.99994 17.7082C11.1907 17.7082 12.2212 17.1319 12.8137 16.2806ZM4.79166 7.49984C4.79166 4.62335 7.12351 2.2915 9.99999 2.2915C12.8765 2.2915 15.2083 4.62335 15.2083 7.49984V8.08659C15.2083 8.91414 15.4533 9.72317 15.9123 10.4117L16.8695 11.8475C17.5071 12.804 17.0205 14.104 15.9113 14.4065C12.0411 15.462 7.95887 15.462 4.08866 14.4065C2.97964 14.104 2.49285 12.804 3.13049 11.8475L4.08766 10.4117C4.5467 9.72317 4.79166 8.91414 4.79166 8.08659V7.49984Z"
      fill="currentColor"
    />
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

/** NextAdmin calls this action glyph MenuDotsIcon. It is horizontal in the reference. */
export const DotsVerticalIcon = ({ className }: IconProps): ReactElement => (
  <NextAdminMenuDotsIcon className={className} />
);

export const DotsHorizontalIcon = ({ className }: IconProps): ReactElement => (
  <NextAdminThreeDots className={className} />
);

export const XIcon = ({ className }: IconProps): ReactElement => (
  <NextAdminCloseIcon className={className} />
);

export const MenuIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const ChevronLeftIcon = ({ className }: IconProps): ReactElement => (
  <NextAdminAltArrowLeftIcon className={className} />
);

export const ChevronRightIcon = ({ className }: IconProps): ReactElement => (
  <NextAdminAltArrowRightIcon className={className} />
);

export const ChevronDownIcon = ({ className }: IconProps): ReactElement => (
  <NextAdminAltArrowDownIcon className={className} />
);

export const UserCircleIcon = ({ className }: IconProps): ReactElement => (
  <NextAdminUserIcon className={className} />
);

export const SettingsIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.1h-2.5v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H6.5v-2.5h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.1H15v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1V14h-.1a1.7 1.7 0 0 0-1.5 1Z" />
  </svg>
);

export const BillingIcon = ({ className }: IconProps): ReactElement => (
  <NextAdminTableIcon className={className} />
);

export const LogoutIcon = ({ className }: IconProps): ReactElement => (
  <NextAdminLogoutIcon className={className} />
);

export const UploadIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <path d="M12 16V4" />
    <path d="m7 9 5-5 5 5" />
    <path d="M5 20h14" />
  </svg>
);

export const SearchIcon = ({ className }: IconProps): ReactElement => (
  <NextAdminSearchIcon className={className} />
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

export const NavDashboardIcon = ({ className }: IconProps): ReactElement => (
  <NextAdminHomeIcon className={className} />
);

export const NavUserGroupIcon = ({ className }: IconProps): ReactElement => (
  <NextAdminUserGroupIcon className={className} />
);

export const NavUserIcon = ({ className }: IconProps): ReactElement => (
  <NextAdminUserIcon className={className} />
);

export const NavClassIcon = ({ className }: IconProps): ReactElement => (
  <NextAdminTableIcon className={className} />
);

export const NavAuditLogIcon = ({ className }: IconProps): ReactElement => (
  <NextAdminAlphabetIcon className={className} />
);

export const NavBillingIcon = ({ className }: IconProps): ReactElement => (
  <NextAdminTableIcon className={className} />
);

export const NavTenantIcon = ({ className }: IconProps): ReactElement => (
  <NextAdminWindowIcon className={className} />
);

export const NavApplicationIcon = ({ className }: IconProps): ReactElement => (
  <NextAdminLetterIcon className={className} />
);

export const NavPlanCatalogIcon = ({ className }: IconProps): ReactElement => (
  <NextAdminWidget4Icon className={className} />
);

export const NavLicenseCodeIcon = ({ className }: IconProps): ReactElement => (
  <NextAdminAuthIcon className={className} />
);

export const NavSettingsIcon = ({ className }: IconProps): ReactElement => (
  <NextAdminWidget4Icon className={className} />
);

export const NavAnnouncementIcon = ({ className }: IconProps): ReactElement => (
  <NextAdminLetterIcon className={className} />
);

export const NavQuestionBankIcon = ({ className }: IconProps): ReactElement => (
  <NextAdminAlphabetIcon className={className} />
);

export const NavTaskTypeIcon = ({ className }: IconProps): ReactElement => (
  <NextAdminAlphabetIcon className={className} />
);

export const NavExamTemplateIcon = ({ className }: IconProps): ReactElement => (
  <NextAdminCalendarIcon className={className} />
);

export const NavSupportTicketIcon = ({ className }: IconProps): ReactElement => (
  <NextAdminLetterIcon className={className} />
);

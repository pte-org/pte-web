import type { ReactElement } from "react";

interface SidebarIconProps { className?: string }

/** Lucide geometry; ISC/MIT notices in packages/ui/licenses/lucide.txt.
 * Inherit the sidebar size and color, using PTE's existing outline weight.
 */
const SIDEBAR_ICON_PROPS = {
  width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8,
  strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, focusable: false,
} as const;

/** https://lucide.dev/icons/building */
export const OrganizationIcon = ({ className }: SidebarIconProps): ReactElement => (
  <svg {...SIDEBAR_ICON_PROPS} className={className}>
    <path d="M12 10h.01" />
    <path d="M12 14h.01" />
    <path d="M12 6h.01" />
    <path d="M16 10h.01" />
    <path d="M16 14h.01" />
    <path d="M16 6h.01" />
    <path d="M8 10h.01" />
    <path d="M8 14h.01" />
    <path d="M8 6h.01" />
    <path d="M9 22v-3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
    <rect x="4" y="2" width="16" height="20" rx="2" />
  </svg>
);

/** https://lucide.dev/icons/package */
export const PackageIcon = ({ className }: SidebarIconProps): ReactElement => (
  <svg {...SIDEBAR_ICON_PROPS} className={className}>
    <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
    <path d="M12 22V12" />
    <polyline points="3.29 7 12 12 20.71 7" />
    <path d="m7.5 4.27 9 5.15" />
  </svg>
);

/** https://lucide.dev/icons/key-round */
export const KeyRoundIcon = ({ className }: SidebarIconProps): ReactElement => (
  <svg {...SIDEBAR_ICON_PROPS} className={className}>
    <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" />
    <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
  </svg>
);

/** https://lucide.dev/icons/panels-top-left */
export const PanelsTopLeftIcon = ({ className }: SidebarIconProps): ReactElement => (
  <svg {...SIDEBAR_ICON_PROPS} className={className}>
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M3 9h18" />
    <path d="M9 21V9" />
  </svg>
);

/** https://lucide.dev/icons/shapes */
export const ShapesIcon = ({ className }: SidebarIconProps): ReactElement => (
  <svg {...SIDEBAR_ICON_PROPS} className={className}>
    <path d="M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <circle cx="17.5" cy="17.5" r="3.5" />
  </svg>
);

/** https://lucide.dev/icons/layout-template */
export const LayoutTemplateIcon = ({ className }: SidebarIconProps): ReactElement => (
  <svg {...SIDEBAR_ICON_PROPS} className={className}>
    <rect width="18" height="7" x="3" y="3" rx="1" />
    <rect width="9" height="7" x="3" y="14" rx="1" />
    <rect width="5" height="7" x="16" y="14" rx="1" />
  </svg>
);

/** https://lucide.dev/icons/sliders-horizontal */
export const SlidersHorizontalIcon = ({ className }: SidebarIconProps): ReactElement => (
  <svg {...SIDEBAR_ICON_PROPS} className={className}>
    <path d="M10 5H3" />
    <path d="M12 19H3" />
    <path d="M14 3v4" />
    <path d="M16 17v4" />
    <path d="M21 12h-9" />
    <path d="M21 19h-5" />
    <path d="M21 5h-7" />
    <path d="M8 10v4" />
    <path d="M8 12H3" />
  </svg>
);

/** https://lucide.dev/icons/calculator */
export const CalculatorIcon = ({ className }: SidebarIconProps): ReactElement => (
  <svg {...SIDEBAR_ICON_PROPS} className={className}>
    <rect width="16" height="20" x="4" y="2" rx="2" />
    <line x1="8" x2="16" y1="6" y2="6" />
    <line x1="16" x2="16" y1="14" y2="18" />
    <path d="M16 10h.01" />
    <path d="M12 10h.01" />
    <path d="M8 10h.01" />
    <path d="M12 14h.01" />
    <path d="M8 14h.01" />
    <path d="M12 18h.01" />
    <path d="M8 18h.01" />
  </svg>
);

/** https://lucide.dev/icons/library-big */
export const LibraryBigIcon = ({ className }: SidebarIconProps): ReactElement => (
  <svg {...SIDEBAR_ICON_PROPS} className={className}>
    <rect width="8" height="18" x="3" y="3" rx="1" />
    <path d="M7 3v18" />
    <path d="M20.4 18.9c.2.5-.1 1.1-.6 1.3l-1.9.7c-.5.2-1.1-.1-1.3-.6L11.1 5.1c-.2-.5.1-1.1.6-1.3l1.9-.7c.5-.2 1.1.1 1.3.6Z" />
  </svg>
);

/** https://lucide.dev/icons/settings */
export const GearIcon = ({ className }: SidebarIconProps): ReactElement => (
  <svg {...SIDEBAR_ICON_PROPS} className={className}>
    <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

/** https://lucide.dev/icons/headset */
export const HeadsetIcon = ({ className }: SidebarIconProps): ReactElement => (
  <svg {...SIDEBAR_ICON_PROPS} className={className}>
    <path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z" />
    <path d="M21 16v2a4 4 0 0 1-4 4h-5" />
  </svg>
);

/** https://lucide.dev/icons/rotate-ccw-clock */
export const HistoryIcon = ({ className }: SidebarIconProps): ReactElement => (
  <svg {...SIDEBAR_ICON_PROPS} className={className}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </svg>
);

/** https://lucide.dev/icons/message-square-text */
export const MessageSquareTextIcon = ({ className }: SidebarIconProps): ReactElement => (
  <svg {...SIDEBAR_ICON_PROPS} className={className}>
    <path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z" />
    <path d="M7 11h10" />
    <path d="M7 15h6" />
    <path d="M7 7h8" />
  </svg>
);

/** https://lucide.dev/icons/sparkles */
export const SparklesIcon = ({ className }: SidebarIconProps): ReactElement => (
  <svg {...SIDEBAR_ICON_PROPS} className={className}>
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    <path d="M20 3v4" />
    <path d="M22 5h-4" />
    <path d="M4 17v2" />
    <path d="M5 18H3" />
  </svg>
);

/** https://lucide.dev/icons/clipboard-check */
export const ClipboardCheckIcon = ({ className }: SidebarIconProps): ReactElement => (
  <svg {...SIDEBAR_ICON_PROPS} className={className}>
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="m9 14 2 2 4-4" />
  </svg>
);


/** https://lucide.dev/icons/id-card */
export const IdCardIcon = ({ className }: SidebarIconProps): ReactElement => (
  <svg {...SIDEBAR_ICON_PROPS} className={className}>
    <path d="M13 19a4 4 0 00-8 0" />
    <path d="M16 10h2" />
    <path d="M16 14h2" />
    <circle cx="9" cy="12" r="3" />
    <rect x="2" y="5" width="20" height="14" rx="2" />
  </svg>
);

/** https://lucide.dev/icons/presentation */
export const PresentationIcon = ({ className }: SidebarIconProps): ReactElement => (
  <svg {...SIDEBAR_ICON_PROPS} className={className}>
    <path d="M2 3h20" />
    <path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3" />
    <path d="m7 21 5-5 5 5" />
  </svg>
);

/** https://lucide.dev/icons/clipboard-list */
export const ClipboardListIcon = ({ className }: SidebarIconProps): ReactElement => (
  <svg {...SIDEBAR_ICON_PROPS} className={className}>
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M12 11h4" />
    <path d="M12 16h4" />
    <path d="M8 11h.01" />
    <path d="M8 16h.01" />
  </svg>
);

/** https://lucide.dev/icons/credit-card */
export const CreditCardIcon = ({ className }: SidebarIconProps): ReactElement => (
  <svg {...SIDEBAR_ICON_PROPS} className={className}>
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
    <path d="M6 14h2" />
  </svg>
);

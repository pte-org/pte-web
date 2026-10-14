import type { ReactElement } from "react";
import { NextAdminCalendarIcon } from "./nextAdminIcons";

interface IconProps {
  className?: string;
}

// Same stroke conventions as icons.tsx; split out so that file stays within the size limit.
const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const CalendarIcon = ({ className }: IconProps): ReactElement => (
  <NextAdminCalendarIcon className={className} />
);

export const ClockIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const TrendUpIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <path d="m3 17 6-6 4 4 8-8" />
    <path d="M15 7h6v6" />
  </svg>
);

export const TrendDownIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <path d="m3 7 6 6 4-4 8 8" />
    <path d="M15 17h6v-6" />
  </svg>
);

export const TrendFlatIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <path d="M4 12h16" />
    <path d="m15 7 5 5-5 5" />
  </svg>
);

export const ChartBarIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
  </svg>
);

export const ActivityIcon = ({ className }: IconProps): ReactElement => (
  <svg {...base} className={className}>
    <path d="M3 12h4l3-8 4 16 3-8h4" />
  </svg>
);

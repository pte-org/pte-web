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

/**
 * "file-lines" (regular) from Font Awesome Free 6.7.2 (https://fontawesome.com, icons under
 * CC BY 4.0, https://fontawesome.com/license/free). A filled glyph, so it does not use the stroke
 * conventions above.
 */
export const FileLinesIcon = ({ className }: IconProps): ReactElement => (
  <svg viewBox="0 0 384 512" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M64 464c-8.8 0-16-7.2-16-16L48 64c0-8.8 7.2-16 16-16l160 0 0 80c0 17.7 14.3 32 32 32l80 0 0 288c0 8.8-7.2 16-16 16L64 464zM64 0C28.7 0 0 28.7 0 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-293.5c0-17-6.7-33.3-18.7-45.3L274.7 18.7C262.7 6.7 246.5 0 229.5 0L64 0zm56 256c-13.3 0-24 10.7-24 24s10.7 24 24 24l144 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-144 0zm0 96c-13.3 0-24 10.7-24 24s10.7 24 24 24l144 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-144 0z" />
  </svg>
);

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

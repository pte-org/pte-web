import type { ReactElement } from "react";

interface IconProps {
  className?: string;
}

const baseProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const MailIcon = ({ className }: IconProps): ReactElement => (
  <svg {...baseProps} className={className}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

export const LockIcon = ({ className }: IconProps): ReactElement => (
  <svg {...baseProps} className={className}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

export const GradCapIcon = ({ className }: IconProps): ReactElement => (
  <svg {...baseProps} className={className}>
    <path d="M22 10 12 5 2 10l10 5 10-5Z" />
    <path d="M6 12v5c0 1 2.7 2 6 2s6-1 6-2v-5" />
  </svg>
);

export const EyeIcon = ({
  className,
  closed,
}: IconProps & { closed?: boolean }): ReactElement =>
  closed ? (
    <svg {...baseProps} className={className}>
      <path d="M9.9 4.2A9.6 9.6 0 0 1 12 4c5 0 9 4.5 10 8a13 13 0 0 1-2 3.3M6.3 6.3C3.9 7.8 2.3 10.1 2 12c1 3.5 5 8 10 8a9.6 9.6 0 0 0 4.3-1M3 3l18 18" />
    </svg>
  ) : (
    <svg {...baseProps} className={className}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

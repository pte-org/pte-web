"use client";

import type { ReactElement } from "react";

interface SsoButtonsProps {
  googleLabel: string;
  microsoftLabel: string;
}

// Brand marks use exact brand colours via SVG fill attributes (not Tailwind).
const GoogleMark = (): ReactElement => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1z"
    />
    <path
      fill="#EA4335"
      d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 12 0 12 12 0 0 0 1.3 6.6l4 3.1C6.2 6.9 8.9 4.8 12 4.8z"
    />
  </svg>
);

const MicrosoftMark = (): ReactElement => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
    <rect x="1" y="1" width="10" height="10" fill="#F25022" />
    <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
    <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
    <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
  </svg>
);

const BUTTON_CLASS =
  "flex items-center justify-center gap-2 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50";

/**
 * Google / Microsoft social sign-in buttons. UI only — OAuth is not wired to
 * the MVP backend yet, so these intentionally carry no click handler.
 */
export const SsoButtons = ({
  googleLabel,
  microsoftLabel,
}: SsoButtonsProps): ReactElement => (
  <div className="grid grid-cols-2 gap-3">
    <button type="button" className={BUTTON_CLASS}>
      <GoogleMark />
      {googleLabel}
    </button>
    <button type="button" className={BUTTON_CLASS}>
      <MicrosoftMark />
      {microsoftLabel}
    </button>
  </div>
);

import type { ReactElement } from "react";
import { DASHBOARD_TEXT } from "../constants";

const InfoIcon = (): ReactElement => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5 text-blue-500"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" strokeLinecap="round" />
  </svg>
);

export const SystemNoticeBanner = (): ReactElement => (
  <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
    <InfoIcon />
    <div>
      <p className="text-sm font-semibold text-blue-900">
        {DASHBOARD_TEXT.NOTICE_TITLE}
      </p>
      <p className="mt-0.5 text-sm text-blue-700">
        {DASHBOARD_TEXT.NOTICE_TEXT}
      </p>
    </div>
  </div>
);

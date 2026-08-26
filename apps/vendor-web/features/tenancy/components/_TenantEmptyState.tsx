import type { ReactElement } from "react";
import { TENANCY_TEXT } from "../constants";

const EmptyIllustration = (): ReactElement => (
  <svg
    viewBox="0 0 120 120"
    className="h-32 w-32"
    fill="none"
    aria-hidden="true"
  >
    <rect x="20" y="46" width="80" height="54" rx="8" fill="#E0E7FF" />
    <rect x="20" y="46" width="80" height="16" rx="8" fill="#C7D2FE" />
    <rect x="40" y="30" width="40" height="30" rx="6" fill="#F1F5F9" />
    <rect x="52" y="70" width="16" height="24" rx="3" fill="#94A3B8" />
    <circle cx="60" cy="24" r="4" fill="#818CF8" />
  </svg>
);

interface TenantEmptyStateProps {
  onAdd?: () => void;
  title?: string;
  text?: string;
  addLabel?: string;
}

export const TenantEmptyState = ({
  onAdd,
  title = TENANCY_TEXT.EMPTY_TITLE,
  text = TENANCY_TEXT.EMPTY_TEXT,
  addLabel = TENANCY_TEXT.ADD_TENANT,
}: TenantEmptyStateProps): ReactElement => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
    <EmptyIllustration />
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    <p className="max-w-md text-sm text-gray-500">{text}</p>
    <button
      type="button"
      onClick={onAdd}
      className="mt-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
    >
      + {addLabel}
    </button>
  </div>
);

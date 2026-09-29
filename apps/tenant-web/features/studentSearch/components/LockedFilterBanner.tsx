"use client";

import { Alert } from "@pte/ui";
import type { ReactElement } from "react";

interface LockedFilterBannerProps {
  className: string;
  onClearFilter: () => void;
  clearFilterLabel: string;
  lockedFilterBannerLabel: (name: string) => string;
}

export const LockedFilterBanner = ({
  className,
  onClearFilter,
  clearFilterLabel,
  lockedFilterBannerLabel,
}: LockedFilterBannerProps): ReactElement => (
  <div role="region" aria-live="polite">
    <Alert tone="info">
      {lockedFilterBannerLabel(className)}
      {" "}
      <button
        type="button"
        onClick={onClearFilter}
        className="font-medium underline hover:no-underline"
      >
        {clearFilterLabel}
      </button>
    </Alert>
  </div>
);

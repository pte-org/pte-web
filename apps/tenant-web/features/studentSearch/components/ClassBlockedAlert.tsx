"use client";

import { Alert } from "@pte/ui";
import type { ReactElement } from "react";

interface ClassBlockedAlertProps {
  status: string;
  className: string;
  classBlockedLabel: (status: string, name: string) => string;
}

export const ClassBlockedAlert = ({
  status,
  className,
  classBlockedLabel,
}: ClassBlockedAlertProps): ReactElement => (
  <div role="region" aria-live="polite">
    <Alert tone="warning">{classBlockedLabel(status, className)}</Alert>
  </div>
);

"use client";

import type { ReactElement } from "react";
import { Button } from "@pte/ui";
import { ERROR_PAGE_TEXT as TEXT } from "@/lib/errorPageConstants";

interface HostDashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function HostDashboardError({ reset }: HostDashboardErrorProps): ReactElement {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-xl font-semibold text-[var(--ink-primary)]">{TEXT.PAGE_TITLE}</h2>
      <p className="max-w-md text-sm text-[var(--ink-secondary)]">{TEXT.PAGE_DESCRIPTION}</p>
      <Button variant="danger" appearance="outline" onClick={reset}>
        {TEXT.RETRY}
      </Button>
    </div>
  );
}

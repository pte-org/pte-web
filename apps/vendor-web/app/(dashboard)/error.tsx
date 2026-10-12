"use client";

import type { ReactElement } from "react";
import { Button } from "@pte/ui";
import { ERROR_PAGE_TEXT as TEXT } from "@/lib/errorPageConstants";
import { useAdminCopy } from "@/features/i18n/adminCopy";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ reset }: ErrorProps): ReactElement {
  const localizedText = useAdminCopy(TEXT);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-xl font-semibold text-gray-900">{localizedText.PAGE_TITLE}</h1>
      <p className="max-w-md text-sm text-gray-600">{localizedText.PAGE_DESCRIPTION}</p>
      <Button onClick={reset}>{localizedText.RETRY}</Button>
    </div>
  );
}

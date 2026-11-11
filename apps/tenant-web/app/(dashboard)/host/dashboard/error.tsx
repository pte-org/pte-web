"use client";

import type { ReactElement } from "react";
import { AppErrorPage } from "@/lib/AppErrorPage";

interface ErrorProps {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}

export default function HostDashboardError({ error, unstable_retry }: ErrorProps): ReactElement {
  return <AppErrorPage error={error} onRetry={unstable_retry} />;
}

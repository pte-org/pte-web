"use client";

import type { ReactElement } from "react";
import { useRouteErrorText } from "@/lib/errorPageConstants";
import { AppErrorPage } from "@/lib/AppErrorPage";

interface ErrorProps {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}

export default function ExaminerSessionSegmentError({ error, unstable_retry }: ErrorProps): ReactElement {
  const description = useRouteErrorText("EXAMINER_DESCRIPTION");
  return <AppErrorPage error={error} onRetry={unstable_retry} description={description} />;
}

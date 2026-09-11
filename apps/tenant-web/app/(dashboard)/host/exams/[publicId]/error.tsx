"use client";

import type { ReactElement } from "react";
import { Button } from "@pte/ui";

const TEXT = {
  TITLE: "Something went wrong",
  RETRY: "Try again",
} as const;

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function SessionDetailError({
  error,
  reset,
}: ErrorProps): ReactElement {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-xl font-semibold text-gray-900">{TEXT.TITLE}</h1>
      <p className="max-w-md text-sm text-gray-600">{error.message}</p>
      <Button onClick={reset}>{TEXT.RETRY}</Button>
    </div>
  );
}

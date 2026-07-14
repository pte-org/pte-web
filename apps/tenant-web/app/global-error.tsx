"use client";

import type { ReactElement } from "react";

const TEXT = {
  TITLE: "System Error",
  DESCRIPTION: "Something went wrong. Please reload the page.",
  RELOAD: "Reload",
} as const;

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ reset }: GlobalErrorProps): ReactElement {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-xl font-semibold text-gray-900">{TEXT.TITLE}</h1>
          <p className="text-sm text-gray-600">{TEXT.DESCRIPTION}</p>
          <button
            type="button"
            onClick={reset}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            {TEXT.RELOAD}
          </button>
        </div>
      </body>
    </html>
  );
}

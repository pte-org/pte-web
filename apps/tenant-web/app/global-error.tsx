"use client";

import type { ReactElement } from "react";
import { LocaleProvider, PTE_UI_BOOTSTRAP_SCRIPT } from "@pte/ui";
import { AppErrorPage } from "@/lib/AppErrorPage";
import "./globals.css";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}

/** Replaces the root layout when it fails, so it brings its own document, styles, theme and language. */
export default function GlobalError({ error, unstable_retry }: GlobalErrorProps): ReactElement {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PTE_UI_BOOTSTRAP_SCRIPT }} />
      </head>
      <body>
        <LocaleProvider>
          <AppErrorPage error={error} kind="server" onRetry={unstable_retry} fullScreen />
        </LocaleProvider>
      </body>
    </html>
  );
}

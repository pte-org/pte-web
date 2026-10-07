import type { ReactElement, ReactNode } from "react";
import { notFound } from "next/navigation";

/**
 * Proctor workspace layout.
 *
 * Gates the entire `/proctor/**` route segment behind the
 * `NEXT_PUBLIC_PROCTOR_UI_ENABLED` env var. When the flag is "false"
 * (default in production) every `/proctor/*` route 404s. Set the flag
 * to "true" in `.env.local` to opt in during development.
 *
 * Mirrors the safety posture of the rest of the proctor workspace:
 * flag is OFF by default so production users never see partial UI.
 */
export default function ProctorLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  if (process.env.NEXT_PUBLIC_PROCTOR_UI_ENABLED !== "true") {
    notFound();
  }
  return <>{children}</>;
}
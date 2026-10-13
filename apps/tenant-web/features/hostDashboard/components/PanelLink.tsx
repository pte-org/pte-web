import type { ReactElement, ReactNode } from "react";
import Link from "next/link";

interface PanelLinkProps {
  href: string;
  children: ReactNode;
}

/** Text link used in panel headers and footers to reach the full screen behind a widget. */
export const PanelLink = ({ href, children }: PanelLinkProps): ReactElement => (
  <Link href={href} className="text-xs font-semibold text-action hover:underline">
    {children}
  </Link>
);

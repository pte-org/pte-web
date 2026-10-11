"use client";

import type { ReactElement, ReactNode } from "react";
import { Tabs, type TabItem } from "./Tabs";

export interface ProfileLayoutProps {
  id: string;
  items: readonly TabItem[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  children: ReactNode;
}

export const ProfileLayout = ({ children, ...tabs }: ProfileLayoutProps): ReactElement => (
  <section className="rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] p-3 sm:p-4">
    <Tabs {...tabs} variant="minimal" />
    {children}
  </section>
);

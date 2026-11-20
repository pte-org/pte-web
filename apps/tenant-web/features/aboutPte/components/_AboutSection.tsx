import type { ReactElement, ReactNode } from "react";
import { ABOUT_PTE_LAYOUT } from "../constants/aboutPteLayout";

interface AboutSectionProps {
  id: string;
  title: string;
  children: ReactNode;
}

export const AboutSection = ({ id, title, children }: AboutSectionProps): ReactElement => (
  <section id={id} aria-labelledby={`${id}-title`} className={ABOUT_PTE_LAYOUT.section}>
    <h2 id={`${id}-title`} className={ABOUT_PTE_LAYOUT.heading}>
      {title}
    </h2>
    <div className="mt-6">{children}</div>
  </section>
);

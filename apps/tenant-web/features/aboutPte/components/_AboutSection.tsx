import type { ReactElement, ReactNode } from "react";
import { ABOUT_PTE_LAYOUT } from "../constants/aboutPteLayout";

export type SectionTone = "plain" | "tint" | "navy";

interface AboutSectionProps {
  id: string;
  title: string;
  eyebrow?: string;
  intro?: ReactNode;
  tone?: SectionTone;
  centered?: boolean;
  children: ReactNode;
}

const SPACING_CLASS: Record<SectionTone, string> = {
  plain: "py-14 lg:py-20",
  tint: "py-14 lg:py-20",
  navy: "py-12 lg:py-16",
};

const TONE_CLASS: Record<SectionTone, string> = {
  plain: "",
  tint: "bg-[var(--home-paper)]",
  navy: "bg-[var(--home-navy)] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--action)_30%,transparent),transparent_65%)] text-white",
};

/** Full-width band with a pill eyebrow and heading, like the public home page sections. */
export const AboutSection = ({
  id,
  title,
  eyebrow,
  intro,
  tone = "plain",
  centered = false,
  children,
}: AboutSectionProps): ReactElement => (
  <section id={id} aria-labelledby={`${id}-title`} className={`scroll-mt-24 ${SPACING_CLASS[tone]} ${TONE_CLASS[tone]}`}>
    <div className={ABOUT_PTE_LAYOUT.container}>
      <header className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
        {eyebrow && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              tone === "navy" ? "bg-white/15 text-white" : "bg-[var(--action-tint)] text-action"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {eyebrow}
          </span>
        )}
        <h2
          id={`${id}-title`}
          className={`mt-3 text-2xl font-bold tracking-tight sm:text-3xl ${tone === "navy" ? "text-white" : "text-[var(--home-navy)]"}`}
        >
          {title}
        </h2>
        {intro && (
          <div className={`mt-3 text-pretty text-sm leading-7 ${tone === "navy" ? "text-white/80" : "text-[var(--ink-secondary)]"}`}>{intro}</div>
        )}
      </header>
      <div className="mt-8">{children}</div>
    </div>
  </section>
);

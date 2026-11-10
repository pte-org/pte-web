"use client";

import type { ReactElement } from "react";
import { DashboardCard, ErrorState, LoadingState, LockIcon, useLocale } from "@pte/ui";
import type { PromptCategory, PromptSection } from "@pte/api-client";
import { usePromptDocument } from "../api";
import { PROMPT_COPY, type PromptCopy } from "../promptConstants";
import { categoryLabel, sectionTitle } from "../utils/promptPresentation";
import { categoryTone } from "../utils/promptTone";
import { PromptBlockView } from "./_PromptBlockView";

interface PromptDetailViewProps {
  category: PromptCategory;
  promptKey: string;
}

/** The tokens the system fills in already appear, explained, where the prompt uses them. */
const HIDDEN_SECTION = "placeholders";

interface SectionCardProps {
  section: PromptSection;
  copy: PromptCopy;
}

/** One part of the prompt as a group of form fields; a fixed part (the reply format) carries a lock. */
const SectionCard = ({ section, copy }: SectionCardProps): ReactElement => {
  const { locale } = useLocale();
  return (
    <section className="space-y-4 rounded-xl border border-[var(--shell-border)] p-5">
      <header>
        <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--ink-primary)]">
          {section.locked && <LockIcon className="h-4 w-4 text-amber-500" aria-label={copy.LOCKED} />}
          {sectionTitle(section, locale)}
        </h2>
      </header>
      {section.blocks.map((block, index) => (
        <PromptBlockView key={`${section.id}-${index}`} block={block} copy={copy} />
      ))}
    </section>
  );
};

/**
 * One prompt laid out like a form: each part is a group of fields with its values in boxes, read only for now.
 */
export const PromptDetailView = ({ category, promptKey }: PromptDetailViewProps): ReactElement => {
  const { locale } = useLocale();
  const copy = PROMPT_COPY[locale];
  const query = usePromptDocument(category, promptKey);
  const document = query.data;

  return (
    <DashboardCard className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-[var(--ink-primary)]">{promptKey}</h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--ink-secondary)]">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryTone(category).chip}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${categoryTone(category).dot}`} aria-hidden="true" />
            {categoryLabel(copy, category)}
          </span>
          {document?.title && document.title !== promptKey && <span>{document.title}</span>}
        </div>
      </header>

      {query.isLoading && <LoadingState rows={6} />}
      {query.isError && <ErrorState title={copy.LOAD_ERROR} />}

      {document && (
        <div className="space-y-4">
          {document.sections
            .filter((section) => section.id !== HIDDEN_SECTION)
            .map((section) => (
              <SectionCard key={section.id} section={section} copy={copy} />
            ))}
        </div>
      )}
    </DashboardCard>
  );
};

"use client";

import type { ReactElement } from "react";
import { ErrorState, LoadingState, TabRailCard, useLocale, useRememberedState, type TabItem } from "@pte/ui";
import type { PromptCategory } from "@pte/api-client";
import { usePromptCatalog } from "../api";
import { PROMPT_CATEGORIES, PROMPT_COPY, PROMPT_TABS_ID } from "../promptConstants";
import { categoryLabel, hasPrompt } from "../utils/promptPresentation";
import { PromptTable } from "./_PromptTable";

/**
 * Every AI prompt in one place, grouped by what it is for: question generation, review, scoring and shared blocks.
 * Read only; a row opens the prompt drawn as sections.
 */
export const PromptsView = (): ReactElement => {
  const { locale } = useLocale();
  const copy = PROMPT_COPY[locale];
  const query = usePromptCatalog();
  const [category, setCategory] = useRememberedState<PromptCategory>("category", PROMPT_CATEGORIES[0], PROMPT_CATEGORIES);
  const catalog = query.data;

  if (query.isError) return <ErrorState title={copy.LOAD_ERROR} />;
  if (!catalog) return <LoadingState rows={6} />;
  // An answer without the category list (a server still on an older release) is an error, not a crash.
  if (!Array.isArray(catalog.categories)) return <ErrorState title={copy.LOAD_ERROR} />;

  // A scoring entry no AI model scores has no prompt: nothing is ever sent to a model for it.
  const entriesOf = (name: PromptCategory) =>
    (catalog.categories.find((entry) => entry.category === name)?.entries ?? []).filter(hasPrompt);
  const tabs: TabItem[] = PROMPT_CATEGORIES.map((name) => ({
    id: name,
    label: categoryLabel(copy, name),
    count: entriesOf(name).length,
  }));

  return (
    <TabRailCard
      id={PROMPT_TABS_ID}
      items={tabs}
      value={category}
      onChange={(value) => setCategory(PROMPT_CATEGORIES.find((name) => name === value) ?? PROMPT_CATEGORIES[0])}
    >
      <PromptTable entries={entriesOf(category)} copy={copy} />
    </TabRailCard>
  );
};

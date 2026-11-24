"use client";

import type { ReactElement } from "react";
import { ErrorState, LoadingState, Tabs, useLocale, useRememberedState, type TabItem } from "@pte/ui";
import type { PromptCategory } from "@pte/api-client";
import { usePromptCatalog } from "../api";
import { PROMPT_ALL_TAB, PROMPT_CATEGORIES, PROMPT_COPY, PROMPT_TABS_ID, PROMPT_TAB_VALUES } from "../promptConstants";
import { categoryLabel, hasPrompt } from "../utils/promptPresentation";
import { categoryTone } from "../utils/promptTone";
import { PromptTable } from "./_PromptTable";

/**
 * Every AI prompt in one place: all of them together, or grouped by what they are for (question generation, review,
 * scoring, shared blocks, chatbot). Read only; a row opens the prompt drawn as sections.
 */
export const PromptsView = (): ReactElement => {
  const { locale } = useLocale();
  const copy = PROMPT_COPY[locale];
  const query = usePromptCatalog();
  const [tab, setTab] = useRememberedState<string>("category", PROMPT_ALL_TAB, PROMPT_TAB_VALUES);
  const catalog = query.data;

  if (query.isError) return <ErrorState title={copy.LOAD_ERROR} />;
  if (!catalog) return <LoadingState rows={6} />;
  // An answer without the category list (a server still on an older release) is an error, not a crash.
  if (!Array.isArray(catalog.categories)) return <ErrorState title={copy.LOAD_ERROR} />;

  // A scoring entry no AI model scores has no prompt: nothing is ever sent to a model for it.
  const entriesOf = (name: PromptCategory) =>
    (catalog.categories.find((entry) => entry.category === name)?.entries ?? []).filter(hasPrompt);
  const allEntries = PROMPT_CATEGORIES.flatMap(entriesOf);
  const tabs: TabItem[] = [
    { id: PROMPT_ALL_TAB, label: copy.ALL_CATEGORIES, count: allEntries.length },
    ...PROMPT_CATEGORIES.map((name) => ({
      id: name,
      label: categoryLabel(copy, name),
      count: entriesOf(name).length,
      // The colour the category already has on its detail page, so the tab and the prompt agree.
      icon: <span className={`h-2 w-2 shrink-0 rounded-full ${categoryTone(name).dot}`} aria-hidden="true" />,
    })),
  ];
  const selected = PROMPT_TAB_VALUES.includes(tab) ? tab : PROMPT_ALL_TAB;
  const isAll = selected === PROMPT_ALL_TAB;

  return (
    <div className="flex flex-col gap-4">
      <Tabs id={PROMPT_TABS_ID} items={tabs} value={selected} onChange={setTab} variant="minimal" />
      <div role="tabpanel" id={`${PROMPT_TABS_ID}-panel-${selected}`} aria-labelledby={`${PROMPT_TABS_ID}-tab-${selected}`}>
        <PromptTable
          entries={isAll ? allEntries : entriesOf(selected as PromptCategory)}
          copy={copy}
          showCategory={isAll}
        />
      </div>
    </div>
  );
};

"use client";

import type { ReactElement } from "react";
import { ErrorState, LoadingState, useLocale } from "@pte/ui";
import type { PromptCategory } from "@pte/api-client";
import { useCurrentUser } from "@/features/auth/api";
import { usePromptWorkspace } from "../api";
import { PROMPT_EDIT_COPY } from "../promptEditConstants";
import { PromptWorkspace } from "./_PromptWorkspace";

interface PromptWorkspaceViewProps {
  category: PromptCategory;
  promptKey: string;
}

/** The page of one editable prompt: the form, the changes someone proposed to it, and the history of accepted ones. */
export const PromptWorkspaceView = ({ category, promptKey }: PromptWorkspaceViewProps): ReactElement => {
  const { locale } = useLocale();
  const lang = locale === "vi" ? "vi" : "en";
  const query = usePromptWorkspace(category, promptKey);
  const { data: user } = useCurrentUser();
  const workspace = query.data;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-[var(--ink-primary)]">{promptKey}</h1>
      {(query.isLoading || !user) && !query.isError && <LoadingState rows={6} />}
      {query.isError && <ErrorState title={PROMPT_EDIT_COPY[lang].LOAD_ERROR} />}
      {workspace && user && (
        // The key rebuilds the form from the server's copy each time a proposal is saved, moved or accepted.
        <PromptWorkspace
          key={`${workspace.live.publicId}-${workspace.proposal?.publicId}-${workspace.proposal?.lockVersion}-${workspace.proposal?.status}`}
          category={category}
          promptKey={promptKey}
          workspace={workspace}
          user={user}
        />
      )}
    </div>
  );
};

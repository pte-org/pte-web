"use client";

import { useState, type ReactElement } from "react";
import { Badge, DisclosureChevron, LoadingState } from "@pte/ui";
import type { PromptVersionSummary } from "@pte/api-client";
import { usePromptVersion } from "../api";
import { fill, type PromptEditCopy } from "../promptEditConstants";
import { PromptDiffView } from "./_PromptDiffView";

interface PromptHistoryTabProps {
  history: PromptVersionSummary[];
  copy: PromptEditCopy;
}

interface EntryProps {
  entry: PromptVersionSummary;
  /** The accepted version before this one, if any. */
  previous: PromptVersionSummary | undefined;
  copy: PromptEditCopy;
}

/** One accepted change; opened, it shows what it changed against the version before it. */
const HistoryEntry = ({ entry, previous, copy }: EntryProps): ReactElement => {
  const [open, setOpen] = useState(false);
  const after = usePromptVersion(open ? entry.publicId : undefined);
  const before = usePromptVersion(open ? previous?.publicId : undefined);
  const loading = open && (after.isLoading || before.isLoading);
  return (
    <li className="rounded-lg border border-[var(--shell-border)]">
      <button type="button" aria-expanded={open} aria-label={fill(copy.HISTORY_VERSION, { n: entry.versionNo })}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full flex-wrap items-center gap-2 px-4 py-3 text-left text-sm">
        <span className="font-medium">{fill(copy.HISTORY_VERSION, { n: entry.versionNo })}</span>
        {entry.status === "ACTIVE" && <Badge variant="success">{copy.HISTORY_CURRENT}</Badge>}
        <span className="text-xs text-[var(--ink-secondary)]">
          {entry.authorName ? fill(copy.HISTORY_BY, { name: entry.authorName }) : null}
          {entry.approverName ? `, ${fill(copy.HISTORY_APPROVED_BY, { name: entry.approverName })}` : null}
        </span>
        <span className="ml-auto text-xs text-[var(--ink-secondary)]">
          {new Date(entry.activatedAt ?? entry.createdAt).toLocaleString()}
        </span>
        <DisclosureChevron expanded={open} />
      </button>
      {open && (
        <div className="border-t border-[var(--shell-border)] p-4">
          {loading && <LoadingState rows={3} />}
          {!loading && !previous && <p className="text-sm text-[var(--ink-secondary)]">{copy.HISTORY_FIRST}</p>}
          {!loading && previous && after.data && before.data && (
            <PromptDiffView before={before.data.assembledText} after={after.data.assembledText} copy={copy} />
          )}
        </div>
      )}
    </li>
  );
};

/** The changes that were accepted, newest first: a log of who changed the prompt, when, and what they changed. */
export const PromptHistoryTab = ({ history, copy }: PromptHistoryTabProps): ReactElement => {
  if (history.length === 0) return <p className="text-sm text-[var(--ink-secondary)]">{copy.HISTORY_EMPTY}</p>;
  return (
    <ul className="space-y-2">
      {history.map((entry, index) => (
        <HistoryEntry key={entry.publicId} entry={entry} previous={history[index + 1]} copy={copy} />
      ))}
    </ul>
  );
};

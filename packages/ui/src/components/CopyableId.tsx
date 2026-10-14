"use client";

import { useState, type ReactElement } from "react";
import { CheckCircleIcon, CopyIcon } from "./icons";

interface CopyableIdProps {
  value: string;
}

const COPIED_RESET_MS = 1500;

const TEXT = {
  COPY_ARIA_LABEL: "Copy to clipboard",
  COPIED: "Copied!",
} as const;

async function copyToClipboard(value: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(value);
  }
}

/** De-emphasized technical ID (small, gray, monospace) with a copy button — keeps raw UUIDs from outweighing business fields like Plan or Status. */
export const CopyableId = ({ value }: CopyableIdProps): ReactElement => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (): void => {
    void copyToClipboard(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), COPIED_RESET_MS);
  };

  return (
    <span className="inline-flex max-w-full items-center gap-1.5">
      <code className="truncate font-mono text-xs text-[var(--ink-muted)]">{value}</code>
      <span className="relative shrink-0">
        <button
          type="button"
          onClick={handleCopy}
          aria-label={TEXT.COPY_ARIA_LABEL}
          className="rounded p-0.5 text-[var(--ink-muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--ink-primary)]"
        >
          {copied ? (
            <CheckCircleIcon className="h-3.5 w-3.5 text-[var(--mint-action)]" />
          ) : (
            <CopyIcon className="h-3.5 w-3.5" />
          )}
        </button>
        {copied && (
          <span className="absolute -top-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded border border-[var(--shell-border)] bg-[var(--surface-card)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--ink-primary)] shadow-[var(--popover-shadow)]">
            {TEXT.COPIED}
          </span>
        )}
      </span>
    </span>
  );
};

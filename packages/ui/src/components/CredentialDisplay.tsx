"use client";

import { useState, type ReactElement } from "react";
import { Button } from "./Button";
import { EyeIcon } from "./AuthIcons";
import { CopyIcon } from "./icons";

interface CredentialDisplayProps {
  credential: string;
  label?: string;
  isSecret?: boolean;
  /** Injectable copy handler; defaults to the Clipboard API. */
  onCopy?: (value: string) => void;
}

const TEXT = {
  DEFAULT_LABEL: "Login information",
  COPY: "Copy",
  COPIED: "Copied",
  SHOW: "Show",
  HIDE: "Hide",
  WARNING: "This information is shown only once. Please save it now.",
} as const;

async function copyToClipboard(value: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(value);
  }
}

export const CredentialDisplay = ({
  credential,
  label = TEXT.DEFAULT_LABEL,
  isSecret = true,
  onCopy,
}: CredentialDisplayProps): ReactElement => {
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(!isSecret);

  const handleCopy = (): void => {
    if (onCopy) {
      onCopy(credential);
    } else {
      void copyToClipboard(credential);
    }
    setCopied(true);
  };

  return (
    <div className="flex flex-col gap-2 rounded-md border border-amber-200 bg-amber-50 p-4">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <code className="min-w-0 flex-1 break-all rounded bg-white px-3 py-2 font-mono text-sm text-gray-900">
          {revealed ? credential : "••••••••••••"}
        </code>
        <div className="flex items-center gap-2">
          {isSecret && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<EyeIcon closed={revealed} className="h-4 w-4" />}
              onClick={() => setRevealed((value) => !value)}
            >
              {revealed ? TEXT.HIDE : TEXT.SHOW}
            </Button>
          )}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            leftIcon={<CopyIcon className="h-4 w-4" />}
            onClick={handleCopy}
          >
            {copied ? TEXT.COPIED : TEXT.COPY}
          </Button>
        </div>
      </div>
      <p className="text-xs text-amber-700">{TEXT.WARNING}</p>
    </div>
  );
};

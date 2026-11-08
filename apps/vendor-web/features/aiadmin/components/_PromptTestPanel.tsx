"use client";

import type { ReactElement } from "react";
import { Alert, Badge, Button } from "@pte/ui";
import type { PromptTestInfo, PromptTestResponse } from "@pte/api-client";
import { fill, type PromptEditCopy } from "../promptEditConstants";
import { answerText } from "../utils/fieldDisplay";

interface PromptTestPanelProps {
  copy: PromptEditCopy;
  /** The result stored with the version, if it was ever tested. */
  stored: PromptTestInfo | null;
  /** What the run just made returned; it carries the sample the stored result does not. */
  latest: PromptTestResponse | null;
  canTest: boolean;
  running: boolean;
  /** Text of the failed request, shown when the test could not run at all. */
  error: string | null;
  onRun: () => void;
}

/** The result of the last test and the button to run another; the sample shows what the AI wrote. */
export const PromptTestPanel = ({ copy, stored, latest, canTest, running, error, onRun }: PromptTestPanelProps): ReactElement => (
  <section className="space-y-3 rounded-xl border border-[var(--shell-border)] p-5">
    <div className="flex flex-wrap items-center gap-3">
      <h2 className="text-base font-semibold text-[var(--ink-primary)]">{copy.TEST_TITLE}</h2>
      {stored && (
        <Badge variant={stored.passed ? "success" : "danger"}>{stored.passed ? copy.TEST_PASSED : copy.TEST_FAILED}</Badge>
      )}
      {canTest && (
        <Button className="ml-auto" variant="secondary" onClick={onRun} isLoading={running} loadingText={copy.TESTING}>
          {copy.TEST}
        </Button>
      )}
    </div>
    <p className="text-sm text-[var(--ink-secondary)]">{copy.TEST_HELP}</p>
    {!stored && !running && <p className="text-sm text-[var(--ink-secondary)]">{copy.TEST_NEVER}</p>}
    {stored && (
      <div className="space-y-1 text-sm">
        {stored.note && <p className="text-[var(--ink-primary)]">{stored.note}</p>}
        <p className="text-xs text-[var(--ink-secondary)]">
          {stored.testedByName ? fill(copy.TEST_BY, { name: stored.testedByName }) : null}
          {" "}
          {new Date(stored.testedAt).toLocaleString()}
        </p>
        {!stored.current && <Alert tone="warning">{copy.TEST_STALE}</Alert>}
      </div>
    )}
    {error && <Alert tone="error">{error}</Alert>}
    {latest?.sampleOutput && (
      <details className="rounded-md border border-[var(--shell-border)] p-3">
        <summary className="cursor-pointer text-sm font-medium text-[var(--ink-secondary)]">{copy.TEST_SAMPLE}</summary>
        <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap text-sm text-[var(--ink-secondary)]">
          {answerText(latest.sampleOutput)}
        </pre>
      </details>
    )}
  </section>
);

import type { ReactElement } from "react";
import { Alert, Button } from "@pte/ui";
import type { BatchMessages } from "../messages/en";
import type { BatchFocus } from "../hooks/useBatchFocus";

interface BatchFocusNavProps {
  focus: BatchFocus;
  messages: BatchMessages;
}

/**
 * Above the job being watched: where the batch stands, whether this replay is over, and the buttons that move on.
 * Nothing here moves by itself; the person decides when to go to another job or to the results.
 */
export const BatchFocusNav = ({ focus, messages }: BatchFocusNavProps): ReactElement => (
  <div className="space-y-2">
    {focus.finished && (
      <Alert tone="info">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>{messages.batchDoneWatching}</span>
          <Button size="sm" variant="secondary" onClick={() => focus.focus(null)}>
            {messages.viewResults}
          </Button>
        </div>
      </Alert>
    )}
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-[var(--ink-secondary)]">
        {focus.replayDone ? messages.replayDone : null}
      </p>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          disabled={focus.previousId === null}
          onClick={() => focus.previousId && focus.focus(focus.previousId)}
        >
          {`‹ ${messages.previousJob}`}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={focus.nextId === null}
          onClick={() => focus.nextId && focus.focus(focus.nextId)}
        >
          {`${messages.nextJob} ›`}
        </Button>
      </div>
    </div>
  </div>
);

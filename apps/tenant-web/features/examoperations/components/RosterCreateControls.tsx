"use client";

import type { ReactElement } from "react";
import { Alert, Button, Checkbox } from "@pte/ui";
import { ROSTER_SEND_CREDENTIALS_TEXT } from "../constants";
import { errorMessage } from "../errorMessage";
import { rosterServerIssues } from "../rosterServerIssues";
import type { RosterRow, RosterRowIssue } from "../types";
import { RosterRowIssues } from "./RosterRowIssues";

interface RosterCreateControlsProps {
  /** Rows as parsed, used to point server row errors back at spreadsheet rows. */
  rows: readonly RosterRow[];
  rowIssues: readonly RosterRowIssue[];
  sendCredentialsEmail: boolean;
  onSendCredentialsEmailChange: (value: boolean) => void;
  onCreate: () => void;
  isPending: boolean;
  error: unknown;
  createLabel: string;
  creatingLabel: string;
  checkboxId: string;
}

/**
 * Shared review footer of every roster import: lists the broken cells (from the browser check or from the
 * server), lets the Host choose to e-mail account details, and keeps Create disabled while any cell is broken.
 */
export const RosterCreateControls = ({
  rows,
  rowIssues,
  sendCredentialsEmail,
  onSendCredentialsEmailChange,
  onCreate,
  isPending,
  error,
  createLabel,
  creatingLabel,
  checkboxId,
}: RosterCreateControlsProps): ReactElement => {
  const serverIssues = rosterServerIssues(error, rows);
  const issues = rowIssues.length > 0 ? rowIssues : serverIssues;
  const hasIssues = issues.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <RosterRowIssues issues={issues} />
      <Checkbox
        id={checkboxId}
        label={ROSTER_SEND_CREDENTIALS_TEXT.LABEL}
        helperText={ROSTER_SEND_CREDENTIALS_TEXT.HELPER}
        checked={sendCredentialsEmail}
        onChange={(event) => onSendCredentialsEmailChange(event.target.checked)}
        disabled={hasIssues}
      />
      {!!error && serverIssues.length === 0 && <Alert tone="error">{errorMessage(error)}</Alert>}
      <Button
        type="button"
        onClick={onCreate}
        isLoading={isPending}
        loadingText={creatingLabel}
        disabled={rowIssues.length > 0}
      >
        {createLabel}
      </Button>
    </div>
  );
};

"use client";

import type { ReactElement } from "react";
import { Alert, Badge, Button, type BadgeVariant } from "@pte/ui";
import type { PromptVersionResponse } from "@pte/api-client";
import { fill, proposalLabel, type PromptEditCopy } from "../promptEditConstants";
import type { PromptActions } from "../promptEditing";

interface PromptProposalPanelProps {
  proposal: PromptVersionResponse;
  copy: PromptEditCopy;
  actions: PromptActions;
  /** Edits not saved yet: the proposal on the server is not what the editor shows. */
  dirty: boolean;
  busy: boolean;
  onSubmit: () => void;
  onAccept: () => void;
  onReturn: () => void;
  onDrop: () => void;
}

const STATUS_VARIANT: Record<string, BadgeVariant> = { DRAFT: "neutral", PENDING: "warning", REJECTED: "danger" };

/** The open proposal: who wrote it, where it stands, and the few steps that move it forward. */
export const PromptProposalPanel = (props: PromptProposalPanelProps): ReactElement => {
  const { proposal, copy, actions, dirty, busy } = props;
  const acceptLabel = proposal.status === "PENDING" ? copy.ACCEPT : copy.APPLY_NOW;
  return (
    <section className="space-y-3 rounded-xl border border-[var(--shell-border)] p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold text-[var(--ink-primary)]">{copy.PROPOSAL_TITLE}</h2>
        <Badge variant={STATUS_VARIANT[proposal.status] ?? "neutral"}>{proposalLabel(copy, proposal.status)}</Badge>
      </div>
      {proposal.authorName && <p className="text-xs text-[var(--ink-secondary)]">{fill(copy.PROPOSAL_BY, { name: proposal.authorName })}</p>}
      {proposal.status === "REJECTED" && proposal.rejectionReason && (
        <Alert tone="warning">{fill(copy.RETURNED_BECAUSE, { reason: proposal.rejectionReason })}</Alert>
      )}
      <div className="flex flex-wrap gap-2">
        {actions.submit && (
          <Button onClick={props.onSubmit} disabled={busy || dirty || actions.submitNeedsTest}>
            {copy.SUBMIT}
          </Button>
        )}
        {actions.approve && (
          <Button onClick={props.onAccept} disabled={busy || dirty}>
            {acceptLabel}
          </Button>
        )}
        {actions.reject && (
          <Button variant="danger" appearance="outline" onClick={props.onReturn} disabled={busy}>
            {copy.RETURN}
          </Button>
        )}
        {actions.discard && (
          <Button variant="danger" appearance="ghost" onClick={props.onDrop} disabled={busy}>
            {copy.DROP}
          </Button>
        )}
      </div>
      {dirty && actions.submit && <p className="text-xs text-[var(--ink-secondary)]">{copy.SAVE_FIRST}</p>}
      {!dirty && actions.submit && actions.submitNeedsTest && <p className="text-xs text-[var(--ink-secondary)]">{copy.SUBMIT_NEEDS_TEST}</p>}
    </section>
  );
};

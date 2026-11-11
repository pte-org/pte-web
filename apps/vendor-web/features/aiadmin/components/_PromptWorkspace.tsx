"use client";

import { useMemo, useState, type ReactElement } from "react";
import { Alert, Button, ConfirmDialog, DashboardCard, Tabs, useLocale } from "@pte/ui";
import { PROMPT_GUIDE_COPY } from "../promptGuide";
import {
  getUserFacingApiErrorMessage,
  type CurrentUser,
  type PromptCategory,
  type PromptTestResponse,
  type PromptWorkspaceResponse,
} from "@pte/api-client";
import { useChangePromptStatus, useSavePromptProposal, useTestPromptVersion } from "../api";
import { PROMPT_EDIT_COPY, fill } from "../promptEditConstants";
import { hasPromptTest, mayPropose, promptActions } from "../promptEditing";
import { draftChanged, draftIsComplete, toContent, toDraft, type PromptDocumentDraft } from "../promptText";
import { PromptDiffView } from "./_PromptDiffView";
import { PromptDocumentEditor } from "./_PromptDocumentEditor";
import { PromptGuideDialog } from "./_PromptGuideDialog";
import { PromptHistoryTab } from "./_PromptHistoryTab";
import { PromptProposalPanel } from "./_PromptProposalPanel";
import { PromptRejectDialog } from "./_PromptRejectDialog";
import { PromptTestPanel } from "./_PromptTestPanel";

interface PromptWorkspaceProps {
  category: PromptCategory;
  promptKey: string;
  workspace: PromptWorkspaceResponse;
  user: CurrentUser;
}

type Tab = "content" | "changes" | "history";
type Dialog = "accept" | "drop" | "return" | null;

/**
 * One prompt as one form. It shows the version in use, or the open proposal when there is one; saving writes the
 * proposal, never the version in use, which only changes when a proposal is accepted.
 */
export const PromptWorkspace = ({ category, promptKey, workspace, user }: PromptWorkspaceProps): ReactElement => {
  const { live, proposal, history } = workspace;
  const lockedIds = workspace.lockedSectionIds ?? [];
  const [guideOpen, setGuideOpen] = useState(false);
  const { locale } = useLocale();
  const copy = PROMPT_EDIT_COPY[locale === "vi" ? "vi" : "en"];
  const caller = { publicId: user.publicId, roles: user.roles };
  const actions = proposal ? promptActions(proposal, caller) : null;
  const canEdit = proposal ? (actions?.edit ?? false) : mayPropose(caller);
  const saved = useMemo(() => toDraft((proposal ?? live).content), [proposal, live]);
  const [draft, setDraft] = useState<PromptDocumentDraft>(saved);
  // A proposal waiting for a reviewer opens on its changes: that is what the reviewer came to read.
  const [tab, setTab] = useState<Tab>(proposal?.status === "PENDING" && actions?.approve ? "changes" : "content");
  const [dialog, setDialog] = useState<Dialog>(null);
  const [latestTest, setLatestTest] = useState<PromptTestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const save = useSavePromptProposal(category, promptKey);
  const test = useTestPromptVersion(proposal?.publicId ?? "");
  const change = useChangePromptStatus(proposal?.publicId ?? "");

  const dirty = draftChanged(saved, draft);
  const complete = draftIsComplete(draft);
  const busy = save.isPending || test.isPending || change.isPending;
  const failure = (cause: unknown): void => setError(getUserFacingApiErrorMessage(cause, copy.SAVE_ERROR));

  const move = (action: "SUBMIT" | "APPROVE" | "DISCARD" | "REJECT", reason?: string): void => {
    setError(null);
    change.mutate({ action, reason }, { onSuccess: () => setDialog(null), onError: failure });
  };

  const tested = hasPromptTest(category, promptKey);
  const notice =
    !proposal ? null
    : proposal.status === "PENDING" ? (actions?.approve ? null : copy.PENDING_NOTICE)
    : canEdit ? copy.EDITING_PROPOSAL
    : copy.OTHER_AUTHOR_NOTICE;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <DashboardCard className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium">{fill(copy.IN_USE, { n: live.versionNo })}</span>
          {dirty && <span className="text-xs text-[var(--cream-action)]">{copy.NOT_SAVED}</span>}
          <Button variant="primary" size="sm" className="ml-auto" onClick={() => setGuideOpen(true)}>
            {PROMPT_GUIDE_COPY[locale === "vi" ? "vi" : "en"].BUTTON}
          </Button>
        </div>
        <Tabs
          id="prompt-workspace-tabs"
          variant="default"
          value={tab}
          onChange={(next) => setTab(next === "changes" || next === "history" ? next : "content")}
          items={[
            { id: "content", label: copy.TAB_CONTENT },
            { id: "changes", label: copy.TAB_CHANGES },
            { id: "history", label: copy.TAB_HISTORY },
          ]}
        />
        {error && <Alert tone="error">{error}</Alert>}
        {tab === "content" && (
          <div className="space-y-4">
            {notice && <Alert tone="info">{notice}</Alert>}
            <PromptDocumentEditor draft={draft} copy={copy} readOnly={!canEdit} lockedIds={lockedIds} onChange={setDraft} />
            {canEdit && dirty && (
              <div className="sticky bottom-0 flex flex-wrap items-center justify-end gap-2 rounded-lg border border-[var(--shell-border)] bg-[var(--surface-card)] p-3">
                {!complete && <span className="mr-auto text-xs text-[var(--blush-action)]">{copy.INCOMPLETE}</span>}
                <Button variant="secondary" onClick={() => setDraft(saved)} disabled={busy}>{copy.CANCEL_EDITS}</Button>
                <Button
                  disabled={busy || !complete}
                  isLoading={save.isPending}
                  loadingText={copy.SAVING}
                  onClick={() => {
                    setError(null);
                    save.mutate({ content: toContent(draft), expectedLockVersion: proposal?.lockVersion }, { onError: failure });
                  }}
                >
                  {copy.SAVE_PROPOSAL}
                </Button>
              </div>
            )}
          </div>
        )}
        {tab === "changes" &&
          (proposal ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-[var(--ink-primary)]">{fill(copy.DIFF_TITLE, { n: live.versionNo })}</p>
              {dirty && <Alert tone="warning">{copy.DIFF_UNSAVED}</Alert>}
              <PromptDiffView before={live.assembledText} after={proposal.assembledText} copy={copy} />
            </div>
          ) : (
            <p className="text-sm text-[var(--ink-secondary)]">{copy.CHANGES_NONE}</p>
          ))}
        {tab === "history" && <PromptHistoryTab history={history} copy={copy} />}
      </DashboardCard>
      <div className="space-y-6">
        {proposal && actions && (
          <PromptProposalPanel
            proposal={proposal}
            copy={copy}
            actions={actions}
            dirty={dirty}
            busy={busy}
            onSubmit={() => move("SUBMIT")}
            onAccept={() => setDialog("accept")}
            onReturn={() => setDialog("return")}
            onDrop={() => setDialog("drop")}
          />
        )}
        {proposal && tested && (
          <PromptTestPanel
            copy={copy}
            stored={proposal.test}
            latest={latestTest}
            canTest={Boolean(actions?.edit) && !dirty}
            running={test.isPending}
            error={test.isError ? getUserFacingApiErrorMessage(test.error, copy.SAVE_ERROR) : null}
            onRun={() => test.mutate(undefined, { onSuccess: setLatestTest })}
          />
        )}
      </div>
      <PromptGuideDialog open={guideOpen} sections={draft.sections} lockedIds={lockedIds}
        hasOutput={draft.sections.some((section) => section.fields !== null)}
        hasTokens={live.placeholders.length > 0} onClose={() => setGuideOpen(false)} />
      <ConfirmDialog
        open={dialog === "accept"}
        title={copy.CONFIRM_ACCEPT_TITLE}
        description={copy.CONFIRM_ACCEPT_BODY}
        confirmLabel={proposal?.status === "PENDING" ? copy.ACCEPT : copy.APPLY_NOW}
        cancelLabel={copy.CANCEL}
        isConfirming={change.isPending}
        onConfirm={() => move("APPROVE")}
        onClose={() => setDialog(null)}
      />
      <ConfirmDialog
        open={dialog === "drop"}
        title={copy.CONFIRM_DROP_TITLE}
        description={copy.CONFIRM_DROP_BODY}
        confirmLabel={copy.DROP}
        cancelLabel={copy.CANCEL}
        tone="danger"
        isConfirming={change.isPending}
        onConfirm={() => move("DISCARD")}
        onClose={() => setDialog(null)}
      />
      {dialog === "return" && (
        <PromptRejectDialog
          copy={copy}
          pending={change.isPending}
          error={error}
          onClose={() => setDialog(null)}
          onReject={(reason) => move("REJECT", reason)}
        />
      )}
    </div>
  );
};

"use client";

import { useState, type ReactElement } from "react";
import { Alert, Button } from "@pte/ui";
import {
  RosterColumnWarnings,
  RosterTemplateButton,
  SkippedRowsReport,
} from "@/features/examoperations/components";
import { downloadCredentials } from "@/features/examoperations/downloadCredentials";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { parseRosterFile } from "@/features/examoperations/cleanRosterFile";
import type {
  CreatedAccount,
  RosterColumnIssues,
  RosterRow,
  SkippedRow,
} from "@/features/examoperations/types";
import { useBulkAssignStudents, useCreateRosterAccountsForClass } from "../api";
import { IMPORT_HELP, IMPORT_OR_ASSIGN_TEXT } from "../constants";
import { RosterDropzone } from "./_RosterDropzone";
import type { TabScopeProps } from "./tabScopeProps";

const T = IMPORT_OR_ASSIGN_TEXT;

interface ImportExcelTabProps extends TabScopeProps {
  onCreated: (accounts: CreatedAccount[]) => void;
  onAssigned: (accounts: CreatedAccount[]) => void;
}

/**
 * Assign is attempted automatically right after account creation succeeds —
 * there is no separate tab-local "Assign All" button/mutation. Two
 * independent triggers for the same assign step (this tab's own button, and
 * the shared `PendingClassAssignmentBanner`'s "Retry Assigning") would drift
 * out of sync the moment one of them resolved the batch and the other
 * didn't know — the banner (driven by the modal's single `pending` state)
 * is the only manual retry affordance, and it's already visible above
 * whenever an attempt here fails.
 */
export const ImportExcelTab = ({
  organizationPublicId,
  programPublicId,
  classPublicId,
  onCreated,
  onAssigned,
}: ImportExcelTabProps): ReactElement => {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<RosterRow[] | null>(null);
  const [columnIssues, setColumnIssues] = useState<RosterColumnIssues | null>(null);
  const [parseError, setParseError] = useState<string | undefined>();
  const [lastResult, setLastResult] = useState<{
    created: CreatedAccount[];
    skipped: SkippedRow[];
  } | null>(null);

  const createAccounts = useCreateRosterAccountsForClass();
  const bulkAssign = useBulkAssignStudents(organizationPublicId, programPublicId, classPublicId);

  const handleReview = async (): Promise<void> => {
    if (!file) return;
    setParseError(undefined);
    try {
      const result = await parseRosterFile(file);
      setRows(result.rows);
      setColumnIssues(result);
    } catch (error) {
      setParseError(errorMessage(error));
    }
  };

  const handleCreateAccounts = (): void => {
    if (!rows) return;
    createAccounts.mutate(rows, {
      onSuccess: (response) => {
        setLastResult({ created: response.created, skipped: response.skipped });
        onCreated(response.created);
        setFile(null);
        setRows(null);
        setColumnIssues(null);
        if (response.created.length > 0) {
          bulkAssign.mutate(
            response.created.map((account) => account.publicId),
            { onSuccess: () => onAssigned(response.created) },
          );
        }
      },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-sm font-semibold text-gray-900">{T.importHeading}</h4>

      <RosterTemplateButton />

      <RosterDropzone
        fileName={file?.name}
        dropPrompt={T.dropPrompt}
        fileInputLabel={T.importHeading}
        helperText={IMPORT_HELP.classNameOverride}
        onFileSelected={(selected) => {
          setFile(selected);
          setRows(null);
          setColumnIssues(null);
          setLastResult(null);
        }}
      />

      {parseError && <Alert tone="error">{parseError}</Alert>}

      {!rows && !createAccounts.isPending && (
        <div>
          <Button type="button" onClick={() => void handleReview()} disabled={!file}>
            {T.checkFile}
          </Button>
        </div>
      )}

      {rows && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-700">
            {T.reviewRows}: {rows.length}
          </p>
          <RosterColumnWarnings issues={columnIssues} />
          {!!createAccounts.error && (
            <Alert tone="error">{errorMessage(createAccounts.error)}</Alert>
          )}
          <div>
            <Button
              type="button"
              onClick={handleCreateAccounts}
              isLoading={createAccounts.isPending}
              loadingText={T.creating}
            >
              {T.createAccounts}
            </Button>
          </div>
        </div>
      )}

      {lastResult && (
        <div className="flex flex-col gap-4">
          <Alert tone="success">
            {T.accountsCreated.replace("{count}", String(lastResult.created.length))}
          </Alert>
          <SkippedRowsReport rows={lastResult.skipped} />
          <div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => downloadCredentials(lastResult.created)}
            >
              {T.download}
            </Button>
          </div>
          {bulkAssign.isPending && <p className="text-sm text-gray-500">{T.assigningAll}</p>}
          {!!bulkAssign.error && (
            <Alert tone="error" title={T.assignErrorTitle}>
              {errorMessage(bulkAssign.error)}
            </Alert>
          )}
        </div>
      )}
    </div>
  );
};

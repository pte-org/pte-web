"use client";

import { useState, type ReactElement } from "react";
import { Alert, Button } from "@pte/ui";
import { RosterDropzone } from "./_RosterDropzone";
import { SkippedRowsReport } from "./SkippedRowsReport";
import { PendingImportBanner } from "./PendingImportBanner";
import { ROSTER_TEXT } from "./constants";
import {
  clearPendingImport,
  loadPendingImport,
  useCreateRosterAccounts,
  useEnrollRosterAccounts,
} from "../api";
import { errorMessage } from "../errorMessage";
import { downloadCredentials } from "../downloadCredentials";
import { parseRosterFile } from "../cleanRosterFile";
import type { CreatedAccount, RosterRow, SkippedRow } from "../types";

interface RosterImportProps {
  sessionPublicId: string;
}

export const RosterImport = ({ sessionPublicId }: RosterImportProps): ReactElement => {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<RosterRow[] | null>(null);
  const [parseError, setParseError] = useState<string | undefined>();
  const [created, setCreated] = useState<CreatedAccount[] | null>(null);
  const [skipped, setSkipped] = useState<SkippedRow[]>([]);
  // Lazy init reads sessionStorage during render — safe only because this
  // component is never rendered during SSR/hydration (SessionDetailView
  // gates it behind its own session-loading state). If a future change
  // renders RosterImport before that gate resolves, re-check this.
  const [pending, setPending] = useState<CreatedAccount[] | null>(() => loadPendingImport(sessionPublicId));

  const createAccounts = useCreateRosterAccounts(sessionPublicId);
  const enrollAccounts = useEnrollRosterAccounts(sessionPublicId);

  const handleReview = async (): Promise<void> => {
    if (!file) return;
    setParseError(undefined);
    try {
      const result = await parseRosterFile(file);
      setRows(result.rows);
    } catch (error) {
      setParseError(errorMessage(error));
    }
  };

  const handleCreateAccounts = (): void => {
    if (!rows) return;
    createAccounts.mutate(rows, {
      onSuccess: (response) => {
        setCreated(response.created);
        setSkipped(response.skipped);
        setPending(response.created);
      },
    });
  };

  const handleEnroll = (accounts: CreatedAccount[]): void => {
    enrollAccounts.mutate(accounts, {
      onSuccess: () => {
        setPending(null);
        setFile(null);
        setRows(null);
        setCreated(null);
        setSkipped([]);
      },
    });
  };

  const handleDismiss = (): void => {
    clearPendingImport(sessionPublicId);
    setPending(null);
  };

  return (
    <section className="flex max-w-3xl flex-col gap-6">
      {pending && pending.length > 0 && (
        <PendingImportBanner
          accounts={pending}
          onRetryEnroll={() => handleEnroll(pending)}
          onDismiss={handleDismiss}
          isEnrolling={enrollAccounts.isPending}
          enrollError={enrollAccounts.error}
        />
      )}

      <h2 className="text-xl font-semibold text-gray-900">{ROSTER_TEXT.HEADING}</h2>

      <RosterDropzone
        fileName={file?.name}
        onFileSelected={(selected) => {
          setFile(selected);
          setRows(null);
          setCreated(null);
        }}
      />

      {parseError && <Alert tone="error">{parseError}</Alert>}

      {!rows && (
        <Button type="button" onClick={() => void handleReview()} disabled={!file}>
          {ROSTER_TEXT.CHECK}
        </Button>
      )}

      {rows && !created && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-700">
            {ROSTER_TEXT.REVIEW_ROWS}: {rows.length}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="py-2 pr-4 font-medium">Email</th>
                  <th className="py-2 pr-4 font-medium">Full Name</th>
                  <th className="py-2 font-medium">Class</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 10).map((row, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-2 pr-4 text-gray-700">{row.email}</td>
                    <td className="py-2 pr-4 text-gray-700">{row.fullName}</td>
                    <td className="py-2 text-gray-700">{row.className ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!!createAccounts.error && <Alert tone="error">{errorMessage(createAccounts.error)}</Alert>}
          <Button
            type="button"
            onClick={handleCreateAccounts}
            isLoading={createAccounts.isPending}
            loadingText={ROSTER_TEXT.CREATING}
          >
            {ROSTER_TEXT.CREATE_ACCOUNTS}
          </Button>
        </div>
      )}

      {created && (
        <div className="flex flex-col gap-4">
          <Alert tone="success">
            {ROSTER_TEXT.ACCOUNTS_CREATED.replace("{count}", String(created.length))}
          </Alert>
          <SkippedRowsReport rows={skipped} />
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => downloadCredentials(created)}>
              {ROSTER_TEXT.DOWNLOAD}
            </Button>
            <Button
              type="button"
              onClick={() => handleEnroll(created)}
              isLoading={enrollAccounts.isPending}
              loadingText={ROSTER_TEXT.ENROLLING}
            >
              {ROSTER_TEXT.ENROLL}
            </Button>
          </div>
          {!!enrollAccounts.error && (
            <Alert tone="error" title={ROSTER_TEXT.ENROLL_ERROR_TITLE}>
              {errorMessage(enrollAccounts.error)}
            </Alert>
          )}
        </div>
      )}
    </section>
  );
};

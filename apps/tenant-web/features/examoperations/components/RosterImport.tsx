"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button } from "@pte/ui";
import { RosterDropzone } from "./_RosterDropzone";
import { ROSTER_TEXT } from "./constants";
import { useConfirmRosterImport, useParseRosterImport, type ImportReviewResult } from "../api";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : ROSTER_TEXT.UNKNOWN_ERROR;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export const RosterImport = (): ReactElement => {
  const [file, setFile] = useState<File | null>(null);
  const [reviewResult, setReviewResult] = useState<ImportReviewResult | null>(null);
  const router = useRouter();
  const previewImport = useParseRosterImport();
  const confirmImport = useConfirmRosterImport();

  const handleCheck = (): void => {
    if (!file) return;

    previewImport.mutate(file, {
      onSuccess: (result) => {
        setReviewResult(result);
      },
    });
  };

  const handleDownload = (): void => {
    if (!reviewResult) return;

    confirmImport.mutate(reviewResult.importId, {
      onSuccess: ({ blob, filename }) => {
        downloadBlob(blob, filename ?? "student-credentials.xlsx");
        router.push("/host/dashboard");
      },
    });
  };

  return (
    <section className="flex max-w-3xl flex-col gap-6">
      <h2 className="text-xl font-semibold text-gray-900">
        {ROSTER_TEXT.HEADING}
      </h2>
      <RosterDropzone fileName={file?.name} onFileSelected={setFile} />
      {!!previewImport.error && (
        <Alert tone="error" title={ROSTER_TEXT.PREVIEW_ERROR_TITLE}>
          {errorMessage(previewImport.error)}
        </Alert>
      )}
      {!!confirmImport.error && (
        <Alert tone="error" title={ROSTER_TEXT.DOWNLOAD_ERROR_TITLE}>
          {errorMessage(confirmImport.error)}
        </Alert>
      )}
      <Button
        type="button"
        onClick={handleCheck}
        disabled={!file}
        isLoading={previewImport.isPending}
        loadingText={ROSTER_TEXT.CHECKING}
      >
        {ROSTER_TEXT.CHECK}
      </Button>
      {reviewResult && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-medium text-gray-900">
              {ROSTER_TEXT.REVIEW_HEADING}
            </h3>
            <dl className="grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
              <div>
                <dt className="font-medium text-gray-500">{ROSTER_TEXT.REVIEW_FILE}</dt>
                <dd>{reviewResult.fileName}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">{ROSTER_TEXT.REVIEW_ROWS}</dt>
                <dd>{reviewResult.review.estimatedRowCount.toLocaleString()}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-medium text-gray-500">{ROSTER_TEXT.REVIEW_COLUMNS}</dt>
                <dd>{reviewResult.review.columnHeaders.join(", ")}</dd>
              </div>
            </dl>
            <p className="text-sm text-blue-700">{ROSTER_TEXT.REVIEW_NOTE}</p>
          </div>
          {reviewResult.review.sampleRows.length > 0 && (
            <div className="overflow-x-auto">
              <h4 className="mb-2 text-sm font-medium text-gray-700">
                {ROSTER_TEXT.REVIEW_SAMPLE}
              </h4>
              <table className="w-full min-w-max border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-500">
                    {reviewResult.review.columnHeaders.map((header) => (
                      <th key={header} className="py-2 pr-4 font-medium">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reviewResult.review.sampleRows.map((row, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      {reviewResult.review.columnHeaders.map((header) => (
                        <td key={header} className="py-2 pr-4 text-gray-700">
                          {row[header] ?? ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Button
            type="button"
            variant="secondary"
            onClick={handleDownload}
            disabled={!reviewResult}
            isLoading={confirmImport.isPending}
            loadingText={ROSTER_TEXT.DOWNLOADING}
          >
            {ROSTER_TEXT.DOWNLOAD}
          </Button>
        </div>
      )}
    </section>
  );
};

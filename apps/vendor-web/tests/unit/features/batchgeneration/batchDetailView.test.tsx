import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { LocaleProvider, ToastProvider } from "@pte/ui";
import type { QuestionGenerationBatchResponse } from "@pte/api-client";

const BATCH: QuestionGenerationBatchResponse = {
  publicId: "b-1",
  pool: "PRACTICE",
  status: "RUNNING",
  totalRequested: 12,
  succeededCount: 3,
  failedCount: 1,
  cancelledCount: 0,
  openCount: 8,
  cancelRequested: false,
  failureCode: null,
  currentJobPublicId: "job-2",
  createdAt: "2026-11-17T10:00:00Z",
  startedAt: "2026-11-17T10:00:05Z",
  finishedAt: null,
  rows: [
    {
      taskType: "MC_READING_SINGLE",
      cefrLevel: "B2",
      count: 12,
      topicHints: [],
      imageKind: "AUTO",
    },
  ],
  children: [
    {
      jobPublicId: "job-1",
      batchSeq: 0,
      rowIndex: 0,
      taskType: "MC_READING_SINGLE",
      topicHint: "climate",
      requestedCount: 10,
      status: "COMPLETED",
      succeededCount: 3,
      failedCount: 1,
      failureCode: null,
      startedAt: null,
      finishedAt: null,
    },
    {
      jobPublicId: "job-2",
      batchSeq: 1,
      rowIndex: 0,
      taskType: "MC_READING_SINGLE",
      topicHint: null,
      requestedCount: 2,
      status: "RUNNING",
      succeededCount: 0,
      failedCount: 0,
      failureCode: null,
      startedAt: null,
      finishedAt: null,
    },
  ],
};

const mutation = { mutate: vi.fn(), reset: vi.fn(), isPending: false, error: null };

vi.mock("next/navigation", () => ({ usePathname: () => "/admin/questions/ai-batches/b-1" }));
vi.mock("../../../../features/batchgeneration/api", () => ({
  useQuestionGenerationBatch: () => ({ data: BATCH, isLoading: false, error: null }),
  useCancelQuestionGenerationBatch: () => mutation,
  useBatchQuestions: () => ({ data: [] }),
}));
// The results grid has its own tests; here only whether it replaces the live view matters.
vi.mock("../../../../features/batchgeneration/components/_BatchResults", () => ({
  BatchResults: () => <div data-batch-results />,
}));
// The live view is followed over a stream; here only which jobs mount it matters.
vi.mock("../../../../features/questiongeneration/components/LiveJobPanel", () => ({
  LiveJobPanel: ({ jobId }: { jobId: string }) => <div data-live-job={jobId} />,
}));

import { BatchDetailView } from "../../../../features/batchgeneration/components/BatchDetailView";
import { batchMessages as vi_ } from "../../../../features/batchgeneration/messages/vi";

const render = (): string =>
  renderToStaticMarkup(
    <LocaleProvider>
      <ToastProvider>
        <BatchDetailView batchId="b-1" />
      </ToastProvider>
    </LocaleProvider>,
  );

describe("BatchDetailView", () => {
  it("shows progress, readable task types and cancel, without delete drafts or back link", () => {
    const html = render();
    expect(html).toContain(vi_.statusRUNNING);
    expect(html).toContain(vi_.cancelBatch);
    expect(html).toContain(vi_.savedOfTotal.replace("{total}", "12"));
    expect(html).toContain("Mc Reading Single");
    expect(html).toContain("#2 · Mc Reading Single");
    expect(html).not.toContain("MC_READING_SINGLE");
    expect(html).not.toContain("Xóa bản nháp");
    expect(html).not.toContain('/admin/questions"');
    expect(html).not.toContain("/admin/questions/ai-generation/");
  });

  it("follows only the running job in the main panel and lists it as a lane", () => {
    const html = render();
    expect(html).toContain('data-live-job="job-2"');
    expect(html).not.toContain('data-live-job="job-1"');
    expect(html).toContain(vi_.lanesTitle.replace("{count}", "1"));
    expect(html.match(/aria-current="true"/g)).toHaveLength(1);
  });
});

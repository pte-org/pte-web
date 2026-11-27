import { describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { QuestionGenerationBatchResponse, QuestionGenerationBatchStatus } from "@pte/api-client";
import { LocaleProvider, ToastProvider } from "@pte/ui";
// The real hooks reach the API client; here only which buttons a status shows matters.
vi.mock("../../../../features/batchgeneration/api", () => ({
  usePauseQuestionGenerationBatch: () => ({ mutate: vi.fn(), isPending: false }),
  useResumeQuestionGenerationBatch: () => ({ mutate: vi.fn(), isPending: false }),
}));

import { BatchActions } from "../../../../features/batchgeneration/components/_BatchActions";
import { batchMessages as en } from "../../../../features/batchgeneration/messages/en";

const render = (ui: ReactElement): string =>
  renderToStaticMarkup(
    <LocaleProvider>
      <ToastProvider>{ui}</ToastProvider>
    </LocaleProvider>,
  );

const batch = (status: QuestionGenerationBatchStatus, pauseExpiresAt: string | null = null) =>
  ({ publicId: "b1", status, pauseExpiresAt }) as unknown as QuestionGenerationBatchResponse;

const actions = (value: QuestionGenerationBatchResponse): string =>
  render(<BatchActions batch={value} messages={en} onCancel={vi.fn()} />);

describe("batch actions", () => {
  it("offers pause and cancel on a running batch", () => {
    const html = actions(batch("RUNNING"));
    expect(html).toContain(en.pauseBatch);
    expect(html).toContain(en.cancelBatch);
    expect(html).not.toContain(en.resumeBatch);
    expect(html).toContain(en.pauseHint);
  });

  it("waits while the running jobs are being stopped", () => {
    const html = actions(batch("PAUSING"));
    expect(html).toContain(en.pausingBatch);
    expect(html).not.toContain(`>${en.pauseBatch}<`);
  });

  it("offers resume on a paused batch and says when it will be cancelled", () => {
    const html = actions(batch("PAUSED", "2026-11-28T10:00:00Z"));
    expect(html).toContain(en.resumeBatch);
    expect(html).toContain(en.cancelBatch);
    expect(html).toContain(en.pauseExpiresAt.split("{time}")[0]);
  });

  it("shows nothing on a finished batch", () => {
    expect(actions(batch("COMPLETED"))).toBe("");
  });
});

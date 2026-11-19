import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@pte/api-client";
import { LocaleProvider } from "@pte/ui";

const hoisted = vi.hoisted(() => ({ openBatch: null as { publicId: string } | null }));
vi.mock("@/lib/apiClient", () => ({ apiClient: {} }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("../../../../features/questiongeneration/api", () => ({
  useOpenGenerationBatch: () => ({ data: hoisted.openBatch }),
}));

import { GenerationDialogNotices } from "../../../../features/questiongeneration/components/_GenerationDialogNotices";
import { GenerationDialogPresets } from "../../../../features/questiongeneration/components/_GenerationDialogPresets";
import { GenerationDialogSkillGrid } from "../../../../features/questiongeneration/components/_GenerationDialogSkillGrid";
import { GenerationDialogSummary } from "../../../../features/questiongeneration/components/_GenerationDialogSummary";
import type { GenerationSelectionState } from "../../../../features/questiongeneration/hooks/useGenerationSelection";
import { generationNoticeFor } from "../../../../features/questiongeneration/hooks/useGenerationSubmit";
import { dialogMessages as en } from "../../../../features/questiongeneration/messages/dialog.en";
import { newRow } from "../../../../features/questiongeneration/utils/generationSelection";

const render = (ui: ReactElement): string => renderToStaticMarkup(<LocaleProvider>{ui}</LocaleProvider>);

const state = (rows: GenerationSelectionState["selection"]["rows"]): GenerationSelectionState => ({
  selection: { pool: "PRACTICE", defaultCefr: "B2", sharedTopicText: "", rows },
  multiplier: 1,
  overCapTotal: null,
  setMultiplier: vi.fn(),
  setShared: vi.fn(),
  toggle: vi.fn(),
  update: vi.fn(),
  preset: vi.fn(),
  reset: vi.fn(),
});

describe("generation popup parts", () => {
  it("shows the pre-ticked editor task type with its count", () => {
    const taskTypes = [
      { taskType: "WRITE_ESSAY", section: "WRITING", needsAudio: false, needsImage: false, estimatedSecondsPerItem: 60 },
      { taskType: "READ_ALOUD", section: "SPEAKING", needsAudio: true, needsImage: false, estimatedSecondsPerItem: 60 },
    ];
    const html = render(<GenerationDialogSkillGrid taskTypes={taskTypes} state={state([newRow("WRITE_ESSAY", "WRITING", "B2")])} messages={en} />);
    expect(html).toMatch(/id="generation-type-WRITE_ESSAY"[^>]*checked/);
    expect(html).toContain("generation-type-WRITE_ESSAY-count");
    expect(html).not.toContain("generation-type-READ_ALOUD-count");
  });

  it("hides what is left today when the quota is unlimited", () => {
    const quota = { usedToday: 70, dailyLimit: 0, remaining: null, unlimited: true, scope: null, maxItemsPerBatch: 500 };
    const html = render(<GenerationDialogSummary typeCount={2} total={30} etaSeconds={1800} mode="batch" quota={quota} messages={en} />);
    expect(html).not.toContain(en.summaryRemaining);
    expect(html).toContain("30");
  });

  it("shows what is left and which limit binds when a limit applies", () => {
    const quota = { usedToday: 5, dailyLimit: 100, remaining: 3, unlimited: false, scope: "GLOBAL" as const, maxItemsPerBatch: 50 };
    const html = render(<GenerationDialogSummary typeCount={1} total={1} etaSeconds={60} mode="single" quota={quota} messages={en} />);
    expect(html).toContain(en.summaryRemaining);
    expect(html).toContain(en.summaryScopeGLOBAL);
  });

  it("hides the presets when the server has none (e.g. refused with 403)", () => {
    expect(render(<GenerationDialogPresets presets={[]} supported={new Set()} cap={500} state={state([])} messages={en} />)).toBe("");
  });

  it("links the running batch when the server says one already runs", () => {
    hoisted.openBatch = { publicId: "b-9" };
    const html = render(<GenerationDialogNotices notice="alreadyRunning" problem={null} cap={500} remaining={null} messages={en} />);
    expect(html).toContain("/admin/questions/ai-batches/b-9");
    expect(html).toContain(en.openRunningBatch);
  });

  it("falls back to the question bank when no running batch can be named", () => {
    hoisted.openBatch = null;
    const html = render(<GenerationDialogNotices notice="alreadyRunning" problem={null} cap={500} remaining={null} messages={en} />);
    expect(html).toContain('href="/admin/questions"');
  });

  it("maps the batch refusals to in-popup notices and leaves others to a toast", () => {
    const refusal = (code: string): ApiError => new ApiError("conflict", 409, code, undefined, { code });
    expect(generationNoticeFor(refusal("GENERATION_BATCH_DISABLED"))).toBe("batchDisabled");
    expect(generationNoticeFor(refusal("GENERATION_JOB_ALREADY_RUNNING"))).toBe("alreadyRunning");
    expect(generationNoticeFor(refusal("GENERATION_DAILY_LIMIT_REACHED"))).toBeNull();
  });
});

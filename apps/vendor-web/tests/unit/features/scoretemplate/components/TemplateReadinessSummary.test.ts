import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { ScoreTemplateItemDraft } from "../../../../../features/scoretemplate/types";

vi.mock("@pte/ui", () => ({
  CollapsibleSection: ({ title, children }: { title: string; children: ReactNode }) =>
    createElement("section", null, title, children),
}));
vi.mock("@/features/i18n/adminCopy", () => ({ useAdminCopy: (copy: unknown) => copy }));

import { TemplateReadinessSummary } from "../../../../../features/scoretemplate/components/TemplateReadinessSummary";

const item: ScoreTemplateItemDraft = {
  taskType: "READ_ALOUD", taskTypeKey: "READ_ALOUD", section: "SPEAKING", sequence: 1,
  minCount: "1", maxCount: "2", prepSeconds: "35", responseSeconds: "40",
  overallWeight: "0", speakingWeight: "100", writingWeight: "0", readingWeight: "0", listeningWeight: "0",
};

function render(reason: string, repeat = false): string {
  const slot = { taskType: "READ_ALOUD", section: "SPEAKING", required: 2, available: 1, ready: false, reason };
  return renderToStaticMarkup(createElement(TemplateReadinessSummary, {
    items: repeat ? [item, { ...item, sequence: 2 }] : [item],
    questionTypes: [], loading: false, failed: false,
    feasibility: { examDefinitionPublicId: "template", examDefinitionVersion: 2, ready: false, slots: repeat ? [slot, slot] : [slot] },
  }));
}

describe("template readiness feedback", () => {
  it("shows the question shortage with required and available counts", () => {
    expect(render("INSUFFICIENT_POOL")).toContain("Required: 2; Available: 1");
  });

  it("explains runtime failures without claiming a question shortage or exposing codes", () => {
    const html = render("RUNTIME_PROFILE_INVALID");
    expect(html).toContain("invalid runtime configuration");
    expect(html).not.toContain("Insufficient approved questions");
    expect(html).not.toContain("RUNTIME_PROFILE_INVALID");
  });

  it("identifies duplicate tasks but reports each repeated readiness failure once", () => {
    const html = render("INSUFFICIENT_POOL", true);
    expect(html).toContain("Repeated task types");
    expect(html.match(/Insufficient approved questions/g)).toHaveLength(1);
  });
});

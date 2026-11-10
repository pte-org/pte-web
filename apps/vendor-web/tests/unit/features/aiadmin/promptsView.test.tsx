import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "@pte/ui";
import type { PromptCatalogResponse } from "@pte/api-client";

const CATALOG: PromptCatalogResponse = {
  promptVersion: 1,
  categories: [
    {
      category: "GENERATION",
      entries: [{ category: "GENERATION", key: "READ_ALOUD", title: "Read Aloud", tags: [] }],
    },
    { category: "REVIEW", entries: [{ category: "REVIEW", key: "REVIEWER", title: "Reviewer", tags: [] }] },
    {
      category: "SCORING",
      entries: [{ category: "SCORING", key: "WRITE_ESSAY", title: "WRITE_ESSAY", tags: ["GEMINI", "CODE"] }],
    },
    { category: "SHARED", entries: [{ category: "SHARED", key: "COMMON_GENERATOR", title: "Common", tags: [] }] },
  ],
};

vi.mock("../../../../features/aiadmin/api", () => ({
  usePromptCatalog: () => ({ data: CATALOG, isError: false, isLoading: false }),
}));

import { PromptsView } from "../../../../features/aiadmin/components/PromptsView";

describe("PromptsView", () => {
  it("lists the four categories with their counts and opens a prompt from its row", () => {
    const html = renderToStaticMarkup(
      <LocaleProvider>
        <PromptsView />
      </LocaleProvider>,
    );

    expect(html).toContain("READ_ALOUD");
    expect(html).toContain("/admin/ai/prompts/GENERATION/READ_ALOUD");
    for (const label of ["Sinh đề", "Review đề", "Chấm điểm", "Khối dùng chung"]) {
      expect(html).toContain(label);
    }
  });
});

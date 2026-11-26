import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "@pte/ui";
import { CreateProgramModal } from "../../../../features/programs/components/CreateProgramModal";

vi.mock("@pte/ui", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@pte/ui")>()),
  Modal: ({ open, title, children, footer }: { open: boolean; title: string; children: ReactNode; footer: ReactNode }) =>
    open ? (
      <div data-testid="modal">
        <h1>{title}</h1>
        {children}
        <footer>{footer}</footer>
      </div>
    ) : null,
}));

describe("CreateProgramModal", () => {
  it("renders in Vietnamese by default inside LocaleProvider", () => {
    const html = renderToStaticMarkup(
      <LocaleProvider>
        <CreateProgramModal
          open={true}
          onClose={vi.fn()}
          onSubmit={vi.fn()}
          programLabel="Chương trình"
        />
      </LocaleProvider>,
    );

    // Modal title
    expect(html).toContain("Tạo chương trình");
    // Form labels (rendered as uppercase by FormField)
    expect(html).toContain("Tên chương trình");
    expect(html).toContain("Mô tả");
    expect(html).toContain("Ngày bắt đầu");
    expect(html).toContain("Ngày kết thúc");
    expect(html).toContain("Không bắt buộc — bỏ trống nếu không giới hạn thời gian");
    // Placeholders
    expect(html).toContain("Ví dụ: Chương trình 12");
    // Buttons
    expect(html).toContain("Hủy");
    expect(html).toContain("Tạo chương trình");

    // Ensure English text does NOT appear
    expect(html).not.toContain("Create Program");
    expect(html).not.toContain("CHƯƠNG TRÌNH NAME");
    expect(html).not.toContain("DESCRIPTION");
    expect(html).not.toContain("START DATE");
    expect(html).not.toContain("END DATE");
    expect(html).not.toContain("Cancel");
  });
});

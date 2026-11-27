import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";
import { LocaleProvider } from "@pte/ui";
import { IncidentReportModal } from "../../../../features/proctor/components/IncidentReportModal";

const state = vi.hoisted(() => ({
  isLoading: false,
  rows: [] as Array<{ studentPublicId: string; displayName: string; email: string }>,
  rosterArgs: [] as unknown[][],
}));

vi.mock("@pte/ui", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@pte/ui")>()),
  Modal: ({ children, footer }: { children: ReactNode; footer: ReactNode }) => <div>{children}{footer}</div>,
  useToast: () => ({ showToast: vi.fn() }),
}));
vi.mock("../../../../features/proctor/api", () => ({
  useCreateIncidentMutation: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useAttendanceRoster: (...args: unknown[]) => {
    state.rosterArgs.push(args);
    return { isLoading: state.isLoading, data: { data: state.rows } };
  },
}));

const render = (open = true): string =>
  renderToStaticMarkup(
    <LocaleProvider>
      <IncidentReportModal open={open} onClose={vi.fn()} sessionPublicId="session-1" />
    </LocaleProvider>,
  );

beforeEach(() => {
  state.isLoading = false;
  state.rosterArgs = [];
  state.rows = [
    { studentPublicId: "stu-1", displayName: "Nguyễn Văn An", email: "an@test.local" },
    { studentPublicId: "stu-2", displayName: "", email: "" },
  ];
});

it("lets the proctor pick a related student from the session roster", () => {
  const html = render();
  expect(html).toContain("Không chọn (sự cố chung của ca thi)");
  expect(html).toContain('<option value="stu-1">Nguyễn Văn An — an@test.local</option>');
  expect(html).toContain('<option value="stu-2">stu-2</option>');
  expect(html).not.toContain("Nhập mã định danh");
});

it("asks the roster for the widest page and has no search box", () => {
  expect(render()).not.toContain("Tìm thí sinh");
  expect(state.rosterArgs[0]?.[1]).toEqual({ size: 100 });
});

it("loads the roster only while the modal is open", () => {
  render(true);
  render(false);
  expect(state.rosterArgs[0]?.[0]).toBe("session-1");
  expect(state.rosterArgs[1]?.[0]).toBe("");
});

it("shows a loading option while the roster is loading", () => {
  state.isLoading = true;
  expect(render()).toContain("Đang tải danh sách thí sinh...");
});

import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";
import type { AttendanceRowResponse } from "@pte/api-client";
import type { DropdownItem } from "@pte/ui";
import { AttendanceRosterTable } from "../../../../features/proctor/components/AttendanceRosterTable";

const state = vi.hoisted(() => ({ items: [] as DropdownItem[] }));
vi.mock("@pte/ui", () => ({
  DataTable: ({ rows, rowActions }: { rows: AttendanceRowResponse[]; rowActions: (row: AttendanceRowResponse) => ReactNode }) => <div>{rows[0] && rowActions(rows[0])}</div>,
  ActionMenu: ({ items }: { items: DropdownItem[] }) => { state.items = items; return <span>Menu</span>; },
}));
vi.mock("../../../../features/proctor/hooks/useAttendanceColumns", () => ({ useAttendanceColumns: () => [] }));

const record = vi.fn();
// Only fields read by the action renderer are needed for this isolated fixture.
const row = { studentPublicId: "student-1", status: "UNMARKED", canEdit: true } as AttendanceRowResponse;
function render(canEditSession = true): string {
  return renderToStaticMarkup(<AttendanceRosterTable rows={[row]} isLoading={false} canEditSession={canEditSession}
    onRecordAttendance={record} onViewHistory={vi.fn()} onVerifyIdentity={vi.fn()} />);
}
beforeEach(() => { record.mockClear(); state.items = []; });

it("keeps attendance controls only in the existing menu and invokes their callbacks", () => {
  expect(render().replace(/<[^>]*>/g, "")).toBe("Menu");
  for (const [label, status, tone] of [["Có mặt", "PRESENT", "success"], ["Đến trễ", "LATE", "warning"], ["Vắng mặt", "ABSENT", "danger"]]) {
    const item = state.items.find((action) => "label" in action && action.label === label);
    expect(item).toMatchObject({ tone });
    if (item && "label" in item) item.onSelect?.();
    expect(record).toHaveBeenLastCalledWith(row, status);
  }
});

it("does not expose attendance mutations when the session is locked", () => {
  render(false);
  expect(state.items.filter((item) => "label" in item).map((item) => "label" in item && item.label))
    .toEqual(["Xác minh danh tính", "Lịch sử điểm danh"]);
});

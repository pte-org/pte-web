import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import type { AttendanceHistoryItemResponse } from "@pte/api-client";
import { AttendanceHistoryEntry } from "../../../../features/proctor/components/AttendanceHistoryEntry";

const entry: AttendanceHistoryItemResponse = {
  id: "event-1", requestPublicId: "request-1", studentPublicId: "student-1",
  enrollmentPublicId: "enrollment-1", actorPublicId: "actor-1", actorDisplayName: "Test proctor",
  actorRole: "PROCTOR", appliedVersion: 1, previousStatus: "UNMARKED", newStatus: "PRESENT",
  reasonOrNote: "Checked student identity", serverActionAt: "2026-11-10T03:00:00Z",
};

it("shows the full attendance transition, actor and reason without a wide table", () => {
  const html = renderToStaticMarkup(<AttendanceHistoryEntry entry={entry} />);
  for (const text of ["Test proctor", "Giám thị", "Chưa điểm danh", "Có mặt", "Checked student identity"]) expect(html).toContain(text);
  expect(html).toMatch(/datetime="2026-11-10T03:00:00Z"/i);
  expect(html).not.toMatch(/<table|PROCTOR/);
});

it("uses understandable fallback labels instead of technical ids", () => {
  const html = renderToStaticMarkup(<AttendanceHistoryEntry entry={{ ...entry, actorDisplayName: null, reasonOrNote: null }} />);
  expect(html).toContain("Giám thị");
  expect(html).toContain("Không có ghi chú bổ sung.");
  expect(html).not.toContain("actor-1");
});

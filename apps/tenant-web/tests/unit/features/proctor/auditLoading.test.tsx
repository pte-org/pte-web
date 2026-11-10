import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ tab: "violations", loading: false, table: vi.fn() }));
vi.mock("react", async (original) => ({
  ...(await original<typeof import("react")>()),
  useState: () => [state.tab, vi.fn()],
}));
vi.mock("@pte/ui", () => ({
  DataTable: (props: { isLoading: boolean }) => { state.table(props); return null; },
  Select: () => null,
  Button: ({ children }: { children: ReactNode }) => <button>{children}</button>,
}));
vi.mock("../../../../features/proctor/api", () => ({
  useProctorAuditLog: () => ({
    data: { items: [{ publicId: "violation-1" }] }, isFetching: true, isLoading: state.loading,
  }),
  useProctorSecurityAudit: () => ({
    data: { pages: [{ items: [{ publicId: "security-1" }], hasNext: true }] },
    isFetching: true, isLoading: state.loading,
  }),
}));

import { AuditLogView } from "../../../../features/proctor/components/AuditLogView";

beforeEach(() => { state.loading = false; state.table.mockClear(); });

it.each(["violations", "security"])("keeps %s rows visible during background refresh", (tab) => {
  state.tab = tab;
  renderToStaticMarkup(<AuditLogView sessionPublicId="session-1" />);
  expect(state.table.mock.lastCall?.[0].isLoading).toBe(false);
  expect(state.table.mock.lastCall?.[0].rows).toHaveLength(1);
});

it.each(["violations", "security"])("still shows initial loading for %s", (tab) => {
  state.tab = tab;
  state.loading = true;
  renderToStaticMarkup(<AuditLogView sessionPublicId="session-1" />);
  expect(state.table.mock.lastCall?.[0].isLoading).toBe(true);
});

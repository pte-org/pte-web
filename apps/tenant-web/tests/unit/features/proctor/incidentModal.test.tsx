import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";
import { LocaleProvider } from "@pte/ui";
import { IncidentDetailModal } from "../../../../features/proctor/components/IncidentDetailModal";

const state = vi.hoisted(() => ({ status: "NEW", isError: false }));
vi.mock("@pte/ui", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@pte/ui")>()),
  Modal: ({ children, footer }: { children: ReactNode; footer: ReactNode }) => <div>{children}{footer}</div>,
  useToast: () => ({ showToast: vi.fn() }),
}));
vi.mock("../../../../features/proctor/api", () => ({
  useIncidentDetail: () => ({
    isLoading: false,
    isError: state.isError,
    refetch: vi.fn(),
    data: state.isError ? undefined : {
      incidentPublicId: "incident-1", title: "Audio issue", category: "TECHNICAL_ISSUE",
      severity: "MEDIUM", status: state.status, description: "Headphones disconnected",
      reporterName: "Test proctor", reporterRole: "PROCTOR", currentOwnerRole: "HOST_ADMIN",
      createdAt: "2026-11-10T03:00:00Z", updatedAt: "2026-11-10T03:00:00Z",
    },
  }),
  useIncidentHistory: () => ({ isLoading: false, data: [], refetch: vi.fn() }),
  useUpdateIncidentStatusMutation: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));

const render = (): string => renderToStaticMarkup(<LocaleProvider>
  <IncidentDetailModal sessionPublicId="session-1" incidentPublicId="incident-1" onClose={vi.fn()} />
</LocaleProvider>);

beforeEach(() => { state.status = "NEW"; state.isError = false; });

it("shows useful incident context and only the Proctor supplement action", () => {
  const html = render();
  expect(html).toContain("Audio issue");
  expect(html).toContain("Headphones disconnected");
  expect(html).toContain("Quản trị tổ chức");
  expect(html).toContain("Toàn ca thi");
  expect(html).toContain("Gửi bổ sung");
  expect(html).not.toMatch(/Tiếp nhận xử lý|Giải quyết sự cố|Chuyển cấp Admin|HOST_ADMIN|MEDIUM/);
  expect(html).toContain('aria-expanded="false"');
});

it.each(["ESCALATED", "RESOLVED", "CLOSED"])("does not offer mutation on %s incidents", (status) => {
  state.status = status;
  expect(render()).not.toContain("Gửi bổ sung");
});

it("offers retry when detail cannot be loaded", () => {
  state.isError = true;
  expect(render()).toContain("Thử lại");
  expect(render()).not.toContain("Gửi bổ sung");
});

import { beforeEach, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LocaleProvider } from "@pte/ui";
import { ProctorSessionWorkspace } from "../../../../features/proctor/components/ProctorSessionWorkspace";

const state = vi.hoisted(() => ({
  pathname: "/proctor/attendance/session-1",
  assignment: {
    isError: false,
    isLoading: false,
    // Only the fields the session frame reads.
    data: undefined as
      | undefined
      | { name: string; status: string; opensAt: string; closesAt: string },
    refetch: vi.fn(),
  },
  push: vi.fn(),
  replace: vi.fn(),
  onTabChange: undefined as ((value: string) => void) | undefined,
}));

vi.mock("react", async (original) => ({
  ...(await original<typeof import("react")>()),
  useTransition: () => [false, (navigate: () => void) => navigate()],
}));
vi.mock("@pte/ui", async (importOriginal) => {
  const original = await importOriginal<typeof import("@pte/ui")>();
  return {
    ...original,
    Tabs: (props: Parameters<typeof original.Tabs>[0]) => {
      state.onTabChange = props.onChange;
      return <original.Tabs {...props} />;
    },
    useToast: () => ({ showToast: vi.fn() }),
  };
});

vi.mock("next/navigation", () => ({
  usePathname: () => state.pathname,
  useRouter: () => ({ push: state.push, replace: state.replace, prefetch: vi.fn() }),
}));
vi.mock("../../../../features/proctor/api", () => ({
  useMyProctorAssignment: () => state.assignment,
  useAttendanceRoster: () => ({
    isLoading: false,
    data: { summary: { totalEnrollments: 4, unmarkedCount: 1, presentCount: 1, absentCount: 1, lateCount: 1 } },
  }),
}));

const render = (): string =>
  renderToStaticMarkup(
    <LocaleProvider>
      <ProctorSessionWorkspace>
        <div data-testid="active-tool">Current tool state</div>
      </ProctorSessionWorkspace>
    </LocaleProvider>,
  );

beforeEach(() => {
  state.push.mockClear();
  state.pathname = "/proctor/attendance/session-1";
  state.assignment.isError = false;
  state.assignment.isLoading = false;
  state.assignment.data = {
    name: "Assigned session",
    status: "OPEN",
    opensAt: "2026-11-09T03:00:00Z",
    closesAt: "2026-11-09T05:00:00Z",
  };
});

it("switches session tabs without resetting scroll and ignores reselecting the current tab", () => {
  render();
  state.onTabChange?.("attendance");
  expect(state.push).not.toHaveBeenCalled();
  state.onTabChange?.("audit-log");
  expect(state.push).toHaveBeenCalledWith("/proctor/audit-log/session-1", { scroll: false });
});

it("preserves the active tool during a failed metadata refetch", () => {
  state.assignment.isError = true;
  expect(render()).toContain('data-testid="active-tool"');
});
it("does not mount tool content when session metadata is unavailable", () => {
  state.assignment.data = undefined;
  state.assignment.isError = true;
  expect(render()).not.toContain('data-testid="active-tool"');
});
it("offers only attendance, incidents and audit log, with the current tab selected", () => {
  state.pathname = "/proctor/incidents/session-1";
  const html = render();
  expect(html).toContain('data-testid="active-tool"');
  expect(html.match(/role="tab"/g)).toHaveLength(3);
  expect(html).toMatch(/role="tab" aria-selected="true"[^>]*tabindex="0"/);
});

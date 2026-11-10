import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const harness = vi.hoisted(() => ({
  slots: [] as unknown[],
  cursor: 0,
  debounced: undefined as string | undefined,
  query: vi.fn(),
  table: vi.fn(),
  pagination: vi.fn(),
  refetch: vi.fn(),
  failed: false,
  previewFetching: false,
  previewFailed: false,
  grant: vi.fn().mockResolvedValue({}),
  preview: {
    tenantId: "org-1", planId: "plan-1", planName: "Exam plan", planType: "EXAM_PACKAGE",
    hosts: [{ username: "host", email: "host@example.com" }],
    startsAt: "2026-11-10T00:00:00+07:00", expiresAt: "2026-12-10T00:00:00+07:00",
    defaultStartsAt: "2026-11-10T00:00:00+07:00", maxStudentsPerSession: 50,
    extraStudentSlots: 200, renewsLicenseKey: "•••• 1234", renewsExpiresAt: "2026-11-10T00:00:00+07:00",
  },
  result: {
    data: [{ publicId: "org-1", code: "e2e", status: "ACTIVE", name: "E2E" }],
    meta: { page: 0, size: 20, totalElements: 100000, totalPages: 5000 },
  },
}));

vi.mock("react", async (original) => ({
  ...(await original<typeof import("react")>()),
  useState: <T,>(initial: T | (() => T)) => {
    const index = harness.cursor++;
    if (!(index in harness.slots)) {
      harness.slots[index] = typeof initial === "function" ? (initial as () => T)() : initial;
    }
    // Each slot holds the value supplied to this useState call across simulated renders.
    return [harness.slots[index] as T, (next: T) => { harness.slots[index] = next; }];
  },
}));
vi.mock("@/features/i18n/useDebouncedSearch", () => ({
  useDebouncedSearch: (value: string) => harness.debounced ?? value.trim(),
}));
vi.mock("@/features/i18n/adminCopy", () => ({ useAdminCopy: (copy: unknown) => copy }));
vi.mock("@/features/commercialization/api", () => ({
  usePlansQuery: () => ({ data: [{ publicId: "plan-1", status: "ACTIVE", type: "EXAM_PACKAGE" }] }),
}));
vi.mock("../../../../features/licenseGrant/api", () => ({
  useTenantSearchQuery: (...args: unknown[]) => {
    harness.query(...args);
    return { data: harness.result, isError: harness.failed, refetch: harness.refetch };
  },
  useLicenseGrantPreviewQuery: () => ({ data: harness.preview,
    isFetching: harness.previewFetching, isError: harness.previewFailed }),
  useGrantLicense: () => ({ reset: vi.fn(), mutateAsync: harness.grant }),
}));
vi.mock("@pte/ui", () => ({
  BuildingIcon: () => null,
  PackageIcon: () => null,
  DocumentIcon: () => null,
  Chip: ({ children }: { children: ReactNode }) => createElement("span", null, children),
  DetailGroup: ({ title, items }: { title: string; items: { label: string; value: ReactNode }[] }) =>
    createElement("section", null, createElement("h3", null, title),
      items.map((item) => createElement("div", { key: item.label }, item.label, item.value))),
  Alert: ({ children }: { children: ReactNode }) => createElement("div", null, children),
  Button: ({ children }: { children: ReactNode }) => createElement("button", null, children),
  LoadingState: () => createElement("span", null, "Loading"),
  DescriptionList: ({ items }: { items: { label: string; value: ReactNode }[] }) =>
    createElement("div", null, items.map((item) => createElement("div", { key: item.label }, item.label, item.value))),
  DataTable: (props: { pagination: ReactNode }) => {
    harness.table(props);
    return createElement("div", null, props.pagination);
  },
  PaginationControls: (props: { meta: { totalElements: number } }) => {
    harness.pagination(props);
    return createElement("span", null, props.meta.totalElements);
  },
}));

import { useGrantLicenseFlow } from "../../../../features/licenseGrant/hooks/useGrantLicenseFlow";
import { GrantTenantSearchStep } from "../../../../features/licenseGrant/components/_GrantTenantSearchStep";
import { GrantConfirmStep } from "../../../../features/licenseGrant/components/_GrantConfirmStep";
import { GRANT_STEPS } from "../../../../features/licenseGrant/constants";

type Flow = ReturnType<typeof useGrantLicenseFlow>;
interface FlowProbeProps {
  open: boolean;
  code: string;
  capture: (flow: Flow) => void;
}
const FlowProbe = ({ open, code, capture }: FlowProbeProps): null => {
  capture(useGrantLicenseFlow(vi.fn(), code, open));
  return null;
};

const renderFlow = (open = true, code = ""): Flow => {
  harness.cursor = 0;
  let result: Flow | undefined;
  renderToStaticMarkup(createElement(FlowProbe, { open, code, capture: (flow) => { result = flow; } }));
  if (!result) throw new Error("Flow probe did not render");
  return result;
};

beforeEach(() => {
  harness.slots = [];
  harness.cursor = 0;
  harness.debounced = undefined;
  harness.failed = false;
  harness.previewFetching = false;
  harness.previewFailed = false;
  vi.clearAllMocks();
});

describe("grant organization pagination", () => {
  it("loads page zero, moves to another page, and resets on search or clear", () => {
    let flow = renderFlow();
    expect(harness.query).toHaveBeenLastCalledWith("", 0, true);
    flow.setTenantPage(3);
    flow = renderFlow();
    expect(harness.query).toHaveBeenLastCalledWith("", 3, true);
    flow.setSearch("e");
    flow = renderFlow();
    expect(harness.query).toHaveBeenLastCalledWith("e", 0, true);
    flow.setTenantPage(2);
    flow.setSearch("");
    renderFlow();
    expect(harness.query).toHaveBeenLastCalledWith("", 0, true);
  });

  it("does not fetch when closed or select stale rows while the search is debouncing", () => {
    let flow = renderFlow(false);
    expect(harness.query).toHaveBeenLastCalledWith("", 0, false);
    flow.setSearch("new");
    harness.debounced = "";
    flow = renderFlow();
    expect(harness.query).toHaveBeenLastCalledWith("", 0, false);
    renderToStaticMarkup(createElement(GrantTenantSearchStep, { flow }));
    expect(harness.table.mock.lastCall?.[0].rows).toEqual([]);
    expect(harness.table.mock.lastCall?.[0].isLoading).toBe(true);
  });

  it("keeps exact-code preselection working with the paged response", () => {
    const flow = renderFlow(true, "e2e");
    expect(flow.tenant?.publicId).toBe("org-1");
    expect(flow.step).toBe("details");
  });

  it("uses server rows/totals and requests the selected server page", () => {
    const flow = renderFlow();
    const html = renderToStaticMarkup(createElement(GrantTenantSearchStep, { flow }));
    expect(html).toContain("100000");
    expect(harness.table.mock.lastCall?.[0].clientSidePagination).toBe(false);
    expect(harness.table.mock.lastCall?.[0].rows).toHaveLength(1);
    harness.pagination.mock.lastCall?.[0].onPageChange(4);
    renderFlow();
    expect(harness.query).toHaveBeenLastCalledWith("", 4, true);
  });

  it("shows a safe load error and retry action", () => {
    harness.failed = true;
    const html = renderToStaticMarkup(createElement(GrantTenantSearchStep, { flow: renderFlow() }));
    expect(html).toContain("Could not load organizations. Please try again.");
    expect(html).toContain("Retry");
  });
});

describe("three-step grant confirmation", () => {
  const readyFlow = (): Flow => {
    let flow = renderFlow(true, "e2e");
    flow.selectPlan("plan-1");
    flow.setContractReference(" Contract-123 ");
    flow.setNote(" Note for approval ");
    flow = renderFlow(true, "e2e");
    flow.goNext();
    return renderFlow(true, "e2e");
  };

  it("uses organization, details, confirmation and validates before reaching the last step", () => {
    expect(GRANT_STEPS.map((step) => step.id)).toEqual(["tenant", "details", "confirm"]);
    let flow = renderFlow(true, "e2e");
    flow.goNext();
    flow = renderFlow(true, "e2e");
    expect(flow.step).toBe("details");
    expect(flow.errors).toEqual({ plan: true, contract: true });
    flow = readyFlow();
    expect(flow.step).toBe("confirm");
    flow.goBack();
    flow = renderFlow(true, "e2e");
    expect(flow.step).toBe("details");
    expect(flow.contractReference.trim()).toBe("Contract-123");
    flow.goBack();
    flow = renderFlow(true, "e2e");
    expect(flow.step).toBe("tenant");
    expect(flow.tenant).toBeNull();
  });

  it("summarizes organization, hosts, server timing, limits, renewal, contract and note together", () => {
    const flow = readyFlow();
    const html = renderToStaticMarkup(createElement(GrantConfirmStep, { flow }));
    for (const text of ["E2E", "e2e", "Tax code", "Address", "Facility type", "host@example.com",
      "Exam plan", "10/11/2026", "10/12/2026", "50", "•••• 1234", "Contract-123", "Note for approval"]) {
      expect(html).toContain(text);
    }
  });

  it("shows capacity and its warning instead of exam timing for student capacity grants", () => {
    const flow = { ...readyFlow(), examPackage: false };
    const html = renderToStaticMarkup(createElement(GrantConfirmStep, { flow }));
    expect(html).toContain("Student seats added");
    expect(html).toContain("200");
    expect(html).toContain("Student capacity is permanent");
    expect(html).not.toContain("Max students per exam");
  });

  it("blocks submission while confirmation is refreshing or failed, then submits once ready", async () => {
    readyFlow();
    harness.previewFetching = true;
    await renderFlow(true, "e2e").submit();
    harness.previewFetching = false;
    harness.previewFailed = true;
    await renderFlow(true, "e2e").submit();
    expect(harness.grant).not.toHaveBeenCalled();
    harness.previewFailed = false;
    await renderFlow(true, "e2e").submit();
    expect(harness.grant).toHaveBeenCalledTimes(1);
    expect(harness.grant.mock.calls[0][0].payload).toMatchObject({
      tenantId: "org-1", planId: "plan-1", contractReference: "Contract-123", note: "Note for approval",
    });
  });
});

import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  showToast: vi.fn(),
  mutateAsync: vi.fn(),
  push: vi.fn(),
  assign: vi.fn(),
  onClick: undefined as (() => void) | undefined,
  disabled: false,
  selectedPlanId: "plan-1",
  orders: [] as { publicId: string; planId: string; status: string; paymentLinkUrl: string }[],
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: state.push }),
  usePathname: () => "/host/checkout",
  useSearchParams: () => new URLSearchParams({ planId: state.selectedPlanId }),
}));
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => createElement("a", { href }, children),
}));
vi.mock("@pte/ui", () => ({
  useToast: () => ({ showToast: state.showToast }),
  Alert: ({ children }: { children: ReactNode }) => createElement("aside", null, children),
  Button: ({ onClick, disabled, children }: { onClick: () => void; disabled: boolean; children: ReactNode }) => {
    state.onClick = onClick;
    state.disabled = disabled;
    return createElement("button", { disabled }, children);
  },
  CheckCircleIcon: () => null,
  PageHeader: ({ title }: { title: string }) => createElement("h1", null, title),
  LoadingState: () => null,
  Badge: ({ children }: { children: ReactNode }) => createElement("span", null, children),
  useDashboardBreadcrumbLabel: () => undefined,
  useLocale: () => ({
    locale: "en",
    t: (_key: string, fallback: string, values?: Record<string, string | number>) =>
      values ? fallback.replace(/\{(\w+)\}/g, (_, name: string) => String(values[name] ?? "")) : fallback,
  }),
}));
vi.mock("@/features/programs/api", () => ({
  useMyOrganizations: () => ({ data: [{ name: "Ninh Organization" }] }),
}));
vi.mock("../../../../features/commercialization/components/BillingPanel", () => ({
  BillingPanel: ({ children }: { children: ReactNode }) => createElement("section", null, children),
}));
vi.mock("../../../../features/commercialization/api", () => ({
  useTenantPlansQuery: () => ({
    data: [{ publicId: "plan-1", status: "ACTIVE", price: "100", name: "Test plan", currency: "USD" }],
    isLoading: false,
  }),
  useOrdersQuery: () => ({ data: state.orders }),
  useStudentQuotaQuery: () => ({ data: { limit: 100 } }),
  useCreateOrder: () => ({ mutateAsync: state.mutateAsync, isPending: false }),
}));

import { CheckoutView } from "../../../../features/commercialization/components/CheckoutView";
import { CHECKOUT_TEXT as T } from "../../../../features/commercialization/constants";

const render = (): string => renderToStaticMarkup(createElement(CheckoutView));

afterEach(() => vi.unstubAllGlobals());

beforeEach(() => {
  vi.clearAllMocks();
  state.orders = [];
  state.selectedPlanId = "plan-1";
  state.onClick = undefined;
  vi.stubGlobal("window", { location: { assign: state.assign } });
});

describe("checkout notifications and navigation", () => {
  it("handles a rejected checkout with one toast, no banner or unhandled rejection, and allows retry", async () => {
    state.mutateAsync.mockRejectedValue(new Error("internal provider detail"));
    render();
    state.onClick?.();
    await vi.waitFor(() => expect(state.showToast).toHaveBeenCalledTimes(1));
    expect(state.showToast).toHaveBeenCalledWith(T.ORDER_ERROR, { tone: "error" });
    expect(render()).not.toContain(T.ORDER_ERROR);
    expect(state.showToast).toHaveBeenCalledTimes(1);
    state.mutateAsync.mockResolvedValue({ paymentLinkUrl: "https://payment.example/checkout" });
    state.onClick?.();
    await vi.waitFor(() => expect(state.assign).toHaveBeenCalledWith("https://payment.example/checkout"));
    expect(state.mutateAsync).toHaveBeenCalledTimes(2);
    expect(state.push).not.toHaveBeenCalled();
  });

  it("keeps the billing navigation when activation returns no payment link", async () => {
    state.mutateAsync.mockResolvedValue({ paymentLinkUrl: null });
    render();
    state.onClick?.();
    await vi.waitFor(() => expect(state.push).toHaveBeenCalledWith("/host/billing"));
    expect(state.showToast).toHaveBeenCalledTimes(1);
    expect(state.showToast).toHaveBeenCalledWith("Plan Test plan has been activated.");
  });

  it("preserves missing-plan validation and pending-payment information and status links", () => {
    state.selectedPlanId = "missing";
    expect(render()).toContain(T.SELECT_ACTIVE_PLAN);
    expect(state.onClick).toBeUndefined();
    state.selectedPlanId = "plan-1";
    state.orders = [{ publicId: "order-1", planId: "plan-1", status: "PENDING", paymentLinkUrl: "https://payment.example/existing" }];
    const html = render();
    expect(html).toContain(T.PENDING_TEXT);
    expect(html).toContain("https://payment.example/existing");
    expect(html).toContain("/host/payment-status?orderId=order-1");
    expect(state.disabled).toBe(true);
    expect(state.showToast).not.toHaveBeenCalled();
  });
});

import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LocaleProvider } from "@pte/ui";
import type { PlanResponse } from "@pte/api-client";
import { CheckoutSummary } from "../../../../features/commercialization/components/CheckoutSummary";
import { useCheckoutText } from "../../../../features/commercialization/hooks/useCheckoutText";

const capacityPlan: PlanResponse = {
  publicId: "p1",
  name: "Starter (500 users)",
  description: null,
  type: "STUDENT_CAPACITY",
  price: 0,
  currency: "VND",
  durationDays: null,
  maxStudentsPerSession: null,
  extraStudentSlots: 500,
  status: "ACTIVE",
  version: 1,
};

const examPlan: PlanResponse = {
  ...capacityPlan,
  name: "Exam 30 days",
  type: "EXAM_PACKAGE",
  price: 250000,
  durationDays: 30,
  maxStudentsPerSession: 50,
  extraStudentSlots: null,
};

const Summary = ({ plan, limit }: { plan: PlanResponse; limit?: number }) => {
  const copy = useCheckoutText();
  return (
    <CheckoutSummary
      plan={plan}
      isFree={Number(plan.price) === 0}
      organizationName="Ninh Lê Organization"
      currentStudentLimit={limit}
      copy={copy}
    />
  );
};

const render = (plan: PlanResponse, limit?: number): string =>
  renderToStaticMarkup(
    <LocaleProvider>
      <Summary plan={plan} limit={limit} />
    </LocaleProvider>,
  );

describe("CheckoutSummary (Vietnamese, the default language)", () => {
  it("spells out what a free capacity plan changes, and marks the total as free", () => {
    const html = render(capacityPlan, 1200);

    expect(html).toContain("Tóm tắt đơn hàng");
    expect(html).toContain("Mở rộng vĩnh viễn · Không tính phí định kỳ");
    expect(html).toContain("Ninh Lê Organization");
    expect(html).toContain("1.200 → 1.700 học viên");
    expect(html).toContain("text-emerald-600");
    expect(html).toContain("(+500)");
    expect(html).toContain("Tổng thanh toán");
    expect(html).toContain("Miễn phí");
  });

  it("shows only the added capacity while the current limit is unknown", () => {
    expect(render(capacityPlan)).toContain("+500 học viên");
  });

  it("describes an exam package by its duration and its per-exam cap, with no free badge", () => {
    const html = render(examPlan);

    expect(html).toContain("Gói thi");
    expect(html).toContain("30 ngày");
    expect(html).toContain("Tối đa 50");
    expect(html).toContain("250.000 VND");
    expect(html).not.toContain("Miễn phí");
  });

  it("puts the small price on the plan line and the large one on the total", () => {
    const html = render(examPlan);

    expect(html.indexOf("text-sm font-medium text-slate-900\">250.000")).toBeGreaterThan(-1);
    expect(html).toContain("text-xl font-bold");
  });
});

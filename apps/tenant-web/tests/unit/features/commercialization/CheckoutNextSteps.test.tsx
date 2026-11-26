import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LocaleProvider } from "@pte/ui";
import type { PlanResponse } from "@pte/api-client";
import { CheckoutNextSteps } from "../../../../features/commercialization/components/CheckoutNextSteps";
import { useCheckoutText } from "../../../../features/commercialization/hooks/useCheckoutText";

const capacityPlan: PlanResponse = {
  publicId: "p1",
  name: "Starter",
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
  type: "EXAM_PACKAGE",
  price: 250000,
  durationDays: 30,
  maxStudentsPerSession: 50,
  extraStudentSlots: null,
};

const Steps = ({ plan, free, limit }: { plan: PlanResponse; free: boolean; limit?: number }) => {
  const copy = useCheckoutText();
  return <CheckoutNextSteps plan={plan} isFree={free} currentStudentLimit={limit} copy={copy} />;
};

const render = (plan: PlanResponse, free: boolean, limit?: number): string =>
  renderToStaticMarkup(
    <LocaleProvider>
      <Steps plan={plan} free={free} limit={limit} />
    </LocaleProvider>,
  );

describe("CheckoutNextSteps", () => {
  it("tells what a capacity plan does to the limit, that it is permanent, and where it is recorded", () => {
    const html = render(capacityPlan, true, 1200);

    expect(html).toContain("Điều gì diễn ra tiếp theo?");
    expect(html).toContain("Hạn mức học viên tăng từ 1.200 lên 1.700 khi gói được kích hoạt.");
    expect(html).toContain("không tự động gia hạn hay phát sinh phí định kỳ");
    expect(html).toContain("ghi nhận trong lịch sử");
  });

  it("falls back to the amount added while the current limit is unknown", () => {
    expect(render(capacityPlan, true)).toContain("Hạn mức học viên tăng thêm 500 khi gói được kích hoạt.");
  });

  it("says an exam package starts when it is activated, or when payment is confirmed if it costs money", () => {
    expect(render(examPlan, true)).toContain("Gói có hiệu lực ngay sau khi kích hoạt.");
    const paid = render(examPlan, false);
    expect(paid).toContain("Gói có hiệu lực ngay khi thanh toán được xác nhận.");
    expect(paid).toContain("Dùng được trong 30 ngày, không tự động gia hạn.");
    expect(paid).not.toContain("vĩnh viễn");
  });
});

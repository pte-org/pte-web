import type { PlanResponse } from "@pte/api-client";

export interface HomePlan extends PlanResponse {
  label: string;
  audience: string;
  features: readonly string[];
}

const EXAM_DESCRIPTION = "Plan time-bound exam access around your next exam cycle.";
const CAPACITY_DESCRIPTION = "Add permanent room for the next group of learners.";

export const toHomePlan = (plan: PlanResponse, locale: "vi" | "en" = "en"): HomePlan => {
  const isExamPackage = plan.type === "EXAM_PACKAGE";
  const duration = plan.durationDays ? `${plan.durationDays} days` : "Flexible access";
  const studentLimit = plan.maxStudentsPerSession ?? "—";
  const extraSlots = plan.extraStudentSlots ?? "—";

  if (locale === "vi")
    return {
      ...plan,
      description:
        plan.description ||
        (isExamPackage
          ? "Quyền truy cập thi có thời hạn cho kỳ thi tiếp theo."
          : "Bổ sung dung lượng vĩnh viễn cho học viên mới."),
      label: isExamPackage ? "Gói thi" : "Bổ sung vĩnh viễn",
      audience: isExamPackage
        ? `Tối đa ${studentLimit} học viên mỗi ca thi`
        : `+${extraSlots} chỗ học viên`,
      features: isExamPackage
        ? [
            plan.durationDays
              ? `${plan.durationDays} ngày truy cập thi`
              : "Quyền truy cập linh hoạt",
            "Quản lý học viên và ca thi",
            "Theo dõi rõ dung lượng",
          ]
        : ["Tăng dung lượng vĩnh viễn", "Độc lập với gói thi", "Bổ sung khi cần thiết"],
    };

  return {
    ...plan,
    description: plan.description || (isExamPackage ? EXAM_DESCRIPTION : CAPACITY_DESCRIPTION),
    label: isExamPackage ? "Exam package" : "Permanent add-on",
    audience: isExamPackage
      ? `Up to ${studentLimit} students per exam`
      : `+${extraSlots} student slots`,
    features: isExamPackage
      ? [
          `${duration} of exam access`,
          "Roster and session coordination",
          "Clear capacity visibility",
        ]
      : ["Permanent capacity increase", "Separate from exam access", "Easy to add when needed"],
  };
};

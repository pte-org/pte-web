import type { PlanResponse } from "@pte/api-client";

export interface HomePlan extends PlanResponse {
  label: string;
  audience: string;
  features: readonly string[];
  featured?: boolean;
}

/**
 * Temporary presentation data for the public homepage.
 * The shape intentionally matches PlanResponse so this can be replaced by the
 * commercialization query without changing the plan-card contract.
 */
export const MOCK_HOME_PLANS = [
  {
    publicId: "mock-exam-core",
    name: "PTE Core",
    description: "A focused starting point for a single exam cycle.",
    type: "EXAM_PACKAGE",
    price: "4900000",
    currency: "VND",
    durationDays: 30,
    maxStudentsPerSession: 50,
    extraStudentSlots: null,
    status: "ACTIVE",
    label: "For focused exam runs",
    audience: "Up to 50 students per exam",
    features: [
      "30 days of exam access",
      "Roster and session coordination",
      "Clear capacity visibility",
    ],
  },
  {
    publicId: "mock-exam-complete",
    name: "PTE Complete",
    description: "Room to plan a fuller schedule across the term.",
    type: "EXAM_PACKAGE",
    price: "8900000",
    currency: "VND",
    durationDays: 90,
    maxStudentsPerSession: 100,
    extraStudentSlots: null,
    status: "ACTIVE",
    label: "Best for growing programs",
    audience: "Up to 100 students per exam",
    features: ["90 days of exam access", "More students per session", "A calmer planning window"],
    featured: true,
  },
  {
    publicId: "mock-capacity-50",
    name: "Capacity +50",
    description: "Add permanent room for the next group of learners.",
    type: "STUDENT_CAPACITY",
    price: "1500000",
    currency: "VND",
    durationDays: null,
    maxStudentsPerSession: null,
    extraStudentSlots: 50,
    status: "ACTIVE",
    label: "Permanent add-on",
    audience: "+50 student slots",
    features: [
      "Permanent capacity increase",
      "Separate from exam access",
      "Easy to add when needed",
    ],
  },
  {
    publicId: "mock-capacity-200",
    name: "Capacity +200",
    description: "Keep larger learner cohorts moving without reworking your roster.",
    type: "STUDENT_CAPACITY",
    price: "4900000",
    currency: "VND",
    durationDays: null,
    maxStudentsPerSession: null,
    extraStudentSlots: 200,
    status: "ACTIVE",
    label: "For established centers",
    audience: "+200 student slots",
    features: [
      "Permanent capacity increase",
      "Built for larger cohorts",
      "One clear quota extension",
    ],
  },
] satisfies readonly HomePlan[];

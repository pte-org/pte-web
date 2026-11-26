/** The steps the pause bar names, in the order a question goes through them; a step's rank is its place here. */
export const GATE_STEPS = ["QUEUED", "GENERATING", "VALIDATING", "REVIEWING", "RENDERING_MEDIA"] as const;
export type GateStep = (typeof GATE_STEPS)[number];

/** The name of each step a person may stop after, for the pause bar. */
export const GATE_STEP_NAMES: {
  vi: Record<GateStep, string>;
  en: Record<GateStep, string>;
} = {
  vi: {
    QUEUED: "Chờ",
    GENERATING: "Viết đề",
    VALIDATING: "Kiểm tra",
    REVIEWING: "Review",
    RENDERING_MEDIA: "Tạo media",
  },
  en: {
    QUEUED: "Queue",
    GENERATING: "Writing",
    VALIDATING: "Checks",
    REVIEWING: "Review",
    RENDERING_MEDIA: "Media",
  },
};

/** Columns of the comparison matrix that stay visible in each view; PTE Academic (column 1) is always one of them. */
export const COMPARE_VIEWS = {
  all: [1, 2, 3, 4],
  ielts: [1, 2],
  toefl: [1, 3],
  core: [1, 4],
} as const;

export type CompareView = keyof typeof COMPARE_VIEWS;

/**
 * Splits attempts as evenly as possible across the chosen examiners: attempts are shuffled,
 * then dealt round-robin, so every examiner gets floor(n/k) or ceil(n/k) attempts.
 */
export function randomExaminerAssignment(
  attemptIds: readonly string[],
  examinerIds: readonly string[],
  random: () => number = Math.random,
): Record<string, string> {
  if (examinerIds.length === 0) return {};
  const shuffled = [...attemptIds];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return Object.fromEntries(
    shuffled.map((attemptId, position) => [attemptId, examinerIds[position % examinerIds.length]]),
  );
}

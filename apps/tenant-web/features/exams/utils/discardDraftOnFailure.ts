/**
 * Runs the steps that follow a draft's creation. If any of them fails the draft is deleted (best effort: a failed
 * delete must not hide the real error) and the original error is rethrown.
 */
export async function discardDraftOnFailure<T>(
  steps: () => Promise<T>,
  deleteDraft: () => Promise<unknown>,
): Promise<T> {
  try {
    return await steps();
  } catch (error) {
    await deleteDraft().catch(() => undefined);
    throw error;
  }
}

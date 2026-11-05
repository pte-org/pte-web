import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  OperationRejectedError,
  OperationTimeoutError,
  OperationTracker,
} from "../../../../features/proctor/operationState";
import type {
  ProctorOperationErrorDto,
  ProctorOperationResultDto,
} from "../../../../features/proctor/transportTypes";

const result = (over: Partial<ProctorOperationResultDto> = {}): ProctorOperationResultDto =>
  ({ requestId: "req-1", operation: "OPEN", targetPublicId: "target-1", ...over }) as ProctorOperationResultDto;

const failure = (over: Partial<ProctorOperationErrorDto> = {}): ProctorOperationErrorDto =>
  ({ requestId: "req-1", operation: "OPEN", targetPublicId: "target-1", code: "FORBIDDEN", status: 403, ...over }) as ProctorOperationErrorDto;

describe("OperationTracker", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves a pending operation when the matching result arrives", async () => {
    const tracker = new OperationTracker();
    const pending = tracker.register("req-1", "OPEN", "target-1");

    expect(tracker.handleResult(result())).toBe(true);

    await expect(pending).resolves.toMatchObject({ requestId: "req-1" });
    expect(tracker.pendingCount).toBe(0);
  });

  it("ignores a result for an unknown request id and keeps the operation pending", () => {
    const tracker = new OperationTracker();
    void tracker.register("req-1", "OPEN", "target-1").catch(() => undefined);

    expect(tracker.handleResult(result({ requestId: "other" }))).toBe(false);
    expect(tracker.pendingCount).toBe(1);
  });

  it("does not resolve when the operation or target of the result differs", () => {
    const tracker = new OperationTracker();
    void tracker.register("req-1", "OPEN", "target-1").catch(() => undefined);

    expect(tracker.handleResult(result({ operation: "FORCE_SUBMIT" }))).toBe(false);
    expect(tracker.handleResult(result({ targetPublicId: "target-2" }))).toBe(false);
    expect(tracker.pendingCount).toBe(1);
  });

  it("rejects with OperationRejectedError carrying code, status and target when an error arrives", async () => {
    const tracker = new OperationTracker();
    const pending = tracker.register("req-1", "FORCE_SUBMIT", "target-1");

    expect(tracker.handleError(failure({ operation: "FORCE_SUBMIT" }))).toBe(true);

    const error = await pending.catch((e: unknown) => e);
    expect(error).toBeInstanceOf(OperationRejectedError);
    expect(error).toMatchObject({ code: "FORBIDDEN", status: 403, operation: "FORCE_SUBMIT", targetPublicId: "target-1" });
    expect(tracker.pendingCount).toBe(0);
  });

  it("returns false for an error whose request id is not pending", () => {
    expect(new OperationTracker().handleError(failure())).toBe(false);
  });

  it("rejects with OperationTimeoutError after the default timeout", async () => {
    const tracker = new OperationTracker(5_000);
    const pending = tracker.register("req-1", "OPEN", "target-1").catch((e: unknown) => e);

    await vi.advanceTimersByTimeAsync(4_999);
    expect(tracker.pendingCount).toBe(1);
    await vi.advanceTimersByTimeAsync(1);

    const error = await pending;
    expect(error).toBeInstanceOf(OperationTimeoutError);
    expect((error as Error).message).toContain("req-1");
    expect(tracker.pendingCount).toBe(0);
  });

  it("uses the per-operation timeout instead of the default when one is given", async () => {
    const tracker = new OperationTracker(60_000);
    const pending = tracker.register("req-1", "OPEN", "target-1", 100).catch((e: unknown) => e);

    await vi.advanceTimersByTimeAsync(100);

    expect(await pending).toBeInstanceOf(OperationTimeoutError);
  });

  it("does not time out an operation that already resolved", async () => {
    const tracker = new OperationTracker(1_000);
    const pending = tracker.register("req-1", "OPEN", "target-1");
    tracker.handleResult(result());
    await vi.advanceTimersByTimeAsync(5_000);

    await expect(pending).resolves.toBeDefined();
  });

  it("cancel rejects the operation with the given reason and reports whether it existed", async () => {
    const tracker = new OperationTracker();
    const pending = tracker.register("req-1", "OPEN", "target-1").catch((e: unknown) => e);

    expect(tracker.cancel("req-1", "Publish failed")).toBe(true);
    expect(tracker.cancel("req-1")).toBe(false);

    expect(((await pending) as Error).message).toContain("Publish failed");
  });

  it("reset rejects every pending operation and empties the tracker", async () => {
    const tracker = new OperationTracker();
    const a = tracker.register("a", "OPEN", "t").catch((e: unknown) => e);
    const b = tracker.register("b", "FLAG_VIOLATION", "t").catch((e: unknown) => e);

    tracker.reset("Socket closed");

    expect(((await a) as Error).message).toContain("Socket closed");
    expect(((await b) as Error).message).toContain("FLAG_VIOLATION");
    expect(tracker.pendingCount).toBe(0);
  });

  it("reset on an empty tracker is a no-op", () => {
    const tracker = new OperationTracker();
    tracker.reset();
    expect(tracker.pendingCount).toBe(0);
  });
});

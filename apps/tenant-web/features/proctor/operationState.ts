import type {
  PendingOperation,
  ProctorOperationErrorDto,
  ProctorOperationResultDto,
} from "./transportTypes";

export class OperationTimeoutError extends Error {
  constructor(operation: string, requestId: string) {
    super(`Operation ${operation} (${requestId}) timed out.`);
    this.name = "OperationTimeoutError";
  }
}

export class OperationRejectedError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly operation: string;
  public readonly targetPublicId?: string | null;

  constructor(errorDto: ProctorOperationErrorDto) {
    super(`Operation ${errorDto.operation} rejected with code ${errorDto.code} (${errorDto.status}).`);
    this.name = "OperationRejectedError";
    this.code = errorDto.code;
    this.status = errorDto.status;
    this.operation = errorDto.operation;
    this.targetPublicId = errorDto.targetPublicId;
  }
}

export class OperationTracker {
  private readonly pending = new Map<string, PendingOperation<ProctorOperationResultDto>>();
  private readonly defaultTimeoutMs: number;

  constructor(defaultTimeoutMs = 10_000) {
    this.defaultTimeoutMs = defaultTimeoutMs;
  }

  /**
   * Registers a pending operation with a 36-char UUID requestId.
   */
  public register(
    requestId: string,
    operation: "OPEN" | "FORCE_SUBMIT" | "FLAG_VIOLATION",
    targetPublicId: string,
    timeoutMs = this.defaultTimeoutMs,
  ): Promise<ProctorOperationResultDto> {
    return new Promise<ProctorOperationResultDto>((resolve, reject) => {
      const timerId = setTimeout(() => {
        this.pending.delete(requestId);
        reject(new OperationTimeoutError(operation, requestId));
      }, timeoutMs);

      this.pending.set(requestId, {
        requestId,
        operation,
        targetPublicId,
        createdAt: Date.now(),
        resolve,
        reject,
        timerId,
      });
    });
  }

  /**
   * Resolves a pending operation matching the given result DTO.
   * Returns true if a pending operation was resolved, false otherwise.
   */
  public handleResult(result: ProctorOperationResultDto): boolean {
    const op = this.pending.get(result.requestId);
    if (!op) return false;

    // Verify operation and target match
    if (op.operation === result.operation && op.targetPublicId === result.targetPublicId) {
      clearTimeout(op.timerId);
      this.pending.delete(result.requestId);
      op.resolve(result);
      return true;
    }
    return false;
  }

  /**
   * Rejects a pending operation matching the given error DTO.
   * Returns true if a pending operation was rejected, false otherwise.
   */
  public handleError(error: ProctorOperationErrorDto): boolean {
    const op = this.pending.get(error.requestId);
    if (!op) return false;

    clearTimeout(op.timerId);
    this.pending.delete(error.requestId);
    op.reject(new OperationRejectedError(error));
    return true;
  }

  /**
   * Cancels and removes a pending operation, e.g. when transport publish synchronously throws.
   */
  public cancel(requestId: string, reason = "Operation cancelled"): boolean {
    const op = this.pending.get(requestId);
    if (!op) return false;
    clearTimeout(op.timerId);
    this.pending.delete(requestId);
    op.reject(new Error(`${reason} for operation ${op.operation} (${requestId})`));
    return true;
  }

  /**
   * Clears and rejects all pending operations, e.g. on disconnect or socket reset.
   * Mutations are never replayed.
   */
  public reset(reason = "Socket disconnected or session reset"): void {
    for (const [requestId, op] of this.pending.entries()) {
      clearTimeout(op.timerId);
      op.reject(new Error(`${reason} for operation ${op.operation} (${requestId})`));
    }
    this.pending.clear();
  }

  public get pendingCount(): number {
    return this.pending.size;
  }
}

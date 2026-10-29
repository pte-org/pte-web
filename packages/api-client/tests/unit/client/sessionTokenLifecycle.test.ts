import { describe, expect, it, vi } from "vitest";
import { noteTokenRefreshed, subscribeTokenRefresh } from "../../../src/client/sessionTokenLifecycle";

describe("session token lifecycle", () => {
  it("notifies subscribers and supports cleanup", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeTokenRefresh(listener);

    noteTokenRefreshed("access-token");
    unsubscribe();
    noteTokenRefreshed("ignored-token");

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith("access-token");
  });

  it("isolates subscriber failures", () => {
    const failingListener = vi.fn(() => {
      throw new Error("subscriber failed");
    });
    const healthyListener = vi.fn();
    const unsubscribeFailing = subscribeTokenRefresh(failingListener);
    const unsubscribeHealthy = subscribeTokenRefresh(healthyListener);

    noteTokenRefreshed("access-token");

    unsubscribeFailing();
    unsubscribeHealthy();

    expect(failingListener).toHaveBeenCalledWith("access-token");
    expect(healthyListener).toHaveBeenCalledWith("access-token");
  });
});

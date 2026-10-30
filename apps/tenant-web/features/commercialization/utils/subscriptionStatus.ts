import type { ActivationSource, SubscriptionResponse } from "@pte/api-client";

/** A granted lane that is scheduled to start later. Display only; the API decides what is allowed. */
export function isPendingSubscription(subscription: SubscriptionResponse, now: Date = new Date()): boolean {
  return new Date(subscription.startsAt).getTime() > now.getTime();
}

/** Locale key for where the lane came from: an online purchase or a PTEPrep contract grant. */
export function activationSourceKey(source: ActivationSource | null): "payment" | "grant" {
  return source === "PAYMENT" ? "payment" : "grant";
}

const DAY_FORMAT = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

/** `dd/mm/yyyy – dd/mm/yyyy`, so a lane that starts later is recognizable in a picker. */
export function subscriptionPeriod(subscription: SubscriptionResponse): string {
  return `${DAY_FORMAT.format(new Date(subscription.startsAt))} – ${DAY_FORMAT.format(
    new Date(subscription.expiresAt),
  )}`;
}

/** `startsAt` ascending, so the running lane comes before the one that continues it. */
export function sortByStart(subscriptions: SubscriptionResponse[]): SubscriptionResponse[] {
  return [...subscriptions].sort(
    (left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime(),
  );
}

import type { AdminDashboardMessageKey } from "../messages/en";

export interface GreetingResult {
  key: AdminDashboardMessageKey;
  name: string;
}

/**
 * Returns dynamic greeting key and displayed name based on the current time of day.
 */
export function getGreeting(
  fullName?: string | null,
  hour: number = new Date().getHours(),
  fallbackName: string = "Administrator",
): GreetingResult {
  const name = fullName?.trim() || fallbackName;

  if (hour >= 5 && hour < 12) {
    return { key: "greetingMorning", name };
  }
  if (hour >= 12 && hour < 18) {
    return { key: "greetingAfternoon", name };
  }
  return { key: "greetingEvening", name };
}

import type { DashboardActivityItem } from "@pte/api-client";
import type { Locale } from "@pte/ui";
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_DISPLAY_LIMIT,
  SYSTEM_ACTOR_ID,
  type ActivityActionDescriptor,
} from "../constants";
import type { ActivityRow } from "../types";
import { formatDateTime } from "./format";

const GENERIC_ACTIVITY: ActivityActionDescriptor = { messageKey: "activityGeneric", tone: "neutral" };

/** Unknown codes use the generic label: a machine action string is never shown. */
export function describeActivityAction(action: string): ActivityActionDescriptor {
  // Own-property check: a code such as "constructor" must not resolve through the prototype.
  return Object.prototype.hasOwnProperty.call(ACTIVITY_ACTIONS, action)
    ? ACTIVITY_ACTIONS[action]
    : GENERIC_ACTIVITY;
}

/**
 * The backend only returns the actor's user id, which is never a display name. Rows written
 * without a signed-in user carry no id or the nil UUID and read as the system.
 */
export function isSystemActor(actorUserId: string | null | undefined): boolean {
  return !actorUserId || actorUserId === SYSTEM_ACTOR_ID;
}

export function buildActivityRows(
  items: readonly DashboardActivityItem[],
  locale: Locale,
  timeZone?: string,
  limit: number = ACTIVITY_DISPLAY_LIMIT,
): ActivityRow[] {
  return items.slice(0, limit).map((item) => {
    const action = describeActivityAction(item.action);
    return {
      id: item.id,
      titleKey: action.messageKey,
      tone: action.tone,
      when: formatDateTime(item.occurredAt, locale, timeZone),
      actorKey: isSystemActor(item.actorUserId) ? "actorSystem" : "actorStaff",
    };
  });
}

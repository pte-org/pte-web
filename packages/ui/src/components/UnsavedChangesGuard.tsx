"use client";

import { useEffect, useState, type ReactElement, type ReactNode } from "react";
import { useBackNavigationGuard } from "../hooks/useBackNavigationGuard";
import { ConfirmDialog } from "./ConfirmDialog";
import { getLeavingHref } from "./leavingHref";

export interface UnsavedChangesGuardProps {
  /** While true, leaving the page asks for confirmation. */
  isDirty: boolean;
  title: string;
  description: ReactNode;
  /** Button that keeps the user on the page. */
  stayLabel: string;
  /** Button that discards the changes and leaves. */
  leaveLabel: string;
  /** Goes to `href` once the user confirms; defaults to a full page load. */
  onNavigate?: (href: string) => void;
}

type PendingLeave = { kind: "link"; href: string } | { kind: "back" };

/**
 * Warns before unsaved changes are thrown away. Closing the tab, reloading or typing another
 * address shows the browser's own prompt (its text cannot be customised); a click on an
 * in-app link and the browser's Back button are intercepted and ask through the app's
 * confirm dialog instead.
 *
 * Not covered: navigation triggered from code, and Forward.
 */
export const UnsavedChangesGuard = ({
  isDirty,
  title,
  description,
  stayLabel,
  leaveLabel,
  onNavigate,
}: UnsavedChangesGuardProps): ReactElement => {
  const [pending, setPending] = useState<PendingLeave | null>(null);
  const backGuard = useBackNavigationGuard(isDirty, () => setPending({ kind: "back" }));
  const { confirmedRef } = backGuard;

  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent): void => {
      if (confirmedRef.current) return;
      event.preventDefault();
      // Some browsers only show the prompt when returnValue is set.
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, confirmedRef]);

  useEffect(() => {
    if (!isDirty) return;
    // Capture phase, so this runs before the link's own (Next.js) click handler.
    const handleClick = (event: MouseEvent): void => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const href = getLeavingHref(
        { href: anchor.href, target: anchor.target, hasDownload: anchor.hasAttribute("download") },
        window.location.href,
      );
      if (href === null) return;
      event.preventDefault();
      event.stopPropagation();
      setPending({ kind: "link", href });
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [isDirty]);

  const handleLeave = (): void => {
    const leaving = pending;
    setPending(null);
    if (leaving === null) return;
    if (leaving.kind === "back") {
      backGuard.leaveBack();
      return;
    }
    backGuard.leaveThen(() => {
      if (onNavigate) onNavigate(leaving.href);
      else window.location.assign(leaving.href);
    });
  };

  const handleStay = (): void => {
    if (pending?.kind === "back") backGuard.stay();
    setPending(null);
  };

  return (
    <ConfirmDialog
      open={pending !== null}
      title={title}
      description={description}
      confirmLabel={leaveLabel}
      cancelLabel={stayLabel}
      tone="warning"
      onConfirm={handleLeave}
      onClose={handleStay}
    />
  );
};

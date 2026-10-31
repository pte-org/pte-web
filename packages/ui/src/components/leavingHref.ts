export interface GuardedAnchor {
  /** The anchor's resolved `href` property (always absolute). */
  href: string;
  target: string;
  hasDownload: boolean;
}

/**
 * The in-app path (`/path?query#hash`) a click on `anchor` would leave for, or `null` when the
 * click is not a same-origin page change: new tab or window, download, external site, or the
 * same page (including a hash-only change). External links are left to the browser's own
 * unload prompt.
 */
export function getLeavingHref(anchor: GuardedAnchor, currentHref: string): string | null {
  if (anchor.hasDownload) return null;
  if (anchor.target !== "" && anchor.target !== "_self") return null;

  let destination: URL;
  let current: URL;
  try {
    destination = new URL(anchor.href, currentHref);
    current = new URL(currentHref);
  } catch {
    return null;
  }
  if (destination.origin !== current.origin) return null;
  if (destination.pathname === current.pathname && destination.search === current.search) {
    return null;
  }
  return `${destination.pathname}${destination.search}${destination.hash}`;
}

import type { ReactNode } from "react";

/**
 * A template, unlike the layout around it, mounts again on every navigation, so each page's content slides in.
 * The fade is opacity only for people who ask for less motion. The classes keep the spacing the frame gives its
 * content.
 */
export default function AuthPortalTemplate({ children }: { children: ReactNode }) {
  return (
    <div className="flex animate-pte-fade-up flex-col gap-5 motion-reduce:animate-pte-fade-in">{children}</div>
  );
}

import type { ReactElement } from "react";
import { cn } from "../utils/cn";

interface AvatarProps {
  name?: string;
  className?: string;
}

const initialOf = (name?: string): string => name?.trim()?.charAt(0).toUpperCase() || "A";

export const Avatar = ({ name, className }: AvatarProps): ReactElement => (
  <span
    aria-hidden="true"
    className={cn(
      "grid h-8 w-8 place-items-center rounded-full bg-[var(--brand-tint)] text-xs font-semibold text-[var(--brand-ink)] ring-1 ring-[var(--shell-border)]",
      className,
    )}
  >
    {initialOf(name)}
  </span>
);

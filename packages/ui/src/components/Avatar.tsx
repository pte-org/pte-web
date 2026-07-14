import type { ReactElement } from "react";
import { cn } from "../utils/cn";

interface AvatarProps {
  name?: string;
  className?: string;
}

const initialOf = (name?: string): string =>
  name?.trim()?.charAt(0).toUpperCase() ?? "•";

export const Avatar = ({ name, className }: AvatarProps): ReactElement => (
  <span
    aria-hidden="true"
    className={cn(
      "grid h-8 w-8 place-items-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600",
      className,
    )}
  >
    {initialOf(name)}
  </span>
);

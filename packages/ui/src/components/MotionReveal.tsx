import type { CSSProperties, HTMLAttributes, ReactElement, ReactNode } from "react";
import { cn } from "../utils/cn";

export interface MotionRevealProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  delayMs?: number;
}

/**
 * Layout-neutral presentation wrapper for short, reduced-motion-safe reveals.
 * It owns no state and does not affect data or interaction contracts.
 */
export const MotionReveal = ({
  children,
  className,
  delayMs = 0,
  style,
  ...props
}: MotionRevealProps): ReactElement => (
  <div
    {...props}
    className={cn("motion-safe:animate-pte-fade-up", className)}
    style={{
      ...style,
      animationDelay: delayMs > 0 ? `${delayMs}ms` : style?.animationDelay,
    } as CSSProperties}
  >
    {children}
  </div>
);

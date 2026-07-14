import type { ReactElement, ReactNode } from "react";
import { cn } from "../utils/cn";

interface FormActionsProps {
  children: ReactNode;
  align?: "start" | "end" | "between";
  className?: string;
}

const ALIGN_CLASS: Record<NonNullable<FormActionsProps["align"]>, string> = {
  start: "justify-start",
  end: "justify-end",
  between: "justify-between",
};

export const FormActions = ({
  children,
  align = "end",
  className,
}: FormActionsProps): ReactElement => (
  <div
    className={cn(
      "flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row",
      ALIGN_CLASS[align],
      className,
    )}
  >
    {children}
  </div>
);

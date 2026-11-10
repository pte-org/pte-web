"use client";

import { useEffect, useRef, type ComponentProps, type ReactElement } from "react";
import { Textarea } from "@pte/ui";

type AutoGrowTextareaProps = Omit<ComponentProps<typeof Textarea>, "rows"> & { value: string; minRows?: number };

const DEFAULT_MIN_ROWS = 3;

/** A text box as tall as its text: it grows and shrinks as the text or the width of the page changes, without a scroll bar. */
export const AutoGrowTextarea = ({ value, minRows = DEFAULT_MIN_ROWS, ...props }: AutoGrowTextareaProps): ReactElement => {
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // The shared Textarea does not hand out its element, so it is found inside the wrapper.
    const element = wrapper.current?.querySelector("textarea");
    if (!element) return;
    const fit = (): void => {
      // The height is measured from the text, so it has to be set on the element itself.
      element.style.height = "auto";
      element.style.height = `${element.scrollHeight}px`;
    };
    fit();
    // A narrower box wraps the same text onto more lines.
    const resizes = new ResizeObserver(fit);
    resizes.observe(element);
    return () => resizes.disconnect();
  }, [value]);

  return (
    <div ref={wrapper}>
      <Textarea {...props} rows={minRows} value={value} className={`${props.className ?? ""} resize-none overflow-hidden`} />
    </div>
  );
};

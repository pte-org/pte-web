import type { ReactElement } from "react";
import Link from "next/link";

interface SourceRefsProps {
  ids: readonly number[];
  label: string;
}

/** Superscript citation links that jump to the sources list at the bottom of the page. */
export const SourceRefs = ({ ids, label }: SourceRefsProps): ReactElement | null => {
  if (ids.length === 0) return null;
  return (
    <sup className="ml-1 whitespace-nowrap text-xs" aria-label={label}>
      {ids.map((id) => (
        <Link key={id} href={`#source-${id}`} className="mr-0.5 text-action hover:underline">
          [{id}]
        </Link>
      ))}
    </sup>
  );
};

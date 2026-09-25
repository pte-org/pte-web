import type { ReactElement } from "react";
import { DescriptionList, type DescriptionItem } from "@pte/ui";

interface DetailGroupProps {
  title: string;
  items: DescriptionItem[];
}

/** A labeled subsection of a detail card — splits a long flat field list into scannable groups. */
export const DetailGroup = ({ title, items }: DetailGroupProps): ReactElement => (
  <div className="border-t border-gray-100 pt-4 first:border-t-0 first:pt-0">
    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</h3>
    <DescriptionList items={items} />
  </div>
);

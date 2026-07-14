import type { ReactElement, ReactNode } from "react";

export interface DescriptionItem {
  label: string;
  value: ReactNode;
}

interface DescriptionListProps {
  items: DescriptionItem[];
}

export const DescriptionList = ({ items }: DescriptionListProps): ReactElement => (
  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
    {items.map((item) => (
      <div key={item.label}>
        <dt className="text-xs font-semibold uppercase text-gray-500">
          {item.label}
        </dt>
        <dd className="mt-1 text-sm text-gray-900">{item.value}</dd>
      </div>
    ))}
  </dl>
);

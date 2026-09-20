"use client";

import type { ReactElement, ReactNode } from "react";
import { Dropdown, type DropdownItem } from "./Dropdown";

/** Domain-neutral row actions shared by tenant and vendor CRUD screens. */
export interface ActionMenuProps {
  items: DropdownItem[];
  label?: string;
  trigger?: ReactNode;
  triggerClassName?: string;
  align?: "left" | "right";
}

export type ActionMenuItem = DropdownItem;

export const ActionMenu = ({
  items,
  label = "Row actions",
  trigger,
  triggerClassName,
  align = "right",
}: ActionMenuProps): ReactElement => (
  <Dropdown
    items={items}
    label={label}
    trigger={trigger}
    triggerClassName={triggerClassName}
    align={align}
  />
);

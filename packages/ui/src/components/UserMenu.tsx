import type { ReactElement, ReactNode } from "react";
import { Avatar } from "./Avatar";
import { Dropdown, type DropdownItem } from "./Dropdown";

interface UserMenuProps {
  name: string;
  email?: string;
  items: DropdownItem[];
  avatar?: ReactNode;
}

export const UserMenu = ({
  name,
  email,
  items,
  avatar,
}: UserMenuProps): ReactElement => (
  <Dropdown
    items={items}
    triggerClassName="h-auto w-auto rounded-md px-2 py-1"
    trigger={
      <div className="flex items-center gap-2">
        {avatar ?? <Avatar name={name} />}
        <div className="hidden text-left sm:block">
          <p className="text-sm font-medium text-gray-900">{name}</p>
          {email && <p className="text-xs text-gray-500">{email}</p>}
        </div>
      </div>
    }
  />
);

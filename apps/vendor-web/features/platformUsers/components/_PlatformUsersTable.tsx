"use client";

import type { ReactNode } from "react";
import {
  Badge,
  Button,
  Checkbox,
  DataTable,
  Select,
} from "@pte/ui";
import type { PlatformAssignableRole, UserResponse } from "@pte/api-client";
import type { PlatformUserAction } from "../types";
import { PlatformUserRowActions } from "./_PlatformUserRowActions";
import type { PlatformUserText } from "../constants";
import { ShieldIcon } from "@pte/ui";

type Option = { value: string; label: string };

type PlatformUsersTableProps = {
  copy: PlatformUserText;
  rows: UserResponse[];
  currentUserId?: string;
  roleOptions: readonly Option[];
  statusOptions: readonly Option[];
  statusLabels: Record<"ACTIVE" | "SUSPENDED", string>;
  getRoleLabel: (role: string) => string;
  isLoading: boolean;
  search: string;
  roleFilter: PlatformAssignableRole | "";
  statusFilter: UserResponse["status"] | "";
  includeArchived: boolean;
  pagination: ReactNode;
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (value: PlatformAssignableRole | "") => void;
  onStatusFilterChange: (value: UserResponse["status"] | "") => void;
  onIncludeArchivedChange: (value: boolean) => void;
  onCreate: () => void;
  onEditProfile: (user: UserResponse) => void;
  onEditRoles: (user: UserResponse) => void;
  onAction: (user: UserResponse, action: PlatformUserAction) => void;
};

export const PlatformUsersTable = ({
  copy,
  rows,
  currentUserId,
  roleOptions,
  statusOptions,
  statusLabels,
  getRoleLabel,
  isLoading,
  search,
  roleFilter,
  statusFilter,
  includeArchived,
  pagination,
  onSearchChange,
  onRoleFilterChange,
  onStatusFilterChange,
  onIncludeArchivedChange,
  onCreate,
  onEditProfile,
  onEditRoles,
  onAction,
}: PlatformUsersTableProps) => (
  <DataTable
    columns={[
      {
        key: "identity",
        header: copy.FULL_NAME,
        cell: (user: UserResponse) => {
          const isProtected =
            user.publicId === currentUserId || user.roles.includes("PLATFORM_ADMIN");
          return (
            <div>
              <p className="font-medium text-[var(--ink-primary)]">{user.fullName}</p>
              <p className="mt-1 text-xs text-[var(--ink-muted)]">{user.email}</p>
              {isProtected && (
                <Badge variant="info" className="mt-2">
                  <ShieldIcon className="h-3 w-3" />
                  {copy.PROTECTED}
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        key: "roles",
        header: copy.ROLE,
        cell: (user: UserResponse) => user.roles.map(getRoleLabel).join(", "),
      },
      {
        key: "status",
        header: copy.STATUS,
        cell: (user: UserResponse) => (
          <Badge
            variant={
              user.archived ? "warning" : user.status === "ACTIVE" ? "success" : "neutral"
            }
          >
            {user.archived
              ? copy.ARCHIVED
              : statusLabels[user.status as "ACTIVE" | "SUSPENDED"] ?? user.status}
          </Badge>
        ),
      },
    ]}
    rows={rows}
    getRowKey={(user) => user.publicId}
    isLoading={isLoading}
    emptyTitle={isLoading ? copy.LOADING : copy.EMPTY}
    searchPlaceholder={copy.SEARCH_PLACEHOLDER}
    searchAriaLabel={copy.SEARCH_PLACEHOLDER}
    searchValue={search}
    onSearchChange={onSearchChange}
    filters={
      <>
        <div className="w-full sm:w-auto sm:min-w-[150px]">
          <Select
            id="platform-user-role-filter"
            aria-label={copy.FILTER_ROLE}
            options={[{ value: "", label: copy.ALL_ROLES }, ...roleOptions]}
            value={roleFilter}
            variant="table"
            onChange={(event) => onRoleFilterChange(event.target.value as PlatformAssignableRole | "")}
          />
        </div>
        <div className="w-full sm:w-auto sm:min-w-[150px]">
          <Select
            id="platform-user-status-filter"
            aria-label={copy.FILTER_STATUS}
            options={statusOptions}
            value={statusFilter}
            variant="table"
            onChange={(event) => onStatusFilterChange(event.target.value as UserResponse["status"] | "")}
          />
        </div>
        <Checkbox
          id="platform-user-show-archived"
          label={copy.SHOW_ARCHIVED}
          checked={includeArchived}
          onChange={(event) => onIncludeArchivedChange(event.target.checked)}
        />
      </>
    }
    clientSideFiltering={false}
    toolbarActions={<Button onClick={onCreate}>{copy.CREATE}</Button>}
    rowActions={(user) => (
      <PlatformUserRowActions
        user={user}
        currentUserId={currentUserId}
        copy={copy}
        onEditProfile={onEditProfile}
        onEditRoles={onEditRoles}
        onAction={onAction}
      />
    )}
    rowActionsHeader={copy.ACTIONS}
    clientSidePagination={false}
    pagination={pagination}
  />
);

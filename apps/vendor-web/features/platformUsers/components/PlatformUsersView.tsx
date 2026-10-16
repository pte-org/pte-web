"use client";

import type { ReactElement } from "react";
import { Alert, PaginationControls } from "@pte/ui";
import { getUserFacingApiErrorMessage } from "@pte/api-client";
import { usePlatformUsersController } from "../hooks/usePlatformUsersController";
import {
  PlatformUserCreateModal,
  PlatformUserProfileModal,
  PlatformUserRoleModal,
} from "./_PlatformUserModals";
import { PlatformUserActionDialog } from "./_PlatformUserActionDialog";
import { PlatformUsersTable } from "./_PlatformUsersTable";

export const PlatformUsersView = (): ReactElement => {
  const controller = usePlatformUsersController();
  const {
    T,
    users,
    create,
    updateRoles,
    updateProfile,
    actionMutation,
    createOpen,
    createDraft,
    editing,
    editRole,
    profileTarget,
    action,
    actionTarget,
    search,
    roleFilter,
    statusFilter,
    includeArchived,
  } = controller;

  return (
    <div className="flex flex-col gap-5">
      {Boolean(users.error) && (
        <Alert tone="error">{getUserFacingApiErrorMessage(users.error, T.ERROR)}</Alert>
      )}
      <PlatformUsersTable
        copy={T}
        rows={users.data?.data ?? []}
        currentUserId={controller.currentUser?.publicId}
        roleOptions={controller.roleOptions}
        statusOptions={controller.statusOptions}
        statusLabels={controller.statusLabels}
        getRoleLabel={controller.getRoleLabel}
        isLoading={users.isLoading}
        search={search}
        roleFilter={roleFilter}
        statusFilter={statusFilter}
        includeArchived={includeArchived}
        onSearchChange={(value) => {
          controller.setSearch(value);
          controller.setPage(0);
        }}
        onRoleFilterChange={(value) => {
          controller.setRoleFilter(value);
          controller.setPage(0);
        }}
        onStatusFilterChange={(value) => {
          controller.setStatusFilter(value);
          controller.setPage(0);
        }}
        onIncludeArchivedChange={(value) => {
          controller.setIncludeArchived(value);
          controller.setPage(0);
        }}
        onCreate={controller.openCreate}
        onEditProfile={(user) => {
          controller.updateProfile.reset();
          controller.setProfileTarget(user);
        }}
        onEditRoles={controller.openRoleEditor}
        onAction={controller.openAction}
        pagination={
          users.data ? (
            <PaginationControls
              meta={users.data.meta}
              onPageChange={controller.setPage}
              disabled={users.isFetching}
            />
          ) : undefined
        }
      />
      <PlatformUserCreateModal
        open={createOpen}
        draft={createDraft}
        error={create.error}
        isPending={create.isPending}
        onDraftChange={controller.setCreateDraft}
        onSubmit={(event) => void controller.createUser(event)}
        onClose={controller.closeCreate}
      />
      <PlatformUserRoleModal
        target={editing}
        role={editRole}
        error={updateRoles.error}
        isPending={updateRoles.isPending}
        onRoleChange={controller.setEditRole}
        onSave={() => void controller.saveRoles()}
        onClose={controller.closeRoleEditor}
      />
      <PlatformUserProfileModal
        key={profileTarget?.publicId ?? "closed"}
        target={profileTarget}
        error={updateProfile.error}
        isPending={updateProfile.isPending}
        onSave={(draft) => void controller.saveProfile(draft)}
        onClose={() => {
          if (!updateProfile.isPending) controller.setProfileTarget(null);
        }}
      />
      <PlatformUserActionDialog
        action={action}
        target={actionTarget}
        error={actionMutation.error}
        isPending={actionMutation.isPending}
        onConfirm={() => void controller.confirmAction()}
        onClose={controller.closeAction}
      />
    </div>
  );
};

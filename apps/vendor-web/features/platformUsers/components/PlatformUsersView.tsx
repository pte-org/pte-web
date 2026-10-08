"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import {
  ActionMenu,
  Alert,
  Badge,
  BanIcon,
  Button,
  CheckCircleIcon,
  DataTable,
  Input,
  Modal,
  PageHeader,
  PaginationControls,
  PencilIcon,
  Select,
  useToast,
} from "@pte/ui";
import {
  getUserFacingApiErrorMessage,
  type PlatformAssignableRole,
  type UserResponse,
} from "@pte/api-client";
import { useCurrentUser } from "@/features/auth/api";
import { roleLabel } from "@/features/auth/permissions";
import {
  useCreatePlatformUser,
  usePlatformUsers,
  useReactivatePlatformUser,
  useSuspendPlatformUser,
  useUpdatePlatformUserRoles,
} from "../api";
import {
  PLATFORM_ASSIGNABLE_ROLE_OPTIONS,
  PLATFORM_USER_TEXT as T,
} from "../constants";

const PAGE_SIZE = 100;
type RoleFilter = PlatformAssignableRole | "ALL";
type StatusFilter = UserResponse["status"] | "ALL";

type CreateDraft = {
  email: string;
  fullName: string;
  password: string;
  role: PlatformAssignableRole;
};

const INITIAL_CREATE: CreateDraft = {
  email: "",
  fullName: "",
  password: "",
  role: "PLATFORM_MANAGER",
};

const roleOptions = PLATFORM_ASSIGNABLE_ROLE_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}));

const roleValues = (user: UserResponse): PlatformAssignableRole[] =>
  user.roles.filter((role): role is PlatformAssignableRole =>
    PLATFORM_ASSIGNABLE_ROLE_OPTIONS.some((option) => option.value === role),
  );

export const PlatformUsersView = (): ReactElement => {
  const { data: currentUser } = useCurrentUser();
  const { showToast } = useToast();
  const [page, setPage] = useState(0);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [createOpen, setCreateOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState<CreateDraft>({ ...INITIAL_CREATE });
  const [editing, setEditing] = useState<UserResponse | null>(null);
  const [editRole, setEditRole] = useState<PlatformAssignableRole>("PLATFORM_MANAGER");
  const [suspendTarget, setSuspendTarget] = useState<UserResponse | null>(null);
  const users = usePlatformUsers(
    page,
    PAGE_SIZE,
    roleFilter === "ALL" ? undefined : roleFilter,
    statusFilter === "ALL" ? undefined : statusFilter,
  );
  const create = useCreatePlatformUser();
  const updateRoles = useUpdatePlatformUserRoles();
  const suspend = useSuspendPlatformUser();
  const reactivate = useReactivatePlatformUser();

  const createUser = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const email = createDraft.email.trim();
    const fullName = createDraft.fullName.trim();
    if (!email || !fullName || createDraft.password.length < 8) return;
    try {
      await create.mutateAsync({
        email,
        fullName,
        password: createDraft.password,
        roles: [createDraft.role],
      });
      showToast(T.CREATED, { tone: "success" });
      setCreateOpen(false);
      setCreateDraft({ ...INITIAL_CREATE });
    } catch {
      // The mutation error is rendered in the modal.
    }
  };

  const openRoleEditor = (user: UserResponse): void => {
    setEditing(user);
    setEditRole(roleValues(user)[0] ?? "PLATFORM_MANAGER");
    updateRoles.reset();
  };

  const saveRoles = async (): Promise<void> => {
    if (!editing) return;
    try {
      await updateRoles.mutateAsync({
        publicId: editing.publicId,
        payload: { roles: [editRole] },
      });
      showToast(T.UPDATED, { tone: "success" });
      setEditing(null);
    } catch {
      // The mutation error is rendered in the modal.
    }
  };

  const toggleSuspension = async (): Promise<void> => {
    if (!suspendTarget) return;
    try {
      if (suspendTarget.status === "ACTIVE") {
        await suspend.mutateAsync(suspendTarget.publicId);
        showToast(T.SUSPENDED, { tone: "success" });
      } else {
        await reactivate.mutateAsync(suspendTarget.publicId);
        showToast(T.REACTIVATED, { tone: "success" });
      }
      setSuspendTarget(null);
    } catch {
      // The mutation error is rendered in the confirmation dialog.
    }
  };

  const error = users.error ?? create.error ?? updateRoles.error ?? suspend.error ?? reactivate.error;
  const rows = users.data?.data ?? [];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={T.TITLE}
        subtitle={T.SUBTITLE}
        actions={<Button onClick={() => setCreateOpen(true)}>{T.CREATE}</Button>}
      />
      {Boolean(error) && <Alert tone="error">{getUserFacingApiErrorMessage(error, T.ERROR)}</Alert>}
      <div className="grid gap-3 rounded-lg bg-white p-4 shadow-card sm:grid-cols-2">
        <Select
          id="platform-user-role-filter"
          label={T.FILTER_ROLE}
          options={[
            { value: "ALL", label: T.ALL_ROLES },
            ...PLATFORM_ASSIGNABLE_ROLE_OPTIONS,
          ]}
          value={roleFilter}
          onChange={(event) => {
            setRoleFilter(event.target.value as RoleFilter);
            setPage(0);
          }}
        />
        <Select
          id="platform-user-status-filter"
          label={T.FILTER_STATUS}
          options={[
            { value: "ALL", label: T.ALL_STATUSES },
            { value: "ACTIVE", label: "Active" },
            { value: "SUSPENDED", label: "Suspended" },
          ]}
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value as StatusFilter);
            setPage(0);
          }}
        />
      </div>
      <DataTable
        columns={[
          {
            key: "identity",
            header: T.FULL_NAME,
            cell: (user: UserResponse) => (
              <div>
                <p className="font-medium text-slate-900">{user.fullName}</p>
                <p className="mt-1 text-xs text-slate-500">{user.email}</p>
              </div>
            ),
          },
          {
            key: "roles",
            header: T.ROLE,
            cell: (user: UserResponse) => user.roles.map(roleLabel).join(", "),
          },
          {
            key: "status",
            header: T.STATUS,
            cell: (user: UserResponse) => (
              <Badge variant={user.status === "ACTIVE" ? "success" : "neutral"}>
                {user.status}
              </Badge>
            ),
          },
        ]}
        rows={rows}
        getRowKey={(user) => user.publicId}
        isLoading={users.isLoading}
        emptyTitle={users.isLoading ? T.LOADING : T.EMPTY}
        rowActions={(user) => {
          const isSelf = user.publicId === currentUser?.publicId;
          const isAdmin = user.roles.includes("PLATFORM_ADMIN");
          return (
            <ActionMenu
              items={[
                {
                  label: T.EDIT_ROLES,
                  icon: PencilIcon,
                  disabled: isSelf || isAdmin,
                  onSelect: () => openRoleEditor(user),
                },
                {
                  label: user.status === "ACTIVE" ? T.SUSPEND : T.REACTIVATE,
                  icon: user.status === "ACTIVE" ? BanIcon : CheckCircleIcon,
                  danger: user.status === "ACTIVE",
                  disabled: isSelf || isAdmin,
                  onSelect: () => setSuspendTarget(user),
                },
              ]}
            />
          );
        }}
        rowActionsHeader={T.ACTIONS}
      />
      {users.data && (
        <PaginationControls
          meta={users.data.meta}
          onPageChange={setPage}
          disabled={users.isFetching}
        />
      )}

      <Modal
        open={createOpen}
        title={T.CREATE_TITLE}
        onClose={() => {
          if (!create.isPending) setCreateOpen(false);
        }}
        footer={(
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)} disabled={create.isPending}>
              {T.CANCEL}
            </Button>
            <Button type="submit" form="platform-user-create" isLoading={create.isPending}>
              {T.CREATE}
            </Button>
          </>
        )}
      >
        <form id="platform-user-create" className="space-y-4" onSubmit={(event) => void createUser(event)}>
          {Boolean(create.error) && <Alert tone="error">{getUserFacingApiErrorMessage(create.error, T.FORM_ERROR)}</Alert>}
          <Input
            id="platform-user-full-name"
            label={T.FULL_NAME}
            value={createDraft.fullName}
            onChange={(event) => setCreateDraft({ ...createDraft, fullName: event.target.value })}
            required
          />
          <Input
            id="platform-user-email"
            type="email"
            label={T.EMAIL}
            value={createDraft.email}
            onChange={(event) => setCreateDraft({ ...createDraft, email: event.target.value })}
            required
          />
          <Input
            id="platform-user-password"
            type="password"
            label={T.PASSWORD}
            helperText={T.PASSWORD_HELP}
            value={createDraft.password}
            onChange={(event) => setCreateDraft({ ...createDraft, password: event.target.value })}
            minLength={8}
            required
          />
          <Select
            id="platform-user-role"
            label={T.ROLE}
            options={roleOptions}
            value={createDraft.role}
            onChange={(event) => setCreateDraft({ ...createDraft, role: event.target.value as PlatformAssignableRole })}
          />
        </form>
      </Modal>

      <Modal
        open={editing !== null}
        title={T.EDIT_TITLE}
        onClose={() => {
          if (!updateRoles.isPending) setEditing(null);
        }}
        footer={(
          <>
            <Button variant="ghost" onClick={() => setEditing(null)} disabled={updateRoles.isPending}>
              {T.CANCEL}
            </Button>
            <Button onClick={() => void saveRoles()} isLoading={updateRoles.isPending}>
              {T.SAVE}
            </Button>
          </>
        )}
      >
        {Boolean(updateRoles.error) && <Alert tone="error">{getUserFacingApiErrorMessage(updateRoles.error, T.FORM_ERROR)}</Alert>}
        <p className="mb-4 text-sm text-slate-600">{editing?.email}</p>
        <Select
          id="platform-user-edit-role"
          label={T.ROLE}
          options={roleOptions}
          value={editRole}
          onChange={(event) => setEditRole(event.target.value as PlatformAssignableRole)}
        />
      </Modal>

      <Modal
        open={suspendTarget !== null}
        title={suspendTarget?.status === "ACTIVE" ? T.SUSPEND : T.REACTIVATE}
        onClose={() => {
          if (!suspend.isPending && !reactivate.isPending) setSuspendTarget(null);
        }}
        footer={(
          <>
            <Button variant="ghost" onClick={() => setSuspendTarget(null)}>{T.CANCEL}</Button>
            <Button
              variant={suspendTarget?.status === "ACTIVE" ? "danger" : "primary"}
              onClick={() => void toggleSuspension()}
              isLoading={suspend.isPending || reactivate.isPending}
            >
              {suspendTarget?.status === "ACTIVE" ? T.SUSPEND : T.REACTIVATE}
            </Button>
          </>
        )}
      >
        <p className="text-sm text-slate-600">
          {suspendTarget?.status === "ACTIVE" ? T.SUSPEND_CONFIRM : `${T.REACTIVATE}: ${suspendTarget?.fullName ?? ""}`}
        </p>
      </Modal>
    </div>
  );
};

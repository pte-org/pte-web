"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useToast } from "@pte/ui";
import type { PlatformAssignableRole, UserResponse } from "@pte/api-client";
import { useCurrentUser } from "@/features/auth/api";
import { roleLabel } from "@/features/auth/permissions";
import {
  useArchivePlatformUser,
  useCreatePlatformUser,
  usePlatformUsers,
  useReactivatePlatformUser,
  useResetPlatformUserPassword,
  useRestorePlatformUser,
  useSuspendPlatformUser,
  useUpdatePlatformUserProfile,
  useUpdatePlatformUserRoles,
} from "../api";
import {
  PLATFORM_ASSIGNABLE_ROLE_OPTIONS,
  PLATFORM_USER_TEXT as RAW_PLATFORM_USER_TEXT,
} from "../constants";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import type { CreateDraft, PlatformUserAction, PlatformUserProfileDraft } from "../types";

const PAGE_SIZE = 100;
const INITIAL_CREATE: CreateDraft = {
  email: "",
  fullName: "",
  role: "PLATFORM_MANAGER",
};

export const usePlatformUsersController = () => {
  const T = useAdminCopy(RAW_PLATFORM_USER_TEXT);
  const roleOptions = useAdminCopy(PLATFORM_ASSIGNABLE_ROLE_OPTIONS);
  const statusOptions = useAdminCopy([
    { value: "", label: T.ALL_STATUSES },
    { value: "ACTIVE", label: T.STATUS_ACTIVE },
    { value: "SUSPENDED", label: T.STATUS_SUSPENDED },
  ]);
  const statusLabels = useAdminCopy({
    ACTIVE: T.STATUS_ACTIVE,
    SUSPENDED: T.STATUS_SUSPENDED,
  });
  const roleLabels = useAdminCopy({
    PLATFORM_ADMIN: T.PLATFORM_ADMIN,
    PLATFORM_MANAGER: T.PLATFORM_MANAGER,
    ACADEMIC_MANAGER: T.ACADEMIC_MANAGER,
    ACADEMIC_STAFF: T.ACADEMIC_STAFF,
  });
  const getRoleLabel = (role: string): string =>
    roleLabels[role as keyof typeof roleLabels] ?? roleLabel(role);
  const { data: currentUser } = useCurrentUser();
  const { showToast } = useToast();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<PlatformAssignableRole | "">("");
  const [statusFilter, setStatusFilter] = useState<UserResponse["status"] | "">("");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState<CreateDraft>({ ...INITIAL_CREATE });
  const [editing, setEditing] = useState<UserResponse | null>(null);
  const [editRole, setEditRole] = useState<PlatformAssignableRole>("PLATFORM_MANAGER");
  const [profileTarget, setProfileTarget] = useState<UserResponse | null>(null);
  const [action, setAction] = useState<PlatformUserAction | null>(null);
  const [actionTarget, setActionTarget] = useState<UserResponse | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timeout);
  }, [search]);

  const users = usePlatformUsers(
    page,
    PAGE_SIZE,
    roleFilter || undefined,
    statusFilter || undefined,
    debouncedSearch,
    includeArchived,
  );
  const create = useCreatePlatformUser();
  const updateRoles = useUpdatePlatformUserRoles();
  const updateProfile = useUpdatePlatformUserProfile();
  const resetPassword = useResetPlatformUserPassword();
  const suspend = useSuspendPlatformUser();
  const reactivate = useReactivatePlatformUser();
  const archive = useArchivePlatformUser();
  const restore = useRestorePlatformUser();

  const actionMutation =
    action === "reset"
      ? resetPassword
      : action === "archive"
        ? archive
        : action === "restore"
          ? restore
          : action === "suspend"
            ? suspend
            : reactivate;

  const resetActionMutation = (nextAction: PlatformUserAction): void => {
    if (nextAction === "reset") resetPassword.reset();
    if (nextAction === "archive") archive.reset();
    if (nextAction === "restore") restore.reset();
    if (nextAction === "suspend") suspend.reset();
    if (nextAction === "reactivate") reactivate.reset();
  };

  const closeAction = (): void => {
    if (!actionMutation.isPending) {
      setAction(null);
      setActionTarget(null);
    }
  };

  const openAction = (user: UserResponse, nextAction: PlatformUserAction): void => {
    resetActionMutation(nextAction);
    setActionTarget(user);
    setAction(nextAction);
  };

  const createUser = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const email = createDraft.email.trim();
    const fullName = createDraft.fullName.trim();
    if (!email || !fullName) return;
    try {
      await create.mutateAsync({
        email,
        fullName,
        roles: [createDraft.role],
      });
      showToast(T.CREATED, { tone: "success" });
      setCreateOpen(false);
      setCreateDraft({ ...INITIAL_CREATE });
    } catch {
      // The mutation error is rendered in the modal.
    }
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

  const saveProfile = async (draft: PlatformUserProfileDraft): Promise<void> => {
    if (!profileTarget) return;
    try {
      await updateProfile.mutateAsync({ publicId: profileTarget.publicId, payload: draft });
      showToast(T.PROFILE_UPDATED, { tone: "success" });
      setProfileTarget(null);
    } catch {
      // The mutation error is rendered in the modal.
    }
  };

  const confirmAction = async (): Promise<void> => {
    if (!actionTarget || !action) return;
    try {
      await actionMutation.mutateAsync(actionTarget.publicId);
      const toast =
        action === "reset"
          ? T.PASSWORD_RESET
          : action === "archive"
            ? T.ARCHIVED_SUCCESS
            : action === "restore"
              ? T.RESTORED
              : action === "suspend"
                ? T.SUSPENDED
                : T.REACTIVATED;
      showToast(toast, { tone: "success" });
      closeAction();
    } catch {
      // The mutation error is rendered in the confirmation dialog.
    }
  };

  const openCreate = (): void => {
    create.reset();
    setCreateOpen(true);
  };

  const closeCreate = (): void => {
    if (!create.isPending) setCreateOpen(false);
  };

  const openRoleEditor = (user: UserResponse): void => {
    updateRoles.reset();
    setEditing(user);
    setEditRole(
      user.roles.filter((role): role is PlatformAssignableRole =>
        PLATFORM_ASSIGNABLE_ROLE_OPTIONS.some((option) => option.value === role),
      )[0] ?? "PLATFORM_MANAGER",
    );
  };

  const closeRoleEditor = (): void => {
    if (!updateRoles.isPending) setEditing(null);
  };

  return {
    T,
    roleOptions,
    statusOptions,
    statusLabels,
    getRoleLabel,
    currentUser,
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
    setCreateDraft,
    setEditRole,
    setProfileTarget,
    setSearch,
    setRoleFilter,
    setStatusFilter,
    setIncludeArchived,
    setPage,
    page,
    createUser,
    saveRoles,
    saveProfile,
    confirmAction,
    openCreate,
    closeCreate,
    openRoleEditor,
    closeRoleEditor,
    openAction,
    closeAction,
  };
};

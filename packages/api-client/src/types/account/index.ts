/**
 * Shape for `getCurrentUser()`/`/api/v1/auth/me` — deliberately left
 * unfixed (see Phase 0's Research Summary item 2): no backend controller
 * anywhere exposes a self-profile endpoint, so this type and its one
 * caller stay broken/unused rather than being given a false sense of
 * correctness. `role` was `Role` from `../auth` — that type was removed
 * (Phase 0, `AuthResponse` no longer carries a role) since nothing else
 * used it; kept as a loose `string` here rather than resurrecting it.
 */
export interface CurrentUser {
  id: number | string;
  name: string;
  credential: string;
  role: string;
  userType: string;
  tenantId: number | null;
  mustChangePassword: boolean;
}

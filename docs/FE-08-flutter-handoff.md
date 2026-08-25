# TASK-FE-08 — Flutter pairing with FS3 (OUT OF SCOPE here)

**Status:** Blocked / out-of-scope for the `pte-web` repository.

## Why

TASK-FE-08 is Flutter work in the **`pte-app`** repo (Flutter desktop, Windows
target). That repo is **not part of this workspace** — `pte-org/` only contains
`pte-web` (Next.js) and `pte-doc`. There is no Flutter/Dart toolchain or
`pte-app` source here, so `student_login_page.dart`, `exam_delivery_page.dart`,
and `score_page.dart` cannot be implemented from this repo.

## Handoff to whoever picks this up in `pte-app`

The contract the Flutter client must follow is already defined and tested on the
web side — mirror it:

- **Endpoints** (see `@pte/api-client` → `AUTH_ENDPOINTS`):
  - `POST /api/v1/auth/student/login`
  - `POST /api/v1/auth/admin/login`, `POST /api/v1/auth/host/login`
- **Login response:** `{ "accessToken": "<jwt>" }` only — no refresh token in the
  MVP (`JwtTokenResponse`). Store it and send `Authorization: Bearer <jwt>`.
- **Error mapping:** 400/401 on login → one generic "sai thông tin đăng nhập"
  message (no account-existence leak, US-011). 401 elsewhere → clear token + return
  to login.

Reuse these shapes so the Flutter client and the two web apps stay in lockstep with
FS1's `JwtTokenResponse`. When `pte-app` is available, pair with FS3 to build the
three pages and wire the BLoC/state layer against the contract above.

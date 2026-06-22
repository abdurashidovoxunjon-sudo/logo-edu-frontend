# Logout — Design

**Date:** 2026-06-21
**Status:** Approved

## Goal

Wire the existing `<LogOut />` icon button in `src/components/layout/Sidebar.tsx` (line 109) to a backend logout call, clear locally stored auth, and redirect the user to `/login`.

## Backend Contract

**Endpoint:** `POST {VITE_API_URL}/api/v1/auth/logout`

**Request:** No body. The axios request interceptor automatically attaches `Authorization: Bearer <token>` from localStorage.

**Response:** Whatever the server returns is not consumed. The client treats logout as best-effort on the server side — local cleanup runs regardless of the result.

## Files

**Modified:**
- `src/api/auth.ts` — add `logout()` function: `POST /auth/logout`, catches and swallows any error so callers never have to handle failure
- `src/components/layout/Sidebar.tsx` — add `onClick` handler to the existing logout button:
  1. `await logout()` (won't throw)
  2. `clearAuth()` from `src/lib/auth.ts`
  3. `navigate('/login')` via `useNavigate`

## Flow

1. User clicks the logout icon in the sidebar footer
2. Frontend sends `POST /auth/logout` with the current token
3. Regardless of response (success, error, network failure):
   - localStorage `auth_token` and `auth_user` are cleared via `clearAuth()`
   - React Router navigates to `/login`
4. On `/login`, `ProtectedRoute` is no longer in the way; the login form is shown fresh

## Error Handling

- Server returns 4xx/5xx → ignored; local cleanup runs
- Network failure → ignored; local cleanup runs
- Token already invalid (401) → axios response interceptor would also fire `clearAuth` + `window.location.href = '/login'`, but our handler reaches the same end state, so the duplicate work is harmless (idempotent)

## Out of Scope

- Confirmation dialog before logging out
- Loading spinner on the logout button
- Surfacing the actual `AuthUser` (name/role) in the sidebar footer in place of the hard-coded "Admin Aliyev / Superadmin" text

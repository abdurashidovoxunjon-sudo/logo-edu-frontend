# Admin Login Backend Integration — Design

**Date:** 2026-06-21
**Status:** Approved

## Goal

Replace the fake `setTimeout` login flow in `src/pages/Login.tsx` (admin tab only) with a real call to the backend admin login endpoint, store the returned JWT in `localStorage`, and attach it as `Authorization: Bearer <token>` to all subsequent API requests.

Only the **admin** role is wired up in this iteration. The parent tab keeps its existing local fake auth.

## Backend Contract

**Endpoint:** `POST {VITE_API_URL}/api/v1/auth/admin/login`

**Request body:**

```json
{ "email": "admin@example.com", "password": "secret123" }
```

**Success response (2xx):**

```json
{
  "success": true,
  "message": "string",
  "data": {
    "token": "12|abc...",
    "user": {
      "id": 1,
      "company_id": 1,
      "role": "super_admin",
      "first_name": "Ali",
      "last_name": "Aliyev",
      "full_name": "Ali Aliyev",
      "email": "user@example.com",
      "phone": "+998901234567",
      "status": "active",
      "created_at": "2026-06-21T10:39:54.009Z"
    }
  }
}
```

**Error response:** Server returns `success: false` with a `message` field; on validation failures the response may include `errors: { email?: string[], password?: string[] }`.

## Environment

- `VITE_API_URL=http://localhost:8000` — defined in `.env` (gitignored) and `.env.example` (committed)
- Read in code as `import.meta.env.VITE_API_URL`

## Files

### New

- **`.env`** and **`.env.example`** — backend base URL
- **`src/lib/api.ts`** — axios instance
  - `baseURL = ${VITE_API_URL}/api/v1`
  - Request interceptor: if token exists, add `Authorization: Bearer <token>`
  - Response interceptor: on 401, clear stored auth and redirect to `/login`
- **`src/lib/auth.ts`** — localStorage wrappers
  - Keys: `auth_token`, `auth_user`
  - Functions: `getToken`, `setToken`, `clearToken`, `getUser`, `setUser`, `clearUser`, `isAuthenticated`, `clearAuth`
  - `User` type matches backend `data.user` shape
- **`src/api/auth.ts`** — auth API calls
  - `adminLogin({ email, password }): Promise<{ token: string; user: User }>`
- **`src/components/auth/ProtectedRoute.tsx`** — wraps protected children, renders `<Navigate to="/login" replace />` when `!isAuthenticated()`

### Modified

- **`src/App.tsx`** — wrap `<AppLayout />` route with `<ProtectedRoute>`
- **`src/pages/Login.tsx`** — admin tab submit calls `adminLogin()` instead of `setTimeout`; demo creds hint updated to `admin@example.com / secret123`; parent tab unchanged
- **`package.json`** — add `axios` dependency

## Auth Flow

1. User selects admin tab, enters email + password, clicks **Kirish**
2. `handleSubmit` calls `adminLogin({ email, password })`
3. On success: token + user saved via `setToken` / `setUser`, success splash shown
4. Splash CTA → `navigate('/')` → ProtectedRoute lets request through
5. Every subsequent API call carries `Authorization: Bearer <token>` via interceptor

## Error Handling

| Scenario | UI behavior |
|---|---|
| 401 invalid credentials | Show server `message` in `idError` (fallback: "Email yoki parol noto'g'ri") |
| 422 validation (`errors.email`) | Show first `errors.email[0]` in `idError` |
| 422 validation (`errors.password`) | Show first `errors.password[0]` in `pwError` |
| Network error / no response | Show "Server bilan bog'lanib bo'lmadi" in `idError` |
| Other 5xx | Show server `message` in `idError` (fallback: "Kutilmagan xatolik") |

Field-level errors clear when the user edits the field (existing behavior preserved).

## Out of Scope (Future)

- Logout button in app shell
- Parent role login wiring
- Token refresh / expiry handling beyond the 401 → logout redirect
- Remember-me / persistent session controls

# Admin Login Backend Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the admin tab of `src/pages/Login.tsx` to the real backend endpoint `POST /api/v1/auth/admin/login`, persist the returned JWT in `localStorage`, attach it as `Authorization: Bearer <token>` on all subsequent requests, and gate every non-login route behind a `ProtectedRoute`.

**Architecture:** A single `axios` instance (`src/lib/api.ts`) carries a request interceptor that injects the token and a response interceptor that clears auth and redirects to `/login` on 401. A thin `src/lib/auth.ts` module owns localStorage I/O. Auth API calls live in `src/api/auth.ts`. A `ProtectedRoute` component wraps the `AppLayout` route subtree in `src/App.tsx`.

**Tech Stack:** React 18, React Router 6, TypeScript, Vite, axios (new).

**Note on testing:** The codebase has no test framework configured (no vitest/jest in `package.json`). Per project scope and YAGNI, this plan uses **manual verification** instead of adding a test framework. Each task ends with explicit browser/devtools/curl checks.

---

## File Structure

**New files:**
- `.env` — `VITE_API_URL=http://localhost:8000` (gitignored)
- `.env.example` — same template, committed for other devs
- `src/lib/api.ts` — axios instance + interceptors
- `src/lib/auth.ts` — localStorage helpers + `User` type
- `src/api/auth.ts` — `adminLogin()` function + request/response types
- `src/components/auth/ProtectedRoute.tsx` — redirect guard

**Modified files:**
- `package.json` — add `axios` dependency
- `src/App.tsx` — wrap `<AppLayout />` route in `<ProtectedRoute>`
- `src/pages/Login.tsx` — admin tab uses `adminLogin()`; demo creds hint updated

---

## Task 1: Install axios and configure env

**Files:**
- Modify: `package.json` (via npm)
- Create: `.env`
- Create: `.env.example`

- [ ] **Step 1: Install axios**

Run:
```bash
npm install axios
```

Expected: `axios` appears under `dependencies` in `package.json`, lockfile updates without errors.

- [ ] **Step 2: Create `.env`**

Create `C:\Users\softe\WebstormProjects\logo-edu-frontend\.env` with content:

```
VITE_API_URL=http://localhost:8000
```

- [ ] **Step 3: Create `.env.example`**

Create `C:\Users\softe\WebstormProjects\logo-edu-frontend\.env.example` with content:

```
VITE_API_URL=http://localhost:8000
```

- [ ] **Step 4: Verify Vite picks up the env var**

Run:
```bash
npm run dev
```

Open browser devtools console at `http://localhost:5173`, evaluate:
```js
import.meta.env.VITE_API_URL
```

Expected: `"http://localhost:8000"`. Then stop the dev server (Ctrl+C).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json .env.example
git commit -m "chore: add axios and configure VITE_API_URL"
```

(Note: `.env` is intentionally not committed — it's already in `.gitignore`.)

---

## Task 2: Create auth localStorage helpers

**Files:**
- Create: `src/lib/auth.ts`

- [ ] **Step 1: Create the file**

Create `C:\Users\softe\WebstormProjects\logo-edu-frontend\src\lib\auth.ts` with content:

```typescript
export interface AuthUser {
  id: number
  company_id: number
  role: string
  first_name: string
  last_name: string
  full_name: string
  email: string
  phone: string
  status: string
  created_at: string
}

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function setUser(user: AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearUser(): void {
  localStorage.removeItem(USER_KEY)
}

export function clearAuth(): void {
  clearToken()
  clearUser()
}

export function isAuthenticated(): boolean {
  return getToken() !== null
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit
```

Expected: no errors related to the new file.

- [ ] **Step 3: Commit**

```bash
git add src/lib/auth.ts
git commit -m "feat: add auth localStorage helpers"
```

---

## Task 3: Create axios instance with interceptors

**Files:**
- Create: `src/lib/api.ts`

- [ ] **Step 1: Create the file**

Create `C:\Users\softe\WebstormProjects\logo-edu-frontend\src\lib\api.ts` with content:

```typescript
import axios from 'axios'
import { clearAuth, getToken } from './auth'

const baseURL = `${import.meta.env.VITE_API_URL}/api/v1`

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth()
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/api.ts
git commit -m "feat: add axios instance with auth interceptors"
```

---

## Task 4: Create admin login API call

**Files:**
- Create: `src/api/auth.ts`

- [ ] **Step 1: Create the file**

Create `C:\Users\softe\WebstormProjects\logo-edu-frontend\src\api\auth.ts` with content:

```typescript
import { api } from '../lib/api'
import type { AuthUser } from '../lib/auth'

export interface AdminLoginRequest {
  email: string
  password: string
}

export interface AdminLoginResult {
  token: string
  user: AuthUser
}

interface AdminLoginResponse {
  success: boolean
  message: string
  data: {
    token: string
    user: AuthUser
  }
}

export async function adminLogin(
  payload: AdminLoginRequest,
): Promise<AdminLoginResult> {
  const { data } = await api.post<AdminLoginResponse>(
    '/auth/admin/login',
    payload,
  )
  return { token: data.data.token, user: data.data.user }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/api/auth.ts
git commit -m "feat: add adminLogin API call"
```

---

## Task 5: Create ProtectedRoute component

**Files:**
- Create: `src/components/auth/ProtectedRoute.tsx`

- [ ] **Step 1: Create the file**

Create `C:\Users\softe\WebstormProjects\logo-edu-frontend\src\components\auth\ProtectedRoute.tsx` with content:

```typescript
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { isAuthenticated } from '../../lib/auth'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/auth/ProtectedRoute.tsx
git commit -m "feat: add ProtectedRoute guard component"
```

---

## Task 6: Wire ProtectedRoute into App router

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Update `src/App.tsx`**

Replace the entire file `C:\Users\softe\WebstormProjects\logo-edu-frontend\src\App.tsx` with:

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Teachers from './pages/Teachers'
import Subjects from './pages/Subjects'
import Students from './pages/Students'
import Lessons from './pages/Lessons'
import Payments from './pages/Payments'
import Parents from './pages/Parents'
import Skills from './pages/Skills'
import Assessment from './pages/Assessment'
import Reports from './pages/Reports'
import Login from './pages/Login'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="subjects" element={<Subjects />} />
          <Route path="students" element={<Students />} />
          <Route path="lessons" element={<Lessons />} />
          <Route path="payments" element={<Payments />} />
          <Route path="parents" element={<Parents />} />
          <Route path="skills" element={<Skills />} />
          <Route path="assessment" element={<Assessment />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Manually verify redirect**

Run:
```bash
npm run dev
```

In browser:
1. Open devtools → Application → Local Storage → clear any `auth_token` / `auth_user` keys
2. Navigate to `http://localhost:5173/` → should redirect to `http://localhost:5173/login`
3. Navigate to `http://localhost:5173/teachers` → should redirect to `http://localhost:5173/login`

Then stop the dev server (Ctrl+C).

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: protect app routes behind ProtectedRoute"
```

---

## Task 7: Replace admin login submit with real API call

**Files:**
- Modify: `src/pages/Login.tsx` (replace fake `setTimeout` flow in `handleSubmit` for admin tab only; update demo creds for admin; wire token + user persistence)

- [ ] **Step 1: Update the `creds` map (admin credentials only)**

In `C:\Users\softe\WebstormProjects\logo-edu-frontend\src\pages\Login.tsx`, find the `creds` object near the top of the file:

```typescript
const creds: Record<Role, { id: string; pw: string; name: string }> = {
  admin: { id: 'admin@bogchamiz.uz', pw: 'admin123', name: 'Admin Aliyev' },
  parent: { id: '+998 90 123 45 67', pw: '1234', name: 'Karim Karimov' },
}
```

Replace it with:

```typescript
const creds: Record<Role, { id: string; pw: string; name: string }> = {
  admin: { id: 'admin@example.com', pw: 'secret123', name: 'Admin' },
  parent: { id: '+998 90 123 45 67', pw: '1234', name: 'Karim Karimov' },
}
```

- [ ] **Step 2: Add imports for auth + login API**

At the top of `src/pages/Login.tsx`, just below the existing `useNavigate` import line:

```typescript
import { useNavigate } from 'react-router-dom'
```

Add these imports immediately after:

```typescript
import axios from 'axios'
import { adminLogin } from '../api/auth'
import { setToken, setUser } from '../lib/auth'
```

- [ ] **Step 3: Replace `handleSubmit` body**

Find the existing `handleSubmit` function:

```typescript
function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  let nextIdErr: string | null = null
  let nextPwErr: string | null = null
  if (!idValue.trim())
    nextIdErr = isAdmin ? 'Email kiriting' : 'Telefon raqamini kiriting'
  if (!pwValue) nextPwErr = 'Parolni kiriting'
  if (nextIdErr || nextPwErr) {
    setIdError(nextIdErr)
    setPwError(nextPwErr)
    return
  }
  setLoading(true)
  setIdError(null)
  setPwError(null)
  setTimeout(() => {
    const idOk = idValue.trim().toLowerCase() === c.id.toLowerCase()
    const pwOk = pwValue === c.pw
    if (!idOk || !pwOk) {
      setLoading(false)
      setIdError(
        idOk
          ? null
          : isAdmin
            ? 'Bu emailli foydalanuvchi topilmadi'
            : "Telefon raqami noto'g'ri",
      )
      setPwError(pwOk ? null : "Parol noto'g'ri")
      return
    }
    setLoading(false)
    setSuccess(role)
  }, 900)
}
```

Replace it with:

```typescript
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  let nextIdErr: string | null = null
  let nextPwErr: string | null = null
  if (!idValue.trim())
    nextIdErr = isAdmin ? 'Email kiriting' : 'Telefon raqamini kiriting'
  if (!pwValue) nextPwErr = 'Parolni kiriting'
  if (nextIdErr || nextPwErr) {
    setIdError(nextIdErr)
    setPwError(nextPwErr)
    return
  }
  setLoading(true)
  setIdError(null)
  setPwError(null)

  if (isAdmin) {
    try {
      const { token, user } = await adminLogin({
        email: idValue.trim(),
        password: pwValue,
      })
      setToken(token)
      setUser(user)
      setLoading(false)
      setSuccess(role)
    } catch (err) {
      setLoading(false)
      if (axios.isAxiosError(err)) {
        const status = err.response?.status
        const data = err.response?.data as
          | {
              message?: string
              errors?: { email?: string[]; password?: string[] }
            }
          | undefined

        if (data?.errors?.email?.[0]) {
          setIdError(data.errors.email[0])
        } else if (status === 401) {
          setIdError(data?.message ?? "Email yoki parol noto'g'ri")
        } else if (!err.response) {
          setIdError("Server bilan bog'lanib bo'lmadi")
        } else {
          setIdError(data?.message ?? 'Kutilmagan xatolik')
        }

        if (data?.errors?.password?.[0]) {
          setPwError(data.errors.password[0])
        }
      } else {
        setIdError('Kutilmagan xatolik')
      }
    }
    return
  }

  // parent: keep existing fake-login flow until backend is ready
  setTimeout(() => {
    const idOk = idValue.trim().toLowerCase() === c.id.toLowerCase()
    const pwOk = pwValue === c.pw
    if (!idOk || !pwOk) {
      setLoading(false)
      setIdError(
        idOk ? null : "Telefon raqami noto'g'ri",
      )
      setPwError(pwOk ? null : "Parol noto'g'ri")
      return
    }
    setLoading(false)
    setSuccess(role)
  }, 900)
}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Login.tsx
git commit -m "feat: wire admin login to backend API"
```

---

## Task 8: End-to-end manual verification

**Files:** none

Prerequisite: the backend is reachable at `http://localhost:8000` and has an admin user `admin@example.com` / `secret123`.

- [ ] **Step 1: Sanity-check the backend directly**

Run:
```bash
curl -i -X POST http://localhost:8000/api/v1/auth/admin/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"admin@example.com","password":"secret123"}'
```

Expected: HTTP 200, JSON body containing `data.token` and `data.user`. If this fails, stop and fix the backend before proceeding — the frontend cannot be verified without it.

- [ ] **Step 2: Start the dev server**

Run:
```bash
npm run dev
```

- [ ] **Step 3: Clear any prior auth**

In the browser at `http://localhost:5173`, open devtools → Application → Local Storage and remove `auth_token` and `auth_user` if present.

- [ ] **Step 4: Verify ProtectedRoute redirect**

Navigate to `http://localhost:5173/`. Expected: redirected to `/login`.

- [ ] **Step 5: Verify invalid credentials show server error**

On the Admin tab, enter `admin@example.com` / `wrongpassword` → click **Kirish**.
Expected: an error message appears under the email or password field (server `message` or "Email yoki parol noto'g'ri"). No token written to localStorage.

- [ ] **Step 6: Verify successful login**

On the Admin tab, click **→ to'ldirish** (or type) → `admin@example.com` / `secret123` → click **Kirish**.

Expected:
- Network tab shows `POST http://localhost:8000/api/v1/auth/admin/login` returning 200
- Application → Local Storage now contains `auth_token` and `auth_user` (JSON-encoded user object)
- Success splash appears with the admin's name

- [ ] **Step 7: Verify token is sent on subsequent navigation**

In the success splash, click **Admin panelga o'tish →**. Expected: navigates to `/` and renders the dashboard (no redirect back to `/login`).

Reload the page. Expected: still on dashboard, no redirect — token survives reload.

- [ ] **Step 8: Verify 401 auto-logout**

In devtools → Application → Local Storage, edit `auth_token` to an invalid value like `"bad-token"`. Trigger any authenticated request (e.g., reload a page that calls a protected endpoint — if no such call exists yet in any current page, skip this step; the behavior will be verified once other pages are wired to the backend in a future task).

If a 401-returning endpoint is reachable: expected redirect to `/login` and cleared localStorage.

- [ ] **Step 9: Verify network-error handling**

Stop the backend (`Ctrl+C` on the backend process). On the Login page, attempt to log in again with valid creds. Expected: error message "Server bilan bog'lanib bo'lmadi" appears, loading spinner stops.

Restart the backend.

- [ ] **Step 10: Stop dev server**

Stop with `Ctrl+C`.

- [ ] **Step 11: Final commit (if any cleanup was needed during verification)**

If no code was changed during verification, skip this. Otherwise:

```bash
git add -A
git commit -m "fix: address issues from manual verification"
```

---

## Self-Review Summary

**Spec coverage check (against `docs/superpowers/specs/2026-06-21-admin-login-backend-integration-design.md`):**

| Spec item | Task |
|---|---|
| `.env` / `.env.example` with `VITE_API_URL` | Task 1 |
| `src/lib/api.ts` axios instance + interceptors | Task 3 |
| `src/lib/auth.ts` localStorage helpers + `User` type | Task 2 |
| `src/api/auth.ts` `adminLogin()` | Task 4 |
| `src/components/auth/ProtectedRoute.tsx` | Task 5 |
| `src/App.tsx` wraps `<AppLayout />` with `<ProtectedRoute>` | Task 6 |
| `src/pages/Login.tsx` admin tab calls `adminLogin()` | Task 7 |
| Demo creds hint updated | Task 7, Step 1 |
| `axios` added as dependency | Task 1 |
| Error mapping (401 / 422 / network / 5xx) | Task 7, Step 3 |
| 401 response interceptor → clear + redirect | Task 3 |

**Type consistency check:**
- `AuthUser` defined in `src/lib/auth.ts` (Task 2), re-imported in `src/api/auth.ts` (Task 4) — matches.
- `AdminLoginRequest` / `AdminLoginResult` used only in Task 4 — internal, consistent.
- `ProtectedRoute` named export — imported as named in Task 6 — matches.

**Placeholder scan:** None. Every step has either complete code or an exact command with expected output.

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

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout')
  } catch {
    // best-effort: ignore server/network errors so local cleanup always runs
  }
}

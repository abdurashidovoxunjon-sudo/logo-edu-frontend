import { api } from '../lib/api'

export interface TeacherAPI {
  id: number
  company_id: number
  first_name: string
  last_name: string
  full_name: string
  phone: string
  status: 'active' | 'inactive'
  specialty: string
  experience_years: number
  created_at: string
}

export interface CreateTeacherPayload {
  first_name: string
  last_name: string
  phone?: string
  specialty: string
  experience_years: number
  status: 'active' | 'inactive'
  password?: string
}

interface Pagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

interface ApiList<T> {
  success: boolean
  message: string
  data: T[]
  meta: { pagination: Pagination }
}

interface ApiSingle<T> {
  success: boolean
  message: string
  data: T
}

export interface FetchTeachersParams {
  search?: string
  status?: 'active' | 'inactive'
  perPage?: number
  signal?: AbortSignal
}

export async function fetchTeachers(
  params: FetchTeachersParams = {},
): Promise<{ data: TeacherAPI[]; total: number }> {
  const { search, status, perPage = 50, signal } = params
  const q = new URLSearchParams({ per_page: String(perPage) })
  if (search) q.set('search', search)
  if (status) q.set('status', status)
  const res = await api.get<ApiList<TeacherAPI>>(`/director/teachers?${q}`, { signal })
  return {
    data: Array.isArray(res.data.data) ? res.data.data : [],
    total: res.data.meta?.pagination?.total ?? 0,
  }
}

export async function fetchTeacher(id: number): Promise<TeacherAPI> {
  const res = await api.get<ApiSingle<TeacherAPI>>(`/director/teachers/${id}`)
  return res.data.data
}

export async function createTeacher(payload: CreateTeacherPayload): Promise<TeacherAPI> {
  const res = await api.post<ApiSingle<TeacherAPI>>('/director/teachers', payload)
  return res.data.data
}

export async function updateTeacher(
  id: number,
  payload: Partial<CreateTeacherPayload>,
): Promise<TeacherAPI> {
  const res = await api.put<ApiSingle<TeacherAPI>>(`/director/teachers/${id}`, payload)
  return res.data.data
}

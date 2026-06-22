import { api } from '../lib/api'

export interface SubjectAPI {
  id: number
  company_id: number
  name: string
  hourly_rate: string
  student_hourly_rate: string
  created_at: string
}

export interface SubjectPayload {
  name: string
  hourly_rate: number
  student_hourly_rate: number
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

export async function fetchSubjects(signal?: AbortSignal): Promise<SubjectAPI[]> {
  const res = await api.get<ApiList<SubjectAPI>>('/director/subjects?per_page=20', { signal })
  return Array.isArray(res.data.data) ? res.data.data : []
}

export async function fetchSubject(id: number): Promise<SubjectAPI> {
  const res = await api.get<ApiSingle<SubjectAPI>>(`/director/subjects/${id}`)
  return res.data.data
}

export async function createSubject(payload: SubjectPayload): Promise<SubjectAPI> {
  const res = await api.post<ApiSingle<SubjectAPI>>('/director/subjects', payload)
  return res.data.data
}

export async function updateSubject(id: number, payload: SubjectPayload): Promise<SubjectAPI> {
  const res = await api.put<ApiSingle<SubjectAPI>>(`/director/subjects/${id}`, payload)
  return res.data.data
}

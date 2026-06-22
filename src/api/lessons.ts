import { api } from '../lib/api'

export interface LessonAPI {
  id: number
  company_id: number
  status: string
  source: string
  end_reason: string | null
  subject: { id: number; name: string }
  student: { id: number; full_name: string }
  teacher: { id: number; full_name: string }
  started_at: string
  ended_at: string | null
  duration_minutes: number
  teacher_amount: string
  student_amount: string
}

export interface LessonPayload {
  subject_id: number
  student_id: number
  teacher_id: number
  started_at: string
  ended_at: string
}

export interface SelectOption {
  id: number
  name: string
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

interface ApiSelect<T> {
  success: boolean
  message: string | null
  data: T[]
}

export async function fetchLessons(signal?: AbortSignal): Promise<{ data: LessonAPI[]; total: number }> {
  const res = await api.get<ApiList<LessonAPI>>('/director/lessons?per_page=20', { signal })
  return {
    data: Array.isArray(res.data.data) ? res.data.data : [],
    total: res.data.meta?.pagination?.total ?? 0,
  }
}

export async function createLesson(payload: LessonPayload): Promise<LessonAPI> {
  const res = await api.post<ApiSingle<LessonAPI>>('/director/lessons', payload)
  return res.data.data
}

export async function fetchSubjectsSelect(signal?: AbortSignal): Promise<SelectOption[]> {
  const res = await api.get<ApiSelect<SelectOption>>('/director/subjects/select', { signal })
  return Array.isArray(res.data.data) ? res.data.data : []
}

export async function fetchStudentsSelect(signal?: AbortSignal): Promise<SelectOption[]> {
  const res = await api.get<ApiSelect<SelectOption>>('/director/students/select', { signal })
  return Array.isArray(res.data.data) ? res.data.data : []
}

export async function fetchTeachersSelect(signal?: AbortSignal): Promise<SelectOption[]> {
  const res = await api.get<ApiSelect<SelectOption>>('/director/teachers/select', { signal })
  return Array.isArray(res.data.data) ? res.data.data : []
}

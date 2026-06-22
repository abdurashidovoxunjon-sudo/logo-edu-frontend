import { api } from '../lib/api'

export interface StudentAPI {
  id: number
  company_id: number
  first_name: string
  last_name: string
  full_name: string
  birth_date: string
  age: number
  created_at: string
  balance?: StudentBalance | null
}

export interface StudentPayload {
  first_name: string
  last_name: string
  birth_date: string
}

export interface StudentBalance {
  charged: string
  paid: string
  debt: string
  hasDebt: boolean
}

export interface StudentLesson {
  id: number
  company_id: number
  status: string
  subject: { id: number; name: string }
  student: { id: number; full_name: string }
  teacher: { id: number; full_name: string }
  started_at: string
  ended_at: string | null
  duration_minutes: number
  teacher_amount: string
  student_amount: string
}

export interface StudentPayment {
  id: number
  company_id: number
  student: { id: number; full_name: string }
  amount: string
  paid_at: string
  note: string
  created_at: string
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
  meta: { pagination: Pagination }
}

export async function fetchStudents(signal?: AbortSignal): Promise<{ data: StudentAPI[]; total: number }> {
  const res = await api.get<ApiList<StudentAPI>>('/director/students?per_page=50', { signal })
  return {
    data: Array.isArray(res.data.data) ? res.data.data : [],
    total: res.data.meta?.pagination?.total ?? 0,
  }
}

export async function fetchStudent(id: number, signal?: AbortSignal): Promise<StudentAPI> {
  const res = await api.get<ApiSingle<StudentAPI>>(`/director/students/${id}`, { signal })
  return res.data.data
}

export async function createStudent(payload: StudentPayload): Promise<StudentAPI> {
  const res = await api.post<ApiSingle<StudentAPI>>('/director/students', payload)
  return res.data.data
}

export async function updateStudent(id: number, payload: StudentPayload): Promise<StudentAPI> {
  const res = await api.put<ApiSingle<StudentAPI>>(`/director/students/${id}`, payload)
  return res.data.data
}

export async function fetchStudentBalance(id: number, signal?: AbortSignal): Promise<StudentBalance> {
  const res = await api.get<ApiSingle<StudentBalance>>(`/director/students/${id}/balance`, { signal })
  return res.data.data
}

export async function fetchStudentLessons(id: number, signal?: AbortSignal): Promise<StudentLesson[]> {
  const res = await api.get<ApiList<StudentLesson>>(`/director/students/${id}/lessons?per_page=50`, { signal })
  return Array.isArray(res.data.data) ? res.data.data : []
}

export async function fetchStudentPayments(id: number, signal?: AbortSignal): Promise<StudentPayment[]> {
  const res = await api.get<ApiList<StudentPayment>>(`/director/students/${id}/payments?per_page=50`, { signal })
  return Array.isArray(res.data.data) ? res.data.data : []
}

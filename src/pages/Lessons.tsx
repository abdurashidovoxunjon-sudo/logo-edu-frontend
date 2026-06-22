import { useEffect, useRef, useState } from 'react'
import { BookOpen, Plus, X, Loader2, ChevronDown } from 'lucide-react'
import axios from 'axios'
import {
  fetchLessons,
  createLesson,
  fetchSubjectsSelect,
  fetchStudentsSelect,
  fetchTeachersSelect,
  type LessonAPI,
  type SelectOption,
} from '../api/lessons'
import { formatPrice } from '../utils/format'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const date = [
    String(d.getDate()).padStart(2, '0'),
    String(d.getMonth() + 1).padStart(2, '0'),
    d.getFullYear(),
  ].join('.')
  const time = [
    String(d.getHours()).padStart(2, '0'),
    String(d.getMinutes()).padStart(2, '0'),
  ].join(':')
  return `${date} · ${time}`
}

function todayStr(): string {
  const d = new Date()
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

function toIso(dateStr: string, timeStr: string): string {
  return new Date(`${dateStr}T${timeStr}:00`).toISOString()
}

function minutesBetween(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  return (eh * 60 + em) - (sh * 60 + sm)
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  in_progress: { label: 'Davom etmoqda', cls: 'text-blue-600 bg-blue-50' },
  completed:   { label: 'Yakunlangan',   cls: 'text-emerald-600 bg-emerald-50' },
  cancelled:   { label: 'Bekor qilingan', cls: 'text-red-600 bg-red-50' },
}

// ─── LessonFormModal ─────────────────────────────────────────────────────────

interface ModalState {
  subjects: SelectOption[]
  students: SelectOption[]
  teachers: SelectOption[]
  loadingOptions: boolean
}

interface FormValues {
  subject_id: string
  student_id: string
  teacher_id: string
  date: string
  start_time: string
  end_time: string
}

const DEFAULT_FORM: FormValues = {
  subject_id: '',
  student_id: '',
  teacher_id: '',
  date: todayStr(),
  start_time: '09:00',
  end_time: '09:45',
}

interface LessonFormModalProps {
  onClose: () => void
  onSaved: (lesson: LessonAPI) => void
}

function LessonFormModal({ onClose, onSaved }: LessonFormModalProps) {
  const [options, setOptions] = useState<ModalState>({
    subjects: [],
    students: [],
    teachers: [],
    loadingOptions: true,
  })
  const [form, setForm] = useState<FormValues>({ ...DEFAULT_FORM })
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const ctrl = new AbortController()
    Promise.all([
      fetchSubjectsSelect(ctrl.signal),
      fetchStudentsSelect(ctrl.signal),
      fetchTeachersSelect(ctrl.signal),
    ]).then(([subjects, students, teachers]) => {
      setOptions({ subjects, students, teachers, loadingOptions: false })
    }).catch((err) => {
      if (!axios.isCancel(err))
        setOptions((prev) => ({ ...prev, loadingOptions: false }))
    })
    return () => ctrl.abort()
  }, [])

  function setField<K extends keyof FormValues>(key: K, val: string) {
    setForm((prev) => ({ ...prev, [key]: val }))
  }

  const duration = minutesBetween(form.start_time, form.end_time)

  async function handleSave() {
    if (!form.subject_id) { setError('Fan tanlanishi shart'); return }
    if (!form.student_id) { setError("O'quvchi tanlanishi shart"); return }
    if (!form.teacher_id) { setError("O'qituvchi tanlanishi shart"); return }
    if (!form.date) { setError('Sana kiritilishi shart'); return }
    if (duration <= 0) { setError("Tugash vaqti boshlanishdan keyin bo'lishi kerak"); return }

    try {
      setSaving(true)
      setError(null)
      const lesson = await createLesson({
        subject_id: Number(form.subject_id),
        student_id: Number(form.student_id),
        teacher_id: Number(form.teacher_id),
        started_at: toIso(form.date, form.start_time),
        ended_at: toIso(form.date, form.end_time),
      })
      onSaved(lesson)
    } catch {
      setError("Saqlashda xatolik yuz berdi. Qayta urinib ko'ring.")
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-soft w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-900">Yangi dars</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {options.loadingOptions ? (
          <div className="flex items-center justify-center h-32 gap-2 text-gray-400">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Yuklanmoqda...</span>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Fan */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Fan</label>
              <div className="relative">
                <select
                  value={form.subject_id}
                  onChange={(e) => setField('subject_id', e.target.value)}
                  className="w-full appearance-none border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition pr-9 bg-white"
                >
                  <option value="">Fan tanlang</option>
                  {options.subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* O'quvchi + O'qituvchi */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">O'quvchi</label>
                <div className="relative">
                  <select
                    value={form.student_id}
                    onChange={(e) => setField('student_id', e.target.value)}
                    className="w-full appearance-none border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition pr-9 bg-white"
                  >
                    <option value="">Tanlang</option>
                    {options.students.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">O'qituvchi</label>
                <div className="relative">
                  <select
                    value={form.teacher_id}
                    onChange={(e) => setField('teacher_id', e.target.value)}
                    className="w-full appearance-none border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition pr-9 bg-white"
                  >
                    <option value="">Tanlang</option>
                    {options.teachers.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Sana */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Sana</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setField('date', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
            </div>

            {/* Vaqt */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Boshlanish</label>
                <input
                  type="time"
                  value={form.start_time}
                  onChange={(e) => setField('start_time', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Tugash</label>
                <input
                  type="time"
                  value={form.end_time}
                  onChange={(e) => setField('end_time', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>
            </div>

            {/* Duration summary */}
            {duration > 0 && (
              <div className="flex items-center justify-between bg-primary/5 border border-primary/10 rounded-xl px-4 py-2.5">
                <span className="text-sm text-gray-600">
                  Davomiylik: <span className="font-semibold text-gray-800">{duration} daqiqa</span>
                </span>
              </div>
            )}

            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        )}

        {!options.loadingOptions && (
          <div className="flex items-center justify-end gap-2 mt-6">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Bekor qilish
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-600 transition-colors disabled:opacity-60"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Saqlash
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Lessons() {
  const [lessons, setLessons] = useState<LessonAPI[]>([])
  const [, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const ctrl = new AbortController()
    abortRef.current = ctrl
    load(ctrl.signal)
    return () => ctrl.abort()
  }, [])

  async function load(signal: AbortSignal) {
    try {
      setLoading(true)
      setError(null)
      const { data, total } = await fetchLessons(signal)
      setLessons(data)
      setTotal(total)
    } catch (err) {
      if (axios.isCancel(err)) return
      setError("Ma'lumotlarni yuklashda xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  function handleSaved(lesson: LessonAPI) {
    setLessons((prev) => [lesson, ...prev])
    setTotal((prev) => prev + 1)
    setModalOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Darslar</h1>
          <p className="text-sm text-gray-500 mt-0.5">O'tilgan darslar va hisoblangan to'lovlar</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-600 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Yangi dars
        </button>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card">
        {loading ? (
          <div className="flex items-center justify-center h-48 gap-2 text-gray-400">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Yuklanmoqda...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-gray-400">
            <p className="text-sm">{error}</p>
            <button
              onClick={() => load(new AbortController().signal)}
              className="text-sm text-primary underline"
            >
              Qayta yuklash
            </button>
          </div>
        ) : lessons.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-gray-400">
            <BookOpen size={36} className="text-gray-300" />
            <p className="text-sm">Darslar topilmadi</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Sana / Vaqt
                </th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Fan
                </th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  O'quvchi
                </th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  O'qituvchi
                </th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Davom.
                </th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Summa
                </th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Holat
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {lessons.map((lesson) => {
                const status = STATUS_LABELS[lesson.status] ?? {
                  label: lesson.status,
                  cls: 'text-gray-600 bg-gray-100',
                }
                return (
                  <tr key={lesson.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5 text-sm text-gray-600 whitespace-nowrap">
                      {formatDateTime(lesson.started_at)}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">
                      {lesson.subject.name}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-700">
                      {lesson.student.full_name}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-700">
                      {lesson.teacher.full_name}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">
                      {lesson.duration_minutes} daq
                    </td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">
                      {formatPrice(parseFloat(lesson.student_amount))}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${status.cls}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <LessonFormModal
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}

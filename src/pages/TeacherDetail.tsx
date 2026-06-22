import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Loader2, ChevronRight } from 'lucide-react'
import { fetchTeacher, type TeacherAPI } from '../api/teachers'
import { formatPrice } from '../utils/format'

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-purple-100 text-purple-700',
  'bg-orange-100 text-orange-700',
  'bg-red-100 text-red-700',
  'bg-yellow-100 text-yellow-700',
  'bg-pink-100 text-pink-700',
  'bg-teal-100 text-teal-700',
]

function avatarColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length]
}

function initials(fullName: string) {
  return fullName
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

function toInputDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function formatDisplayDate(isoDate: string): string {
  const d = new Date(isoDate)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}.${mm}.${yyyy}`
}

interface LessonRow {
  id: number
  date: string
  subject_name: string
  student_name: string
  duration_min: number
  teacher_amount: number
}

export default function TeacherDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [teacher, setTeacher] = useState<TeacherAPI | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const today = new Date()
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const [dateFrom, setDateFrom] = useState(toInputDate(firstOfMonth))
  const [dateTo, setDateTo] = useState(toInputDate(today))
  const [lessons] = useState<LessonRow[]>([])
  const [lessonsLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    load(Number(id))
  }, [id])

  async function load(teacherId: number) {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchTeacher(teacherId)
      setTeacher(data)
    } catch {
      setError("O'qituvchi ma'lumotlari topilmadi")
    } finally {
      setLoading(false)
    }
  }

  const totalAmount = lessons.reduce((sum, l) => sum + l.teacher_amount, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-gray-400">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Yuklanmoqda...</span>
      </div>
    )
  }

  if (error || !teacher) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
        <p className="text-sm">{error ?? "O'qituvchi topilmadi"}</p>
        <button
          onClick={() => navigate('/teachers')}
          className="text-sm text-primary underline"
        >
          Ro'yxatga qaytish
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400">
        <Link to="/" className="hover:text-gray-600 transition-colors">
          Bosh sahifa
        </Link>
        <ChevronRight size={12} />
        <span className="text-gray-500">O'qituvchi sahifasi</span>
      </nav>

      {/* Back link */}
      <button
        onClick={() => navigate('/teachers')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors w-fit"
      >
        <ArrowLeft size={15} />
        O'qituvchilar ro'yxatiga qaytish
      </button>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
        <div className="flex items-center gap-4">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0 ${avatarColor(teacher.id)}`}
          >
            {initials(teacher.full_name)}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{teacher.full_name}</h1>
              {teacher.status === 'active' ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary-100 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Faol
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  Nofaol
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              {teacher.specialty}
              {teacher.phone && ` · ${teacher.phone}`}
              {` · ${teacher.experience_years} yil tajriba`}
            </p>
          </div>
        </div>
      </div>

      {/* Salary ledger */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Maosh hisob-kitobi</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Davr:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-700 outline-none focus:border-primary transition"
            />
            <span>—</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-700 outline-none focus:border-primary transition"
            />
          </div>
        </div>

        {lessonsLoading ? (
          <div className="flex items-center justify-center h-32 gap-2 text-gray-400">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Yuklanmoqda...</span>
          </div>
        ) : lessons.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-1 text-gray-400">
            <p className="text-sm">
              {formatDisplayDate(dateFrom)} – {formatDisplayDate(dateTo)} davrida darslar topilmadi
            </p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Sana
                  </th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Fan
                  </th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    O'quvchi
                  </th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Davom.
                  </th>
                  <th className="text-right px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Summa
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {lessons.map((lesson) => (
                  <tr key={lesson.id} className="hover:bg-gray-50/60">
                    <td className="px-6 py-3.5 text-sm text-gray-600">
                      {lesson.date}
                    </td>
                    <td className="px-6 py-3.5 text-sm font-medium text-gray-800">
                      {lesson.subject_name}
                    </td>
                    <td className="px-6 py-3.5 text-sm text-gray-600">
                      {lesson.student_name}
                    </td>
                    <td className="px-6 py-3.5 text-sm text-gray-600">
                      {lesson.duration_min} daq
                    </td>
                    <td className="px-6 py-3.5 text-sm font-semibold text-gray-900 text-right">
                      {formatPrice(lesson.teacher_amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between px-6 py-4 bg-gray-50/60 border-t border-gray-100 rounded-b-2xl">
              <span className="text-sm font-medium text-primary">
                Jami maosh · {lessons.length} ta dars
              </span>
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(totalAmount)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

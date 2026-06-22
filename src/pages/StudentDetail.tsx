import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Loader2 } from 'lucide-react'
import {
  fetchStudentBalance,
  fetchStudentLessons,
  fetchStudentPayments,
  type StudentAPI,
  type StudentBalance,
  type StudentLesson,
  type StudentPayment,
} from '../api/students'
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

function formatDate(isoStr: string): string {
  const d = new Date(isoStr)
  return [
    String(d.getDate()).padStart(2, '0'),
    String(d.getMonth() + 1).padStart(2, '0'),
    d.getFullYear(),
  ].join('.')
}

function formatDateTime(isoStr: string): string {
  const d = new Date(isoStr)
  const date = formatDate(isoStr)
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  return `${date} · ${time}`
}

type Tab = 'overview' | 'lessons' | 'payments' | 'debt' | 'skills' | 'parents'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Umumiy' },
  { id: 'lessons', label: 'Darslar' },
  { id: 'payments', label: "To'lovlar" },
  { id: 'debt', label: 'Qarzdorlik' },
  { id: 'skills', label: "Ko'nikmalar" },
  { id: 'parents', label: 'Ota-onalar' },
]

// ─── Tab panels ─────────────────────────────────────────────────────────────

function OverviewTab({ balance }: { balance: StudentBalance | null }) {
  if (!balance) {
    return (
      <div className="flex items-center justify-center h-32 gap-2 text-gray-400">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">Yuklanmoqda...</span>
      </div>
    )
  }

  const stats = [
    { label: 'Hisoblangan', value: formatPrice(parseFloat(balance.charged)), color: 'text-gray-900' },
    { label: "To'langan", value: formatPrice(parseFloat(balance.paid)), color: 'text-primary' },
    { label: 'Joriy qarz', value: formatPrice(parseFloat(balance.debt)), color: balance.hasDebt ? 'text-red-600' : 'text-gray-900' },
  ]

  return (
    <div className="grid grid-cols-3 gap-4 p-5">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-gray-50 rounded-2xl p-5">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
            {stat.label}
          </p>
          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  )
}

function LessonsTab({
  lessons,
  loading,
}: {
  lessons: StudentLesson[]
  loading: boolean
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 gap-2 text-gray-400">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">Yuklanmoqda...</span>
      </div>
    )
  }

  if (lessons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 gap-1 text-gray-400">
        <p className="text-sm">Darslar topilmadi</p>
      </div>
    )
  }

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-100">
          {['Sana', 'Fan', "O'qituvchi", 'Davom.', 'Summa'].map((h) => (
            <th
              key={h}
              className="text-left px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {lessons.map((lesson) => (
          <tr key={lesson.id} className="hover:bg-gray-50/60">
            <td className="px-6 py-3.5 text-sm text-gray-600">
              {formatDateTime(lesson.started_at)}
            </td>
            <td className="px-6 py-3.5 text-sm font-medium text-gray-800">
              {lesson.subject.name}
            </td>
            <td className="px-6 py-3.5 text-sm text-gray-600">{lesson.teacher.full_name}</td>
            <td className="px-6 py-3.5 text-sm text-gray-600">{lesson.duration_minutes} daq</td>
            <td className="px-6 py-3.5 text-sm font-semibold text-gray-900">
              {formatPrice(parseFloat(lesson.student_amount))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function PaymentsTab({
  payments,
  loading,
}: {
  payments: StudentPayment[]
  loading: boolean
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 gap-2 text-gray-400">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">Yuklanmoqda...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-900">To'lovlar tarixi</h3>
        <button
          disabled
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-primary text-white opacity-50 cursor-not-allowed"
          title="Tez kunda"
        >
          + To'lov qo'shish
        </button>
      </div>

      {payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-28 gap-1 text-gray-400">
          <p className="text-sm">To'lovlar topilmadi</p>
        </div>
      ) : (
        <table className="w-full">
          <tbody className="divide-y divide-gray-50">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50/60">
                <td className="px-6 py-3.5 text-sm text-gray-600">
                  {formatDate(payment.paid_at)}
                </td>
                <td className="px-6 py-3.5 text-sm font-semibold text-primary">
                  {formatPrice(parseFloat(payment.amount))}
                </td>
                <td className="px-6 py-3.5 text-sm text-gray-500">{payment.note || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function StubTab({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-32 gap-1 text-gray-400">
      <p className="text-sm">{label} — tez kunda</p>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function StudentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const stateStudent = (location.state as { student?: StudentAPI } | null)?.student ?? null

  const [student, setStudent] = useState<StudentAPI | null>(stateStudent)
  const [balance, setBalance] = useState<StudentBalance | null>(null)
  const [loading, setLoading] = useState(!stateStudent)
  const [error, setError] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [lessons, setLessons] = useState<StudentLesson[]>([])
  const [lessonsLoading, setLessonsLoading] = useState(false)
  const [lessonsLoaded, setLessonsLoaded] = useState(false)
  const [payments, setPayments] = useState<StudentPayment[]>([])
  const [paymentsLoading, setPaymentsLoading] = useState(false)
  const [paymentsLoaded, setPaymentsLoaded] = useState(false)

  useEffect(() => {
    if (!id) return
    const numId = Number(id)
    const controller = new AbortController()

    if (stateStudent) {
      // Student data passed via navigation state — only load balance
      fetchStudentBalance(numId, controller.signal)
        .then(setBalance)
        .catch(() => {})
    } else {
      // Direct URL access — load everything from API
      loadStudentAndBalance(numId, controller.signal)
    }

    return () => controller.abort()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function loadStudentAndBalance(studentId: number, signal: AbortSignal) {
    try {
      setLoading(true)
      setError(null)
      const [{ data: students }, balanceData] = await Promise.all([
        import('../api/students').then((m) => m.fetchStudents(signal)),
        fetchStudentBalance(studentId, signal),
      ])
      const found = students.find((s) => s.id === studentId) ?? null
      if (!found) throw new Error('not found')
      setStudent(found)
      setBalance(balanceData)
    } catch {
      setError("O'quvchi ma'lumotlari topilmadi")
    } finally {
      setLoading(false)
    }
  }

  async function loadLessons(studentId: number) {
    try {
      setLessonsLoading(true)
      const data = await fetchStudentLessons(studentId)
      setLessons(data)
      setLessonsLoaded(true)
    } catch {
      setLessonsLoaded(true)
    } finally {
      setLessonsLoading(false)
    }
  }

  async function loadPayments(studentId: number) {
    try {
      setPaymentsLoading(true)
      const data = await fetchStudentPayments(studentId)
      setPayments(data)
      setPaymentsLoaded(true)
    } catch {
      setPaymentsLoaded(true)
    } finally {
      setPaymentsLoading(false)
    }
  }

  function handleTabChange(tab: Tab) {
    setActiveTab(tab)
    const numId = Number(id)
    if (tab === 'lessons' && !lessonsLoaded) loadLessons(numId)
    if (tab === 'payments' && !paymentsLoaded) loadPayments(numId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-gray-400">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Yuklanmoqda...</span>
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
        <p className="text-sm">{error ?? "O'quvchi topilmadi"}</p>
        <button
          onClick={() => navigate('/students')}
          className="text-sm text-primary underline"
        >
          Ro'yxatga qaytish
        </button>
      </div>
    )
  }

  const debtAmount = balance ? parseFloat(balance.debt) : 0

  return (
    <div className="flex flex-col gap-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400">
        <Link to="/" className="hover:text-gray-600 transition-colors">
          Bosh sahifa
        </Link>
        <ChevronRight size={12} />
        <span className="text-gray-500">O'quvchi sahifasi</span>
      </nav>

      {/* Back */}
      <button
        onClick={() => navigate('/students')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors w-fit"
      >
        <ArrowLeft size={15} />
        O'quvchilar ro'yxatiga qaytish
      </button>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0 ${avatarColor(student.id)}`}
            >
              {initials(student.full_name)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{student.full_name}</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {student.age} yosh · ro'yxatga olingan {formatDate(student.created_at)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Joriy qarz</p>
            <p className={`text-2xl font-bold mt-0.5 ${balance?.hasDebt ? 'text-red-600' : 'text-gray-900'}`}>
              {formatPrice(debtAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs + content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card">
        <div className="flex items-center gap-1 px-4 pt-3 border-b border-gray-100">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-px ${
                activeTab === t.id
                  ? 'text-primary border-primary'
                  : 'text-gray-500 border-transparent hover:text-gray-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="min-h-[12rem]">
          {activeTab === 'overview' && <OverviewTab balance={balance} />}
          {activeTab === 'lessons' && (
            <LessonsTab lessons={lessons} loading={lessonsLoading} />
          )}
          {activeTab === 'payments' && (
            <PaymentsTab payments={payments} loading={paymentsLoading} />
          )}
          {activeTab === 'debt' && <StubTab label="Qarzdorlik" />}
          {activeTab === 'skills' && <StubTab label="Ko'nikmalar" />}
          {activeTab === 'parents' && <StubTab label="Ota-onalar" />}
        </div>
      </div>
    </div>
  )
}

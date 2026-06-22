import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Search, Plus, Eye, Pencil, X, Loader2 } from 'lucide-react'
import axios from 'axios'
import {
  fetchStudents,
  createStudent,
  updateStudent,
  type StudentAPI,
  type StudentPayload,
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

// "2020-05-12" → "12.05.2020"
function apiToDisplay(apiDate: string): string {
  if (!apiDate) return ''
  const [y, m, d] = apiDate.split('-')
  if (!y || !m || !d) return ''
  return `${d}.${m}.${y}`
}

// "12.05.2020" → "2020-05-12"  |  null if incomplete
function displayToApi(display: string): string | null {
  const parts = display.split('.')
  if (parts.length !== 3) return null
  const [dd, mm, yyyy] = parts
  if (dd.length !== 2 || mm.length !== 2 || yyyy.length !== 4) return null
  return `${yyyy}-${mm}-${dd}`
}

// Auto-format digits as user types: "12062020" → "12.06.2020"
function maskBirthDate(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8)
  if (digits.length > 4) return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`
  if (digits.length > 2) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  return digits
}

type FilterTab = 'all' | 'debt'

interface FormValues {
  firstName: string
  lastName: string
  birthDate: string
}

const DEFAULT_FORM: FormValues = { firstName: '', lastName: '', birthDate: '' }

interface ModalState {
  open: boolean
  mountKey: number
  student: StudentAPI | null
}

// ─── StudentFormModal ────────────────────────────────────────────────────────
interface StudentFormModalProps {
  student: StudentAPI | null
  onClose: () => void
  onSaved: (result: StudentAPI, isNew: boolean) => void
}

function StudentFormModal({ student, onClose, onSaved }: StudentFormModalProps) {
  const [form, setForm] = useState<FormValues>(
    student
      ? { firstName: student.first_name, lastName: student.last_name, birthDate: apiToDisplay(student.birth_date) }
      : { ...DEFAULT_FORM }
  )
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function setField<K extends keyof FormValues>(key: K, val: FormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: val }))
  }

  async function handleSave() {
    if (!form.firstName.trim()) { setFormError('Ism kiritilishi shart'); return }
    if (!form.lastName.trim()) { setFormError('Familiya kiritilishi shart'); return }
    const apiDate = displayToApi(form.birthDate)
    if (!apiDate) { setFormError("Tug'ilgan sana to'liq kiriting (KK.OO.YYYY)"); return }

    const payload: StudentPayload = {
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      birth_date: apiDate,
    }

    try {
      setSaving(true)
      setFormError(null)
      if (student) {
        const updated = await updateStudent(student.id, payload)
        onSaved(updated, false)
      } else {
        const created = await createStudent(payload)
        onSaved(created, true)
      }
    } catch {
      setFormError("Saqlashda xatolik yuz berdi. Qayta urinib ko'ring.")
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-soft w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-900">
            {student ? "O'quvchini tahrirlash" : "Yangi o'quvchi"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Ism</label>
            <input
              autoFocus
              type="text"
              placeholder="Masalan, Ali"
              value={form.firstName}
              onChange={(e) => setField('firstName', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Familiya</label>
            <input
              type="text"
              placeholder="Masalan, Karimov"
              value={form.lastName}
              onChange={(e) => setField('lastName', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
              Tug'ilgan sana
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="KK.OO.YYYY"
              maxLength={10}
              value={form.birthDate}
              onChange={(e) => setField('birthDate', maskBirthDate(e.target.value))}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>

          {formError && <p className="text-xs text-red-500">{formError}</p>}
        </div>

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
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function Students() {
  const navigate = useNavigate()
  const [students, setStudents] = useState<StudentAPI[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<FilterTab>('all')
  const [modal, setModal] = useState<ModalState>({ open: false, mountKey: 0, student: null })
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    abortRef.current = controller
    load(controller.signal)
    return () => controller.abort()
  }, [])

  async function load(signal: AbortSignal) {
    try {
      setLoading(true)
      setError(null)
      const { data, total } = await fetchStudents(signal)
      setStudents(data)
      setTotal(total)
    } catch (err) {
      if (axios.isCancel(err)) return
      setError("Ma'lumotlarni yuklashda xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setModal((prev) => ({ open: true, mountKey: prev.mountKey + 1, student: null }))
  }

  function openEdit(student: StudentAPI) {
    setModal((prev) => ({ open: true, mountKey: prev.mountKey + 1, student }))
  }

  function closeModal() {
    setModal((prev) => ({ ...prev, open: false }))
  }

  function handleSaved(result: StudentAPI, isNew: boolean) {
    if (isNew) {
      setStudents((prev) => [result, ...prev])
      setTotal((prev) => prev + 1)
    } else {
      setStudents((prev) => prev.map((s) => (s.id === result.id ? result : s)))
    }
    closeModal()
  }

  const searchLower = search.toLowerCase()
  const displayed = students
    .filter((s) => !search || s.full_name.toLowerCase().includes(searchLower))
    .filter((s) => tab !== 'debt' || s.balance?.hasDebt === true)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">O'quvchilar</h1>
          <p className="text-sm text-gray-500 mt-0.5">Jami {total} ta o'quvchi</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-600 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Yangi o'quvchi
        </button>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card">
        {/* Controls bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 flex-1 max-w-xs">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Ism bo'yicha qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
            />
          </div>

          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={() => setTab('all')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === 'all' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Barchasi
            </button>
            <button
              onClick={() => setTab('debt')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === 'debt' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Faqat qarzdorlar
            </button>
          </div>

          <span className="text-xs text-gray-400 shrink-0">
            {displayed.length} ta ko'rsatilmoqda
          </span>
        </div>

        {/* Content */}
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
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-gray-400">
            <GraduationCap size={36} className="text-gray-300" />
            <p className="text-sm">
              {tab === 'debt' ? "Qarzdor o'quvchi topilmadi" : "O'quvchi topilmadi"}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  O'quvchi
                </th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Yosh
                </th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Qarz holati
                </th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Yaratilgan
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayed.map((student) => {
                const balance = student.balance
                return (
                  <tr key={student.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${avatarColor(student.id)}`}
                        >
                          {initials(student.full_name)}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {student.full_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{student.age} yosh</td>
                    <td className="px-5 py-3.5">
                      {!balance ? (
                        <span className="text-xs text-gray-400">—</span>
                      ) : balance.hasDebt ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          {formatPrice(parseFloat(balance.debt))}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary-100 px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          Qarzi yo'q
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">
                      {formatDate(student.created_at)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => openEdit(student)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                          title="Tahrirlash"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => navigate(`/students/${student.id}`, { state: { student } })}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                          <Eye size={13} />
                          Batafsil
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {modal.open && (
        <StudentFormModal
          key={modal.mountKey}
          student={modal.student}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Search, Plus, Eye, Pencil, X, Loader2 } from 'lucide-react'
import axios from 'axios'
import {
  fetchTeachers,
  createTeacher,
  updateTeacher,
  type TeacherAPI,
  type CreateTeacherPayload,
} from '../api/teachers'

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

const SPECIALTIES = ['Logoped', 'Defektolog', 'Psixolog', 'Korreksiya pedagogi']

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

type FilterTab = 'all' | 'active' | 'inactive'

interface ModalState {
  open: boolean
  teacher: TeacherAPI | null
}

interface FormValues {
  firstName: string
  lastName: string
  phone: string
  specialty: string
  experienceYears: string
  status: 'active' | 'inactive'
  password: string
}

const DEFAULT_FORM: FormValues = {
  firstName: '',
  lastName: '',
  phone: '',
  specialty: 'Logoped',
  experienceYears: '0',
  status: 'active',
  password: '',
}

export default function Teachers() {
  const navigate = useNavigate()
  const [teachers, setTeachers] = useState<TeacherAPI[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<FilterTab>('all')
  const [modal, setModal] = useState<ModalState>({ open: false, teacher: null })
  const [form, setForm] = useState<FormValues>(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    timerRef.current && clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      load(search, tab, controller.signal)
    }, search ? 300 : 0)
    return () => {
      timerRef.current && clearTimeout(timerRef.current)
      controller.abort()
    }
  }, [search, tab])

  async function load(searchVal: string, tabVal: FilterTab, signal: AbortSignal) {
    try {
      setLoading(true)
      setError(null)
      const { data, total } = await fetchTeachers({
        search: searchVal || undefined,
        status: tabVal === 'all' ? undefined : tabVal,
        signal,
      })
      setTeachers(data)
      setTotal(total)
    } catch (err) {
      if (axios.isCancel(err)) return
      setError("Ma'lumotlarni yuklashda xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setForm(DEFAULT_FORM)
    setFormError(null)
    setModal({ open: true, teacher: null })
  }

  function openEdit(teacher: TeacherAPI) {
    const parts = teacher.full_name.trim().split(' ')
    setForm({
      firstName: parts[0] ?? '',
      lastName: parts.slice(1).join(' '),
      phone: teacher.phone ?? '',
      specialty: teacher.specialty,
      experienceYears: String(teacher.experience_years),
      status: teacher.status,
      password: '',
    })
    setFormError(null)
    setModal({ open: true, teacher })
  }

  function closeModal() {
    setModal({ open: false, teacher: null })
  }

  function setField<K extends keyof FormValues>(key: K, val: FormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: val }))
  }

  async function handleSave() {
    if (!form.firstName.trim()) {
      setFormError("Ism kiritilishi shart")
      return
    }
    if (!form.lastName.trim()) {
      setFormError("Familiya kiritilishi shart")
      return
    }
    if (!modal.teacher && !form.password.trim()) {
      setFormError("Parol kiritilishi shart")
      return
    }
    const payload: CreateTeacherPayload = {
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      phone: form.phone.trim() || undefined,
      specialty: form.specialty,
      experience_years: parseInt(form.experienceYears, 10) || 0,
      status: form.status,
      password: form.password.trim() || undefined,
    }
    try {
      setSaving(true)
      setFormError(null)
      if (modal.teacher) {
        const updated = await updateTeacher(modal.teacher.id, payload)
        setTeachers((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t)),
        )
      } else {
        const created = await createTeacher(payload)
        setTeachers((prev) => [created, ...prev])
      }
      closeModal()
    } catch {
      setFormError("Saqlashda xatolik yuz berdi. Qayta urinib ko'ring.")
    } finally {
      setSaving(false)
    }
  }

  const activeCount = teachers.filter((t) => t.status === 'active').length
  const inactiveCount = teachers.filter((t) => t.status === 'inactive').length

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">O'qituvchilar</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Jami {total} ta
            {activeCount > 0 && (
              <span className="text-primary font-medium"> · {activeCount} faol</span>
            )}
            {inactiveCount > 0 && (
              <span className="text-gray-400"> · {inactiveCount} nofaol</span>
            )}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-600 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Yangi o'qituvchi
        </button>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card">
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
            {(['all', 'active', 'inactive'] as FilterTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  tab === t
                    ? 'bg-primary text-white'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {t === 'all' ? 'Barchasi' : t === 'active' ? 'Faol' : 'Nofaol'}
              </button>
            ))}
          </div>

          <span className="text-xs text-gray-400 shrink-0">
            {teachers.length} ta ko'rsatilmoqda
          </span>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-48 gap-2 text-gray-400">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Yuklanmoqda...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-gray-400">
            <p className="text-sm">{error}</p>
            <button
              onClick={() => load(search, tab, new AbortController().signal)}
              className="text-sm text-primary underline"
            >
              Qayta yuklash
            </button>
          </div>
        ) : teachers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-gray-400">
            <Users size={36} className="text-gray-300" />
            <p className="text-sm">O'qituvchi topilmadi</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  O'qituvchi
                </th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Mutaxassislik
                </th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Tajriba
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {teachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${avatarColor(teacher.id)}`}
                      >
                        {initials(teacher.full_name)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {teacher.full_name}
                        </p>
                        <p className="text-xs text-gray-400">{teacher.phone ?? '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">
                    {teacher.specialty}
                  </td>
                  <td className="px-5 py-3.5">
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
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">
                    {teacher.experience_years} yil
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => navigate(`/teachers/${teacher.id}`)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        title="Ko'rish"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => openEdit(teacher)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        title="Tahrirlash"
                      >
                        <Pencil size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-soft w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900">
                {modal.teacher ? "O'qituvchini tahrirlash" : "Yangi o'qituvchi"}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* First name */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Ism
                </label>
                <input
                  type="text"
                  placeholder="Masalan, Madina"
                  value={form.firstName}
                  onChange={(e) => setField('firstName', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>

              {/* Last name */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Familiya
                </label>
                <input
                  type="text"
                  placeholder="Masalan, Ergasheva"
                  value={form.lastName}
                  onChange={(e) => setField('lastName', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Telefon raqam
                </label>
                <input
                  type="tel"
                  placeholder="+998901234567"
                  value={form.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Parol{modal.teacher && <span className="font-normal text-gray-400 ml-1">(o'zgartirish uchun kiriting)</span>}
                </label>
                <input
                  type="password"
                  placeholder={modal.teacher ? "••••••••" : "Kamida 8 ta belgi"}
                  value={form.password}
                  onChange={(e) => setField('password', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>

              {/* Specialty */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Mutaxassislik
                </label>
                <select
                  value={form.specialty}
                  onChange={(e) => setField('specialty', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition bg-white"
                >
                  {SPECIALTIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Experience */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Ish tajribasi (yil)
                </label>
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={form.experienceYears}
                  onChange={(e) => setField('experienceYears', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>

              {/* Status */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['active', 'inactive'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setField('status', s)}
                      className={`py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                        form.status === s
                          ? s === 'active'
                            ? 'bg-primary-100 text-primary border-primary/30'
                            : 'bg-orange-50 text-orange-600 border-orange-200'
                          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {s === 'active' ? 'Faol' : 'Nofaol'}
                    </button>
                  ))}
                </div>
              </div>

              {formError && (
                <p className="text-xs text-red-500">{formError}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={closeModal}
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
      )}
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { BookOpen, Plus, Pencil, X, Loader2 } from 'lucide-react'
import axios from 'axios'
import {
  fetchSubjects,
  createSubject,
  updateSubject,
  type SubjectAPI,
  type SubjectPayload,
} from '../api/subjects'
import { formatPrice } from '../utils/format'

interface FormValues {
  name: string
  hourlyRate: string
  studentHourlyRate: string
}

const DEFAULT_FORM: FormValues = { name: '', hourlyRate: '', studentHourlyRate: '' }

function formFromSubject(s: SubjectAPI): FormValues {
  return {
    name: s.name,
    hourlyRate: String(Math.round(parseFloat(s.hourly_rate))),
    studentHourlyRate: String(Math.round(parseFloat(s.student_hourly_rate))),
  }
}

function fmtDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  return parseInt(digits, 10)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

// ─── SubjectFormModal ────────────────────────────────────────────────────────
// Local form state — completely isolated from parent state.
// Mounts fresh on every open (conditional render + incrementing key).
interface SubjectFormModalProps {
  subject: SubjectAPI | null
  onClose: () => void
  onSaved: (result: SubjectAPI, isNew: boolean) => void
}

function SubjectFormModal({ subject, onClose, onSaved }: SubjectFormModalProps) {
  const initialForm = subject ? formFromSubject(subject) : { ...DEFAULT_FORM }
  const [form, setForm] = useState<FormValues>(initialForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function setField<K extends keyof FormValues>(key: K, val: FormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: val }))
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setFormError('Fan nomi kiritilishi shart')
      return
    }
    const hourlyRate = parseInt(form.hourlyRate, 10)
    const studentHourlyRate = parseInt(form.studentHourlyRate, 10)
    if (!hourlyRate || hourlyRate <= 0) {
      setFormError("O'qituvchi soatlik narxi noto'g'ri")
      return
    }
    if (!studentHourlyRate || studentHourlyRate <= 0) {
      setFormError("Ota-ona soatlik narxi noto'g'ri")
      return
    }

    const payload: SubjectPayload = {
      name: form.name.trim(),
      hourly_rate: hourlyRate,
      student_hourly_rate: studentHourlyRate,
    }

    try {
      setSaving(true)
      setFormError(null)
      if (subject) {
        const updated = await updateSubject(subject.id, payload)
        onSaved(updated, false)
      } else {
        const created = await createSubject(payload)
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
            {subject ? 'Fanni tahrirlash' : 'Yangi fan'}
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
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Fan nomi</label>
            <input
              autoFocus
              type="text"
              placeholder="Masalan, Tovush talaffuzi"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                O'qituvchi soatlik narxi
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="50 000"
                value={fmtDisplay(form.hourlyRate)}
                onChange={(e) => setField('hourlyRate', e.target.value.replace(/\D/g, ''))}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
              <p className="text-[11px] text-gray-400 mt-1">O'qituvchiga to'lov</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                Ota-ona soatlik narxi
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="80 000"
                value={fmtDisplay(form.studentHourlyRate)}
                onChange={(e) => setField('studentHourlyRate', e.target.value.replace(/\D/g, ''))}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
              <p className="text-[11px] text-gray-400 mt-1">Ota-onadan olinadi</p>
            </div>
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
interface ModalState {
  open: boolean
  mountKey: number   // increments on every open → React always creates a new SubjectFormModal
  subject: SubjectAPI | null
}

export default function Subjects() {
  const [subjects, setSubjects] = useState<SubjectAPI[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalState>({ open: false, mountKey: 0, subject: null })
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
      const data = await fetchSubjects(signal)
      setSubjects(data)
    } catch (err) {
      if (axios.isCancel(err)) return
      setError("Ma'lumotlarni yuklashda xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  // Single setState → single render → SubjectFormModal always gets fresh props + new key
  function openCreate() {
    setModal((prev) => ({ open: true, mountKey: prev.mountKey + 1, subject: null }))
  }

  function openEdit(subject: SubjectAPI) {
    setModal((prev) => ({ open: true, mountKey: prev.mountKey + 1, subject }))
  }

  function closeModal() {
    setModal((prev) => ({ ...prev, open: false }))
  }

  function handleSaved(result: SubjectAPI, isNew: boolean) {
    if (isNew) {
      setSubjects((prev) => [...prev, result])
    } else {
      setSubjects((prev) => prev.map((s) => (s.id === result.id ? result : s)))
    }
    closeModal()
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fanlar</h1>
          <p className="text-sm text-gray-500 mt-0.5">Fan narxlari soatlik hisoblanadi</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-600 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Yangi fan
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
        ) : subjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
            <BookOpen size={40} className="text-gray-300" />
            <p className="text-sm">Hali fan qo'shilmagan</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Fan nomi
                </th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  O'qituvchiga to'lov
                </th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Ota-onadan
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {subjects.map((subject) => (
                <tr key={subject.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                        <BookOpen size={15} className="text-primary" />
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{subject.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">
                    {formatPrice(parseFloat(subject.hourly_rate))}/soat
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">
                    {formatPrice(parseFloat(subject.student_hourly_rate))}/soat
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => openEdit(subject)}
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

      {modal.open && (
        <SubjectFormModal
          key={modal.mountKey}
          subject={modal.subject}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}

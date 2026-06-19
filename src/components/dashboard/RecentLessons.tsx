import { Plus } from 'lucide-react'
import { recentLessons } from '../../data/mock'
import { formatPrice } from '../../utils/format'

export function RecentLessons() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Oxirgi darslar</h2>
        <button className="text-sm text-primary hover:underline font-medium">
          Barchasi →
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {recentLessons.map((lesson) => (
          <div key={lesson.id} className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
              <Plus size={14} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {lesson.studentName} · {lesson.subjectName}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {lesson.teacherName} · {lesson.date} · {lesson.time}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-semibold text-gray-900">{formatPrice(lesson.price)}</p>
              <p className="text-xs text-gray-400">{lesson.durationMin} daq</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

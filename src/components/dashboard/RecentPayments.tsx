import { recentPayments } from '../../data/mock'
import { formatPrice } from '../../utils/format'

export function RecentPayments() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Oxirgi to'lovlar</h2>
        <button className="text-sm text-primary hover:underline font-medium">
          Barchasi →
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {recentPayments.map((payment) => (
          <div key={payment.id} className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${payment.avatarColor}`}
            >
              {payment.avatarInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{payment.studentName}</p>
              <p className="text-xs text-gray-400">{payment.date}</p>
            </div>
            <p className="text-sm font-semibold text-primary shrink-0">
              +{formatPrice(payment.amount)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

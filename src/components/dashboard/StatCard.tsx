type Tone = 'green' | 'blue' | 'red'

interface StatCardProps {
  icon: React.ReactNode
  value: string
  label: string
  badge?: string
  badgeVariant?: 'green' | 'red'
  valueClassName?: string
  tone?: Tone
}

const toneClasses: Record<Tone, string> = {
  green: 'bg-primary-100 text-primary',
  blue: 'bg-blue-100 text-blue-600',
  red: 'bg-red-100 text-red-500',
}

export function StatCard({
  icon,
  value,
  label,
  badge,
  badgeVariant = 'green',
  valueClassName,
  tone = 'green',
}: StatCardProps) {
  const badgeClass =
    badgeVariant === 'red'
      ? 'bg-red-50 text-red-600'
      : 'bg-primary-100 text-primary'

  return (
    <div className="bg-white rounded-2xl p-5 shadow-card flex flex-col gap-4 border border-gray-100/60">
      <div className="flex items-start justify-between">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${toneClasses[tone]}`}
        >
          {icon}
        </div>
        {badge && (
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badgeClass}`}>
            {badge}
          </span>
        )}
      </div>
      <div>
        <p className={`text-2xl font-bold leading-tight ${valueClassName ?? 'text-gray-900'}`}>
          {value}
        </p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  )
}

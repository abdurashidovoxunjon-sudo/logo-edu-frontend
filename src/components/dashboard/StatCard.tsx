interface StatCardProps {
  icon: React.ReactNode
  value: string
  label: string
  badge?: string
  badgeVariant?: 'green' | 'red'
  valueClassName?: string
}

export function StatCard({
  icon,
  value,
  label,
  badge,
  badgeVariant = 'green',
  valueClassName,
}: StatCardProps) {
  const badgeClass =
    badgeVariant === 'red'
      ? 'bg-red-50 text-red-600'
      : 'bg-primary-100 text-primary'

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary">
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

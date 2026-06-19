import { GraduationCap, Users, DollarSign, AlertTriangle } from 'lucide-react'
import { StatCard } from '../components/dashboard/StatCard'
import { RecentLessons } from '../components/dashboard/RecentLessons'
import { RecentPayments } from '../components/dashboard/RecentPayments'
import { dashboardStats } from '../data/mock'
import { formatPrice } from '../utils/format'

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Bugun 18.06.2026 · umumiy ko'rsatkichlar
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={<GraduationCap size={20} />}
          value={String(dashboardStats.studentsCount)}
          label="O'quvchilar soni"
          badge={dashboardStats.studentsGrowth}
        />
        <StatCard
          icon={<Users size={20} />}
          value={String(dashboardStats.activeTeachers)}
          label="Faol o'qituvchilar"
        />
        <StatCard
          icon={<DollarSign size={20} />}
          value={formatPrice(dashboardStats.monthlyRevenue)}
          label="Kelgan to'lovlar"
          badge="Shu oy"
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          value={formatPrice(dashboardStats.totalDebt)}
          label="Jami qarzdorlik"
          badge={`${dashboardStats.debtorCount} qarzdor`}
          badgeVariant="red"
          valueClassName="text-red-500"
        />
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-2 gap-4">
        <RecentLessons />
        <RecentPayments />
      </div>
    </div>
  )
}

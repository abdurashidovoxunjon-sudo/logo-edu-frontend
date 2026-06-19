import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  Calendar,
  CreditCard,
  Heart,
  Star,
  BarChart2,
  PieChart,
  LogOut,
} from 'lucide-react'

interface NavItem {
  to: string
  icon: React.ReactNode
  label: string
  badge?: number
}

const mainNav: NavItem[] = [
  { to: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/teachers', icon: <Users size={18} />, label: "O'qituvchilar", badge: 6 },
  { to: '/subjects', icon: <BookOpen size={18} />, label: 'Fanlar' },
  { to: '/students', icon: <GraduationCap size={18} />, label: "O'quvchilar", badge: 6 },
  { to: '/lessons', icon: <Calendar size={18} />, label: 'Darslar' },
  { to: '/payments', icon: <CreditCard size={18} />, label: "To'lovlar" },
  { to: '/parents', icon: <Heart size={18} />, label: 'Ota-onalar' },
]

const devNav: NavItem[] = [
  { to: '/skills', icon: <Star size={18} />, label: "Ko'nikmalar" },
  { to: '/assessment', icon: <BarChart2 size={18} />, label: 'Baholash' },
  { to: '/reports', icon: <PieChart size={18} />, label: 'Hisobotlar' },
]

function NavItemLink({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
          isActive
            ? 'bg-primary-100 text-primary'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`
      }
    >
      {item.icon}
      <span className="flex-1">{item.label}</span>
      {item.badge !== undefined && (
        <span className="text-xs bg-primary-100 text-primary px-2 py-0.5 rounded-full font-semibold">
          {item.badge}
        </span>
      )}
    </NavLink>
  )
}

export function Sidebar() {
  return (
    <aside className="w-56 shrink-0 h-screen sticky top-0 flex flex-col bg-white border-r border-gray-100">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3 border-b border-gray-100">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-lg shrink-0">
          B
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm leading-tight">Bog'chamiz</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
            Admin paneli
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold px-3 mb-1">
            Asosiy
          </p>
          {mainNav.map((item) => (
            <NavItemLink key={item.to} item={item} />
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold px-3 mb-1">
            Rivojlanish
          </p>
          {devNav.map((item) => (
            <NavItemLink key={item.to} item={item} />
          ))}
        </div>
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-gray-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary text-xs font-bold shrink-0">
          AA
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">Admin Aliyev</p>
          <p className="text-xs text-gray-400">Superadmin</p>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  )
}

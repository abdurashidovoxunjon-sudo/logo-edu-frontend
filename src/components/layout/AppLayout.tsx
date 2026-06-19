import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

const breadcrumbMap: Record<string, string[]> = {
  '/': ['Bosh sahifa', 'Dashboard'],
  '/teachers': ['Bosh sahifa', "O'qituvchilar"],
  '/subjects': ['Bosh sahifa', 'Fanlar'],
  '/students': ['Bosh sahifa', "O'quvchilar"],
  '/lessons': ['Bosh sahifa', 'Darslar'],
  '/payments': ['Bosh sahifa', "To'lovlar"],
  '/parents': ['Bosh sahifa', 'Ota-onalar'],
  '/skills': ['Bosh sahifa', "Ko'nikmalar"],
  '/assessment': ['Bosh sahifa', 'Baholash'],
  '/reports': ['Bosh sahifa', 'Hisobotlar'],
}

export function AppLayout() {
  const { pathname } = useLocation()
  const breadcrumb = breadcrumbMap[pathname] ?? ['Bosh sahifa']

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header breadcrumb={breadcrumb} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

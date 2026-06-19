# Logoped Admin Panel — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete React frontend for "Bog'chamiz" logoped center admin panel with mock data (Dashboard + layout + placeholder pages).

**Architecture:** AppLayout wraps all pages via React Router Outlet. Sidebar and Header are fixed layout components. Dashboard composes StatCard, RecentLessons, RecentPayments. All other pages are styled placeholders. Mock data is centralized in `src/data/mock.ts`.

**Tech Stack:** Vite 5, React 18, TypeScript 5, Tailwind CSS v3, React Router v6, Lucide React

---

## File Map

| File | Responsibility |
|------|---------------|
| `vite.config.ts` | Vite + React plugin config |
| `tailwind.config.js` | Tailwind with `primary: #32a86f` token |
| `postcss.config.js` | PostCSS for Tailwind |
| `src/index.css` | Tailwind directives |
| `src/types/index.ts` | Student, Teacher, Lesson, Payment, Stats interfaces |
| `src/data/mock.ts` | All mock data arrays + stats object |
| `src/utils/format.ts` | `formatPrice(n)` → "1 760 000 so'm" |
| `src/components/layout/Sidebar.tsx` | Logo, nav links, user footer |
| `src/components/layout/Header.tsx` | Breadcrumb, search, notification bell |
| `src/components/layout/AppLayout.tsx` | Sidebar + Header + `<Outlet>` |
| `src/components/dashboard/StatCard.tsx` | Icon, value, label, optional badge |
| `src/components/dashboard/RecentLessons.tsx` | Table of last 4 lessons |
| `src/components/dashboard/RecentPayments.tsx` | List of last 4 payments |
| `src/pages/Dashboard.tsx` | Composes stat cards + two panels |
| `src/pages/[Others].tsx` | 9 placeholder pages |
| `src/App.tsx` | BrowserRouter + routes |
| `src/main.tsx` | React DOM root render |

---

### Task 1: Project scaffolding and Tailwind setup

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `postcss.config.js`, `tailwind.config.js`, `src/index.css`, `src/main.tsx`

- [ ] **Step 1: Initialize npm and install all dependencies**

```bash
cd "C:\Users\softe\WebstormProjects\logo-edu-frontend"
npm init -y
npm install react@^18.3.1 react-dom@^18.3.1 react-router-dom@^6.26.2 lucide-react@^0.462.0
npm install -D vite@^5.4.8 @vitejs/plugin-react@^4.3.1 @types/react@^18.3.5 @types/react-dom@^18.3.0 typescript@^5.5.3 tailwindcss@^3.4.14 autoprefixer@^10.4.20 postcss@^8.4.47
```

- [ ] **Step 2: Create `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 4: Create `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: Create `index.html`**

```html
<!doctype html>
<html lang="uz">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bog'chamiz — Admin Panel</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Initialize Tailwind**

```bash
npx tailwindcss init -p
```

- [ ] **Step 7: Update `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#32a86f',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 8: Create `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 9: Create `src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 10: Create temporary `src/App.tsx` to verify build**

```tsx
export default function App() {
  return <div className="text-primary text-2xl p-8">Bog'chamiz Admin Panel</div>
}
```

- [ ] **Step 11: Start dev server and verify Tailwind + primary color works**

```bash
npm run dev
```

Open http://localhost:5173 — should show green "Bog'chamiz Admin Panel" text.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite + React + TS + Tailwind project"
```

---

### Task 2: TypeScript types and mock data

**Files:**
- Create: `src/types/index.ts`
- Create: `src/data/mock.ts`
- Create: `src/utils/format.ts`

- [ ] **Step 1: Create `src/types/index.ts`**

```ts
export interface Student {
  id: string
  name: string
  avatarInitials: string
  avatarColor: string
}

export interface Teacher {
  id: string
  name: string
}

export interface Lesson {
  id: string
  studentName: string
  subjectName: string
  teacherName: string
  date: string
  time: string
  price: number
  durationMin: number
}

export interface Payment {
  id: string
  studentName: string
  avatarInitials: string
  avatarColor: string
  date: string
  amount: number
}

export interface DashboardStats {
  studentsCount: number
  studentsGrowth: string
  activeTeachers: number
  monthlyRevenue: number
  totalDebt: number
  debtorCount: number
}
```

- [ ] **Step 2: Create `src/data/mock.ts`**

```ts
import type { DashboardStats, Lesson, Payment, Student, Teacher } from '../types'

export const students: Student[] = [
  { id: '1', name: 'Ali Karimov', avatarInitials: 'AK', avatarColor: 'bg-blue-100 text-blue-700' },
  { id: '2', name: 'Diyor Ortiqov', avatarInitials: 'DO', avatarColor: 'bg-emerald-100 text-emerald-700' },
  { id: '3', name: 'Zarina Yusupova', avatarInitials: 'ZY', avatarColor: 'bg-purple-100 text-purple-700' },
  { id: '4', name: 'Madina Soliyeva', avatarInitials: 'MS', avatarColor: 'bg-orange-100 text-orange-700' },
  { id: '5', name: 'Sherzod Aliyev', avatarInitials: 'SA', avatarColor: 'bg-red-100 text-red-700' },
  { id: '6', name: 'Nodira Hasanova', avatarInitials: 'NH', avatarColor: 'bg-yellow-100 text-yellow-700' },
]

export const teachers: Teacher[] = [
  { id: '1', name: 'Madina Ergasheva' },
  { id: '2', name: 'Sevinch Rahmonova' },
  { id: '3', name: 'Bekzod Sobirov' },
  { id: '4', name: 'Dilnoza Yusupova' },
  { id: '5', name: 'Kamola Toshmatova' },
]

export const recentLessons: Lesson[] = [
  {
    id: '1',
    studentName: 'Ali Karimov',
    subjectName: 'Tovush talaffuzi',
    teacherName: 'Madina Ergasheva',
    date: '18.06.2026',
    time: '09:00',
    price: 60000,
    durationMin: 45,
  },
  {
    id: '2',
    studentName: 'Zarina Yusupova',
    subjectName: 'Nutq rivojlantirish',
    teacherName: 'Sevinch Rahmonova',
    date: '18.06.2026',
    time: '10:00',
    price: 90000,
    durationMin: 60,
  },
  {
    id: '3',
    studentName: 'Diyor Ortiqov',
    subjectName: 'Tovush talaffuzi',
    teacherName: 'Bekzod Sobirov',
    date: '17.06.2026',
    time: '11:30',
    price: 40000,
    durationMin: 30,
  },
  {
    id: '4',
    studentName: 'Madina Soliyeva',
    subjectName: "Lug'at boyligi",
    teacherName: 'Madina Ergasheva',
    date: '17.06.2026',
    time: '14:00',
    price: 56250,
    durationMin: 45,
  },
]

export const recentPayments: Payment[] = [
  { id: '1', studentName: 'Ali Karimov', avatarInitials: 'AK', avatarColor: 'bg-blue-100 text-blue-700', date: '18.06.2026', amount: 400000 },
  { id: '2', studentName: 'Diyor Ortiqov', avatarInitials: 'DO', avatarColor: 'bg-emerald-100 text-emerald-700', date: '17.06.2026', amount: 300000 },
  { id: '3', studentName: 'Zarina Yusupova', avatarInitials: 'ZY', avatarColor: 'bg-purple-100 text-purple-700', date: '16.06.2026', amount: 500000 },
  { id: '4', studentName: 'Sherzod Aliyev', avatarInitials: 'SA', avatarColor: 'bg-red-100 text-red-700', date: '14.06.2026', amount: 200000 },
]

export const dashboardStats: DashboardStats = {
  studentsCount: 6,
  studentsGrowth: '+6 oyda',
  activeTeachers: 5,
  monthlyRevenue: 1760000,
  totalDebt: 960000,
  debtorCount: 3,
}
```

- [ ] **Step 3: Create `src/utils/format.ts`**

```ts
export function formatPrice(amount: number): string {
  return amount.toLocaleString('ru-RU').replace(/,/g, ' ') + " so'm"
}
```

- [ ] **Step 4: Commit**

```bash
git add src/types src/data src/utils
git commit -m "feat: add TypeScript types, mock data, and price formatter"
```

---

### Task 3: Sidebar component

**Files:**
- Create: `src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Create `src/components/layout/Sidebar.tsx`**

```tsx
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
            ? 'bg-primary/10 text-primary'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`
      }
    >
      {item.icon}
      <span className="flex-1">{item.label}</span>
      {item.badge !== undefined && (
        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
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
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/Sidebar.tsx
git commit -m "feat: add Sidebar component with nav links and user footer"
```

---

### Task 4: Header and AppLayout components

**Files:**
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/AppLayout.tsx`

- [ ] **Step 1: Create `src/components/layout/Header.tsx`**

```tsx
import { Bell, Search, ChevronRight } from 'lucide-react'

interface HeaderProps {
  breadcrumb: string[]
}

export function Header({ breadcrumb }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm">
        {breadcrumb.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={14} className="text-gray-400" />}
            <span className={i === breadcrumb.length - 1 ? 'text-gray-900 font-medium' : 'text-gray-400'}>
              {crumb}
            </span>
          </span>
        ))}
      </nav>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tezkor qidiruv..."
            className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl w-52 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
          />
        </div>
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-gray-600">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
        </button>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Create `src/components/layout/AppLayout.tsx`**

```tsx
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
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Header.tsx src/components/layout/AppLayout.tsx
git commit -m "feat: add Header and AppLayout components"
```

---

### Task 5: Router and placeholder pages

**Files:**
- Create: `src/pages/Dashboard.tsx` (temporary empty)
- Create: `src/pages/Teachers.tsx`, `Students.tsx`, `Subjects.tsx`, `Lessons.tsx`, `Payments.tsx`, `Parents.tsx`, `Skills.tsx`, `Assessment.tsx`, `Reports.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `src/pages/Dashboard.tsx` (temporary placeholder)**

```tsx
export default function Dashboard() {
  return <div className="text-gray-500">Dashboard — coming in next task</div>
}
```

- [ ] **Step 2: Create all placeholder pages**

Create each file below with this pattern (replace the label):

`src/pages/Teachers.tsx`:
```tsx
import { Users } from 'lucide-react'

export default function Teachers() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
      <Users size={40} className="text-gray-300" />
      <p className="text-lg font-medium">O'qituvchilar</p>
      <p className="text-sm">Bu sahifa keyingi bosqichda qo'shiladi</p>
    </div>
  )
}
```

`src/pages/Subjects.tsx`:
```tsx
import { BookOpen } from 'lucide-react'
export default function Subjects() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
      <BookOpen size={40} className="text-gray-300" />
      <p className="text-lg font-medium">Fanlar</p>
      <p className="text-sm">Bu sahifa keyingi bosqichda qo'shiladi</p>
    </div>
  )
}
```

`src/pages/Students.tsx`:
```tsx
import { GraduationCap } from 'lucide-react'
export default function Students() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
      <GraduationCap size={40} className="text-gray-300" />
      <p className="text-lg font-medium">O'quvchilar</p>
      <p className="text-sm">Bu sahifa keyingi bosqichda qo'shiladi</p>
    </div>
  )
}
```

`src/pages/Lessons.tsx`:
```tsx
import { Calendar } from 'lucide-react'
export default function Lessons() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
      <Calendar size={40} className="text-gray-300" />
      <p className="text-lg font-medium">Darslar</p>
      <p className="text-sm">Bu sahifa keyingi bosqichda qo'shiladi</p>
    </div>
  )
}
```

`src/pages/Payments.tsx`:
```tsx
import { CreditCard } from 'lucide-react'
export default function Payments() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
      <CreditCard size={40} className="text-gray-300" />
      <p className="text-lg font-medium">To'lovlar</p>
      <p className="text-sm">Bu sahifa keyingi bosqichda qo'shiladi</p>
    </div>
  )
}
```

`src/pages/Parents.tsx`:
```tsx
import { Heart } from 'lucide-react'
export default function Parents() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
      <Heart size={40} className="text-gray-300" />
      <p className="text-lg font-medium">Ota-onalar</p>
      <p className="text-sm">Bu sahifa keyingi bosqichda qo'shiladi</p>
    </div>
  )
}
```

`src/pages/Skills.tsx`:
```tsx
import { Star } from 'lucide-react'
export default function Skills() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
      <Star size={40} className="text-gray-300" />
      <p className="text-lg font-medium">Ko'nikmalar</p>
      <p className="text-sm">Bu sahifa keyingi bosqichda qo'shiladi</p>
    </div>
  )
}
```

`src/pages/Assessment.tsx`:
```tsx
import { BarChart2 } from 'lucide-react'
export default function Assessment() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
      <BarChart2 size={40} className="text-gray-300" />
      <p className="text-lg font-medium">Baholash</p>
      <p className="text-sm">Bu sahifa keyingi bosqichda qo'shiladi</p>
    </div>
  )
}
```

`src/pages/Reports.tsx`:
```tsx
import { PieChart } from 'lucide-react'
export default function Reports() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
      <PieChart size={40} className="text-gray-300" />
      <p className="text-lg font-medium">Hisobotlar</p>
      <p className="text-sm">Bu sahifa keyingi bosqichda qo'shiladi</p>
    </div>
  )
}
```

- [ ] **Step 3: Replace `src/App.tsx` with router setup**

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import Teachers from './pages/Teachers'
import Subjects from './pages/Subjects'
import Students from './pages/Students'
import Lessons from './pages/Lessons'
import Payments from './pages/Payments'
import Parents from './pages/Parents'
import Skills from './pages/Skills'
import Assessment from './pages/Assessment'
import Reports from './pages/Reports'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="subjects" element={<Subjects />} />
          <Route path="students" element={<Students />} />
          <Route path="lessons" element={<Lessons />} />
          <Route path="payments" element={<Payments />} />
          <Route path="parents" element={<Parents />} />
          <Route path="skills" element={<Skills />} />
          <Route path="assessment" element={<Assessment />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 4: Verify layout renders with navigation working**

```bash
npm run dev
```

Open http://localhost:5173 — sidebar visible, clicking nav links changes the content area.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/pages/
git commit -m "feat: add router, AppLayout wiring, and placeholder pages"
```

---

### Task 6: StatCard component

**Files:**
- Create: `src/components/dashboard/StatCard.tsx`

- [ ] **Step 1: Create `src/components/dashboard/StatCard.tsx`**

```tsx
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
      : 'bg-primary/10 text-primary'

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/StatCard.tsx
git commit -m "feat: add StatCard component"
```

---

### Task 7: RecentLessons component

**Files:**
- Create: `src/components/dashboard/RecentLessons.tsx`

- [ ] **Step 1: Create `src/components/dashboard/RecentLessons.tsx`**

```tsx
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
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/RecentLessons.tsx
git commit -m "feat: add RecentLessons dashboard component"
```

---

### Task 8: RecentPayments component

**Files:**
- Create: `src/components/dashboard/RecentPayments.tsx`

- [ ] **Step 1: Create `src/components/dashboard/RecentPayments.tsx`**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/RecentPayments.tsx
git commit -m "feat: add RecentPayments dashboard component"
```

---

### Task 9: Dashboard page (final composition)

**Files:**
- Modify: `src/pages/Dashboard.tsx`

- [ ] **Step 1: Replace `src/pages/Dashboard.tsx` with the full page**

```tsx
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
```

- [ ] **Step 2: Start dev server and do final visual check**

```bash
npm run dev
```

Verify at http://localhost:5173:
- Sidebar shows logo, all nav links, user footer
- Header shows breadcrumb "Bosh sahifa > Dashboard" and search
- 4 stat cards in a row with correct values
- "Oxirgi darslar" shows 4 lesson rows
- "Oxirgi to'lovlar" shows 4 payment rows
- Clicking nav links navigates to placeholder pages
- Active nav item is highlighted in green

- [ ] **Step 3: Commit**

```bash
git add src/pages/Dashboard.tsx
git commit -m "feat: complete Dashboard page with stats, lessons, and payments panels"
```

---

## Self-Review

**Spec coverage:**
- ✅ Vite + React + TS + Tailwind setup — Task 1
- ✅ TypeScript types + mock data — Task 2
- ✅ Sidebar with logo, nav, user footer — Task 3
- ✅ Header with breadcrumb, search, bell — Task 4
- ✅ AppLayout wrapping all pages — Task 4
- ✅ React Router + all 10 routes — Task 5
- ✅ Placeholder pages (9) — Task 5
- ✅ StatCard (icon, value, label, badge) — Task 6
- ✅ RecentLessons — Task 7
- ✅ RecentPayments — Task 8
- ✅ Dashboard page composition — Task 9
- ✅ `formatPrice` utility — Task 2
- ✅ Primary color #32a86f — Task 1 (tailwind.config)

**Placeholder scan:** No TBDs or TODOs.

**Type consistency:**
- `Lesson`, `Payment`, `Student`, `Teacher`, `DashboardStats` defined in Task 2, used in Tasks 7–9
- `formatPrice(n: number): string` defined in Task 2, imported in Tasks 7, 8, 9
- `recentLessons`, `recentPayments`, `dashboardStats` defined in Task 2, imported in Tasks 7, 8, 9

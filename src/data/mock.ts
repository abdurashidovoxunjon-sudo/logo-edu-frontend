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

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

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
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
import Login from './pages/Login'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
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

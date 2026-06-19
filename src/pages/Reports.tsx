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

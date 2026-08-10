import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import MobileBottomNav from '../components/MobileBottomNav'
import Navbar from '../components/Navbar'

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-paper dark:bg-dark-bg">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar />
        <main className="flex-1 px-4 md:px-8 py-6 pb-28 md:pb-10 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav />
    </div>
  )
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { useSettings } from './hooks/useSettings'
import AppLayout from './layouts/AppLayout'
import Onboarding from './pages/Onboarding'
import LoadingSpinner from './components/LoadingSpinner'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Transactions = lazy(() => import('./pages/Transactions'))
const AddExpense = lazy(() => import('./pages/AddExpense'))
const AddIncome = lazy(() => import('./pages/AddIncome'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Budgets = lazy(() => import('./pages/Budgets'))
const Reports = lazy(() => import('./pages/Reports'))
const Backup = lazy(() => import('./pages/Backup'))
const Settings = lazy(() => import('./pages/Settings'))
const Privacy = lazy(() => import('./pages/Privacy'))

function RequireOnboarding({ children }) {
  const { settings, loading } = useSettings()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>
  if (!settings?.onboarded) return <Navigate to="/" replace />
  return children
}

function RootRedirect() {
  const { settings, loading } = useSettings()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>
  if (settings?.onboarded) return <Navigate to="/dashboard" replace />
  return <Onboarding />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route
          element={(
            <RequireOnboarding>
              <AppLayout />
            </RequireOnboarding>
          )}
        >
          <Route path="/dashboard" element={<Suspense fallback={<LoadingSpinner />}><Dashboard /></Suspense>} />
          <Route path="/transactions" element={<Suspense fallback={<LoadingSpinner />}><Transactions /></Suspense>} />
          <Route path="/add-expense" element={<Suspense fallback={<LoadingSpinner />}><AddExpense /></Suspense>} />
          <Route path="/add-income" element={<Suspense fallback={<LoadingSpinner />}><AddIncome /></Suspense>} />
          <Route path="/analytics" element={<Suspense fallback={<LoadingSpinner />}><Analytics /></Suspense>} />
          <Route path="/budgets" element={<Suspense fallback={<LoadingSpinner />}><Budgets /></Suspense>} />
          <Route path="/reports" element={<Suspense fallback={<LoadingSpinner />}><Reports /></Suspense>} />
          <Route path="/backup" element={<Suspense fallback={<LoadingSpinner />}><Backup /></Suspense>} />
          <Route path="/settings" element={<Suspense fallback={<LoadingSpinner />}><Settings /></Suspense>} />
          <Route path="/privacy" element={<Suspense fallback={<LoadingSpinner />}><Privacy /></Suspense>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

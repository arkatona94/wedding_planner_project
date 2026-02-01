import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Checklist from './pages/Checklist'
import Budget from './pages/Budget'
import Guests from './pages/Guests'
import Vendors from './pages/Vendors'
import Seating from './pages/Seating'
import Timeline from './pages/Timeline'
import Photos from './pages/Photos'
import Inspiration from './pages/Inspiration'
import Website from './pages/Website'
import Settings from './pages/Settings'
import MarriageLaws from './pages/MarriageLaws'
import DetailedBudget from './pages/DetailedBudget'
import Communication from './pages/Communication'
import Share from './pages/Share'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import { useWeddingStore } from './store/weddingStore'
import { Navigate } from 'react-router-dom'


function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useWeddingStore(state => state.user)
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      {/* Public share page - outside Layout */}
      <Route path="/share" element={<Share />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Main app with Layout - Protected */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="checklist" element={<Checklist />} />
        <Route path="budget" element={<Budget />} />
        <Route path="budget/detailed" element={<DetailedBudget />} />
        <Route path="guests" element={<Guests />} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="seating" element={<Seating />} />
        <Route path="timeline" element={<Timeline />} />
        <Route path="photos" element={<Photos />} />
        <Route path="inspiration" element={<Inspiration />} />
        <Route path="website" element={<Website />} />
        <Route path="settings" element={<Settings />} />
        <Route path="marriage-laws" element={<MarriageLaws />} />
        <Route path="communications" element={<Communication />} />
      </Route>
    </Routes>
  )
}

export default App

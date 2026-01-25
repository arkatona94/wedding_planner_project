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
import Website from './pages/Website'
import Settings from './pages/Settings'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="checklist" element={<Checklist />} />
        <Route path="budget" element={<Budget />} />
        <Route path="guests" element={<Guests />} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="seating" element={<Seating />} />
        <Route path="timeline" element={<Timeline />} />
        <Route path="photos" element={<Photos />} />
        <Route path="website" element={<Website />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App

import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { useWeddingStore } from '../store/weddingStore'
import { format, differenceInDays } from 'date-fns'

const navItems = [
  { path: '/', label: 'Dashboard', icon: '🏠' },
  { path: '/checklist', label: 'Checklist', icon: '✓' },
  { path: '/budget', label: 'Budget', icon: '💰' },
  { path: '/guests', label: 'Guests', icon: '👥' },
  { path: '/vendors', label: 'Vendors', icon: '🤝' },
  { path: '/seating', label: 'Seating', icon: '🪑' },
  { path: '/timeline', label: 'Timeline', icon: '📅' },
  { path: '/photos', label: 'Photos', icon: '📸' },
  { path: '/website', label: 'Website', icon: '🌐' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const wedding = useWeddingStore((state) => state.wedding)

  const daysUntilWedding = wedding.weddingDate
    ? differenceInDays(new Date(wedding.weddingDate), new Date())
    : null

  const coupleNames = wedding.partner1Name && wedding.partner2Name
    ? `${wedding.partner1Name} & ${wedding.partner2Name}`
    : 'Your Wedding'

  return (
    <div className="min-h-screen bg-primary-50 flex">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-100
                    flex flex-col transition-all duration-300 fixed h-full z-10`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <h1 className={`font-serif text-primary-600 ${sidebarOpen ? 'text-2xl' : 'text-lg text-center'}`}>
            {sidebarOpen ? 'EverAfter' : 'EA'}
          </h1>
          {sidebarOpen && (
            <p className="text-sm text-gray-500 mt-1">Wedding Planner</p>
          )}
        </div>

        {/* Countdown */}
        {sidebarOpen && daysUntilWedding !== null && daysUntilWedding > 0 && (
          <div className="p-4 mx-4 mt-4 bg-wedding-blush rounded-lg text-center">
            <p className="text-4xl font-serif text-primary-600">{daysUntilWedding}</p>
            <p className="text-sm text-gray-600">days to go!</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? 'sidebar-item-active' : 'sidebar-item'
              }
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-4 text-gray-400 hover:text-primary-600 transition-colors"
        >
          {sidebarOpen ? '← Collapse' : '→'}
        </button>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-8 py-4 sticky top-0 z-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-serif text-gray-800">{coupleNames}</h2>
              {wedding.weddingDate && (
                <p className="text-sm text-gray-500">
                  {format(new Date(wedding.weddingDate), 'EEEE, MMMM d, yyyy')}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button className="btn-secondary text-sm py-2">
                Share
              </button>
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
                {wedding.partner1Name?.charAt(0) || 'W'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

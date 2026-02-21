import { useState, useEffect, useMemo } from 'react'
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { useWeddingStore } from '../store/weddingStore'
import { differenceInDays, parseISO } from 'date-fns'
import type { Notification } from '../types'
import { Bell, Menu, X, ChevronDown, User, LogOut } from 'lucide-react'
import UpgradeModal from './UpgradeModal'

const navItems = [
  { path: '/checklist', label: 'Checklist', icon: '✓' },
  { path: '/budget', label: 'Budget', icon: '💰' },
  { path: '/vendors', label: 'Find Vendors', icon: '🔍' },
  { path: '/guests', label: 'Guest List', icon: '👥' },
  { path: '/seating', label: 'Seating Chart', icon: '🪑' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
]

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const navigate = useNavigate()
  const wedding = useWeddingStore((state: any) => state.wedding)
  const appSettings = useWeddingStore((state: any) => state.appSettings)
  const signOut = useWeddingStore((state: any) => state.signOut)
  const user = useWeddingStore((state: any) => state.user)
  const budgetItems = useWeddingStore((state: any) => state.budgetItems)
  const checklist = useWeddingStore((state: any) => state.checklist)
  const guests = useWeddingStore((state: any) => state.guests)

  // Apply dark mode on mount
  useEffect(() => {
    if (appSettings.darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [appSettings.darkMode])

  // Generate notifications based on data
  const computedNotifications = useMemo(() => {
    const alerts: Omit<Notification, 'id' | 'createdAt' | 'read' | 'dismissed'>[] = []
    const today = new Date()

    // Check budget items for upcoming/overdue payments
    budgetItems.forEach((item: any) => {
      if (item.dueDate && item.actualCost > item.paid) {
        const dueDate = parseISO(item.dueDate)
        const daysUntil = differenceInDays(dueDate, today)
        const remaining = item.actualCost - item.paid

        if (daysUntil < 0) {
          alerts.push({
            type: 'payment_overdue',
            title: `Overdue: ${item.vendor}`,
            message: `Payment of $${remaining.toLocaleString()} was due ${Math.abs(daysUntil)} days ago`,
            relatedId: item.id,
            relatedType: 'budget'
          })
        } else if (daysUntil <= 7) {
          alerts.push({
            type: 'payment_due',
            title: `Due Soon: ${item.vendor}`,
            message: `$${remaining.toLocaleString()} due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
            relatedId: item.id,
            relatedType: 'budget'
          })
        }
      }
    })

    // Check checklist for overdue tasks
    checklist.forEach((task: any) => {
      if (task.dueDate && !task.completed) {
        const dueDate = parseISO(task.dueDate)
        const daysUntil = differenceInDays(dueDate, today)

        if (daysUntil < 0) {
          alerts.push({
            type: 'task_overdue',
            title: `Overdue Task: ${task.title}`,
            message: `This ${task.priority} priority task was due ${Math.abs(daysUntil)} days ago`,
            relatedId: task.id,
            relatedType: 'checklist'
          })
        } else if (daysUntil <= 3 && task.priority === 'high') {
          alerts.push({
            type: 'task_due',
            title: `Task Due Soon: ${task.title}`,
            message: `High priority task due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
            relatedId: task.id,
            relatedType: 'checklist'
          })
        }
      }
    })

    // Check RSVP status
    const pendingGuests = guests.filter((g: any) => g.rsvpStatus === 'pending')
    if (pendingGuests.length > 0 && guests.length > 0) {
      const pendingPercent = Math.round((pendingGuests.length / guests.length) * 100)
      if (pendingPercent > 30) {
        alerts.push({
          type: 'rsvp_reminder',
          title: `${pendingGuests.length} Guests Pending`,
          message: `${pendingPercent}% of your guest list hasn't responded yet`,
          relatedType: 'guest'
        })
      }
    }

    return alerts
  }, [budgetItems, checklist, guests, wedding.totalBudget])

  const unreadCount = computedNotifications.length

  const handleSignOut = () => {
    signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Desktop Nav */}
            <div className="flex">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="flex items-center gap-2 group">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-400 to-primary-600 flex items-center justify-center text-white font-serif font-bold text-xl group-hover:shadow-md transition-shadow">
                    B
                  </div>
                  <span className="font-serif text-xl text-gray-800 dark:text-white font-medium group-hover:text-primary-600 transition-colors">
                    Beginnings
                  </span>
                </Link>
              </div>

              {/* Desktop Menu Items */}
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={(e) => {
                      if (item.path === '/seating' && !user?.isPremium) {
                        e.preventDefault()
                        setShowUpgradeModal(true)
                      }
                    }}
                    className={({ isActive }) =>
                      `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${isActive
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Right Side Icons & Profile */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center gap-4">

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="bg-white dark:bg-gray-800 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <span className="sr-only">View notifications</span>
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Notifications</h3>
                    </div>
                    {computedNotifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-gray-500 text-sm">
                        No new notifications
                      </div>
                    ) : (
                      <div className="max-h-64 overflow-y-auto">
                        {computedNotifications.map((note, idx) => (
                          <div key={idx} className="px-4 py-3 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{note.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{note.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="ml-3 relative">
                <div>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="max-w-xs bg-white dark:bg-gray-800 flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border border-primary-200">
                      {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="ml-2 text-gray-700 dark:text-gray-200 font-medium hidden md:block">
                      {user?.name || 'User'}
                    </span>
                    <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
                  </button>
                </div>

                {profileDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Your Profile
                      </div>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-gray-700"
                    >
                      <div className="flex items-center gap-2">
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="bg-white dark:bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-200 dark:border-gray-700">
            <div className="pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={(e) => {
                    if (item.path === '/seating' && !user?.isPremium) {
                      e.preventDefault()
                      setShowUpgradeModal(true)
                      setMobileMenuOpen(false)
                    } else {
                      setMobileMenuOpen(false)
                    }
                  }}
                  className={({ isActive }) =>
                    `block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
            <div className="pt-4 pb-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800 dark:text-white">{user?.name || 'User'}</div>
                  <div className="text-sm font-medium text-gray-500">{user?.email || ''}</div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="ml-auto flex-shrink-0 bg-white dark:bg-gray-800 p-1 rounded-full text-red-400 hover:text-red-600"
                >
                  <LogOut className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="💺 Seating Chart (Premium Feature)"
        description="Create drag-and-drop seating charts synced with your guest list"
        feature="Unlimited tables, guest sync, and printable floor plans"
        type="seating"
      />
    </div>
  )
}

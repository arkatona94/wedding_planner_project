import { useState, useEffect, useMemo } from 'react'
import { Outlet, NavLink, Link } from 'react-router-dom'
import { useWeddingStore } from '../store/weddingStore'
import { format, differenceInDays, parseISO } from 'date-fns'
import type { Notification } from '../types'
import { generateShareableLink } from '../utils/exports'

const navItems = [
  { path: '/', label: 'Dashboard', icon: '🏠' },
  { path: '/checklist', label: 'Checklist', icon: '✓' },
  { path: '/budget', label: 'Budget', icon: '💰' },
  { path: '/guests', label: 'Guests', icon: '👥' },
  { path: '/seating', label: 'Seating Chart', icon: '🪑' },
  { path: '/timeline', label: 'Timeline', icon: '📅' },
  { path: '/photos', label: 'Photos', icon: '📸' },
  { path: '/inspiration', label: 'Inspiration', icon: '✨' },
  { path: '/website', label: 'Website', icon: '🌐' },
  { path: '/communications', label: 'Communicate', icon: '💌' },
  { path: '/marriage-laws', label: 'Laws', icon: '⚖️' },
  { path: '/vendors', label: 'Vendors', icon: '🤝' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)

  const wedding = useWeddingStore((state: any) => state.wedding)
  const timelineEvents = useWeddingStore((state: any) => state.timelineEvents)
  const appSettings = useWeddingStore((state: any) => state.appSettings)
  const setDarkMode = useWeddingStore((state: any) => state.setDarkMode)
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

    // Check budget alerts
    const totalBudget = wedding.totalBudget
    const totalSpent = budgetItems.reduce((sum: number, item: any) => sum + item.actualCost, 0)
    const spentPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

    if (spentPercent >= 100) {
      alerts.push({
        type: 'budget_alert',
        title: 'Budget Exceeded!',
        message: `You've spent ${spentPercent.toFixed(0)}% of your total budget`
      })
    } else if (spentPercent >= 90) {
      alerts.push({
        type: 'budget_alert',
        title: 'Budget Warning',
        message: `You've used ${spentPercent.toFixed(0)}% of your budget`
      })
    }

    return alerts
  }, [budgetItems, checklist, guests, wedding.totalBudget])

  const unreadCount = computedNotifications.length

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
          <Link to="/" className="block hover:opacity-80 transition-opacity">
            <h1 className={`font-serif text-primary-600 ${sidebarOpen ? 'text-2xl' : 'text-lg text-center'}`}>
              {sidebarOpen ? 'EverAfter' : 'EA'}
            </h1>
          </Link>
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
          {navItems.filter(item => {
            if (item.path === '/' || item.path === '/settings') return true // Core modules
            const moduleName = item.path.substring(1).split('/')[0]

            // Map paths to module IDs if they differ
            const pathMap: Record<string, string> = {
              'communications': 'communications', // communications isn't explicitly in Register yet, but mapped here
              'seating': 'seating',
              'marriage-laws': 'marriage-laws'
            }

            const moduleId = pathMap[moduleName] || moduleName
            return appSettings.enabledModules.includes(moduleId)
          }).map((item) => (
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

        {/* User Profile / Sign Out */}
        <div className="p-4 border-t border-gray-100">
          <div className={`flex items-center gap-3 ${!sidebarOpen ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-primary-100 flex-shrink-0 flex items-center justify-center text-primary-600 font-bold text-xs">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800 truncate">{user?.name || 'Happy Couple'}</p>
                <button
                  onClick={() => signOut()}
                  className="text-[10px] text-red-500 hover:text-red-600 font-medium mt-0.5"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>

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
            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!appSettings.darkMode)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={appSettings.darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {appSettings.darkMode ? (
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
                  title="Notifications"
                >
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
                    <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                      <h3 className="font-medium text-gray-800 dark:text-gray-200">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-xs text-gray-500">{unreadCount} alerts</span>
                      )}
                    </div>
                    {computedNotifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm">All caught up!</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {computedNotifications.slice(0, 5).map((notification, index) => (
                          <div
                            key={index}
                            className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${notification.type.includes('overdue') ? 'bg-red-500' :
                                notification.type === 'budget_alert' ? 'bg-yellow-500' :
                                  notification.type === 'rsvp_reminder' ? 'bg-blue-500' :
                                    'bg-orange-400'
                                }`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                  {notification.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {computedNotifications.length > 5 && (
                      <div className="p-2 border-t border-gray-100 dark:border-gray-700 text-center">
                        <span className="text-xs text-gray-500">
                          +{computedNotifications.length - 5} more alerts
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={() => setShareModalOpen(true)}
                className="btn-secondary text-sm py-2"
              >
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

      {/* Share Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-serif text-gray-800 dark:text-gray-200">Share Your Wedding</h2>
              <button
                onClick={() => {
                  setShareModalOpen(false)
                  setCopiedLink(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              Generate shareable links for your guests. These links are read-only and don't require login.
            </p>

            <div className="space-y-3">
              {/* Share Timeline */}
              <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-gray-200">Wedding Timeline</h3>
                    <p className="text-xs text-gray-500">Share your day-of schedule with guests</p>
                  </div>
                  <button
                    onClick={() => {
                      const link = generateShareableLink({
                        timeline: timelineEvents,
                        weddingDetails: {
                          coupleNames: wedding.partner1Name && wedding.partner2Name
                            ? `${wedding.partner1Name} & ${wedding.partner2Name}`
                            : 'Wedding',
                          weddingDate: wedding.weddingDate,
                          venue: wedding.venue
                        }
                      }, 'timeline')
                      navigator.clipboard.writeText(link)
                      setCopiedLink('timeline')
                      setTimeout(() => setCopiedLink(null), 2000)
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${copiedLink === 'timeline'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                      }`}
                    disabled={timelineEvents.length === 0}
                  >
                    {copiedLink === 'timeline' ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>

              {/* Share Wedding Info */}
              <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-gray-200">Wedding Info</h3>
                    <p className="text-xs text-gray-500">Share basic details (date, venue)</p>
                  </div>
                  <button
                    onClick={() => {
                      const link = generateShareableLink({
                        weddingDetails: {
                          coupleNames: wedding.partner1Name && wedding.partner2Name
                            ? `${wedding.partner1Name} & ${wedding.partner2Name}`
                            : 'Wedding',
                          weddingDate: wedding.weddingDate,
                          venue: wedding.venue
                        }
                      }, 'info')
                      navigator.clipboard.writeText(link)
                      setCopiedLink('info')
                      setTimeout(() => setCopiedLink(null), 2000)
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${copiedLink === 'info'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                      }`}
                  >
                    {copiedLink === 'info' ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-4 text-center">
              Links contain encoded data and work without a server.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

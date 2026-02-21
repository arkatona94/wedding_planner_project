import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useWeddingStore } from '../store/weddingStore'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Heart,
  Bell,
  Users,
  Lock,
  Check,
  Phone,
  Calendar,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Download,
  Trash2,
  AlertTriangle,
  X
} from 'lucide-react'

type TabId = 'profile' | 'wedding' | 'notifications' | 'partner' | 'privacy'

export default function Settings() {
  const {
    user,
    updateUser,
    wedding,
    setWedding,
    appSettings,
    updateAppSettings,
    signOut,
    checklist,
    budgetItems,
    guests,
    vendors,
    tables,
    timelineEvents
  } = useWeddingStore()

  const [activeTab, setActiveTab] = useState<TabId>('profile')
  const [showToast, setShowToast] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const lastSavedRef = useRef<string>('')

  // Auto-save logic
  useEffect(() => {
    const currentData = JSON.stringify({ user, wedding, appSettings })
    if (lastSavedRef.current && lastSavedRef.current !== currentData) {
      const timer = setTimeout(() => {
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
        lastSavedRef.current = currentData
      }, 1000)
      return () => clearTimeout(timer)
    }
    if (!lastSavedRef.current) {
      lastSavedRef.current = currentData
    }
  }, [user, wedding, appSettings])

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'wedding', label: 'Wedding Details', icon: Heart },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'partner', label: 'Partner Collaboration', icon: Users },
    { id: 'privacy', label: 'Privacy & Security', icon: Lock },
  ]

  const handleDeleteAccount = () => {
    if (confirmText === 'DELETE') {
      // In a real app, this would call an API
      alert('Account deletion requested. This would permanently remove all your data.')
      signOut()
    }
  }

  const exportData = () => {
    const data = {
      user,
      wedding,
      checklist,
      budgetItems,
      guests,
      vendors,
      tables,
      timelineEvents,
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `wedding-planner-data-export.json`
    a.click()
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-50 bg-green-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-green-500"
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
            <span className="font-medium text-sm">Settings saved</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-10">
        <h1 className="text-4xl font-serif text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-500">Manage your profile, wedding details, and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:w-72 flex-shrink-0">
          <div className="bg-white/60 backdrop-blur-md rounded-[2rem] p-4 border border-white shadow-xl">
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabId)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${activeTab === tab.id
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                    : 'text-gray-500 hover:bg-white hover:text-gray-900'
                    }`}
                >
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`} />
                  <span className="font-medium text-sm">{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div layoutId="activeTab" className="ml-auto">
                      <ChevronRight className="w-4 h-4 text-white/70" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 md:p-10 border border-white shadow-2xl min-h-[600px]"
          >
            {/* TAB 1: PROFILE */}
            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-serif text-gray-900 mb-6">Profile Settings</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                      <div className="relative">
                        <input
                          type="email"
                          value={user?.email || ''}
                          readOnly
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-gray-500 cursor-not-allowed focus:outline-none"
                        />
                        <button className="absolute right-3 top-3 px-3 py-1.5 bg-white text-primary-600 text-xs font-bold rounded-xl border border-primary-100 hover:bg-primary-50 transition-colors shadow-sm">
                          Change Email
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={user?.phone || ''}
                          onChange={(e) => updateUser({ phone: e.target.value })}
                          placeholder="+1 (555) 000-0000"
                          className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                        />
                        <Phone className="absolute right-5 top-4.5 w-5 h-5 text-gray-300" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                      <input
                        type="text"
                        value={user?.firstName || ''}
                        onChange={(e) => updateUser({ firstName: e.target.value })}
                        className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                      <input
                        type="text"
                        value={user?.lastName || ''}
                        onChange={(e) => updateUser({ lastName: e.target.value })}
                        className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-50 flex flex-wrap gap-4">
                  <button className="px-6 py-3.5 bg-primary-50 text-primary-700 rounded-2xl font-bold hover:bg-primary-100 transition-all flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Change Password
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteModal(true)
                      setConfirmText('')
                    }}
                    className="px-6 py-3.5 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: WEDDING DETAILS */}
            {activeTab === 'wedding' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-serif text-gray-900 mb-6">Wedding Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Wedding Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={wedding.weddingDate || ''}
                        onChange={(e) => setWedding({ weddingDate: e.target.value })}
                        className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                      />
                      <Calendar className="absolute right-5 top-4.5 w-5 h-5 text-gray-300 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Venue Name</label>
                    <input
                      type="text"
                      value={wedding.venue || ''}
                      onChange={(e) => setWedding({ venue: e.target.value })}
                      placeholder="Optional"
                      className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Location (City, State)</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={`${user?.city || ''}${user?.city && user?.state ? ', ' : ''}${user?.state || ''}`}
                        onChange={(e) => {
                          const parts = e.target.value.split(', ')
                          updateUser({ city: parts[0], state: parts[1] || '' })
                        }}
                        placeholder="City, State"
                        className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                      />
                      <MapPin className="absolute right-5 top-4.5 w-5 h-5 text-gray-300" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Guest Estimate</label>
                      <input
                        type="number"
                        value={wedding.estimatedGuests || ''}
                        onChange={(e) => setWedding({ estimatedGuests: parseInt(e.target.value) })}
                        className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Budget ($)</label>
                      <input
                        type="number"
                        value={wedding.totalBudget || ''}
                        onChange={(e) => setWedding({ totalBudget: parseInt(e.target.value) })}
                        className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none font-medium text-primary-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button className="w-full md:w-auto px-8 py-4 bg-primary-600 text-white rounded-[1.5rem] font-bold hover:bg-primary-700 transition-all shadow-xl shadow-primary-200 flex items-center justify-center gap-2">
                    <Check className="w-5 h-5" />
                    Save Wedding Details
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="space-y-10">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <h2 className="text-2xl font-serif text-gray-900">Notification Preferences</h2>
                  <div className="flex items-center bg-gray-50 rounded-2xl p-1 border border-gray-100">
                    <span className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-widest">Email</span>
                    <span className="w-[1px] h-4 bg-gray-200"></span>
                    <span className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-widest">SMS</span>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Marketing & Updates */}
                  <div className="flex items-center justify-between p-6 bg-white border border-gray-50 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="space-y-1 flex-1">
                      <p className="font-bold text-gray-800">Marketing & Updates</p>
                      <div className="flex items-center gap-4 mt-3">
                        <select
                          value={appSettings.notificationFrequency || 'weekly'}
                          onChange={(e) => updateAppSettings({ notificationFrequency: e.target.value as any })}
                          className="bg-gray-50 border-none text-sm font-medium text-gray-600 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary-500/20"
                        >
                          <option value="weekly">Weekly digest</option>
                          <option value="daily">Daily summary</option>
                          <option value="real-time">Real-time alerts</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-6 pl-6 border-l border-gray-50">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={appSettings.marketingEmail} onChange={(e) => updateAppSettings({ marketingEmail: e.target.checked })} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={appSettings.marketingSms} onChange={(e) => updateAppSettings({ marketingSms: e.target.checked })} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Planning Reminders */}
                  <div className="flex items-center justify-between p-6 bg-white border border-gray-50 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="space-y-1 flex-1">
                      <p className="font-bold text-gray-800">Planning Reminders</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {['1 month', '1 week', '3 days'].map(time => (
                          <button
                            key={time}
                            onClick={() => {
                              const current = appSettings.planningTimeline || []
                              const updated = current.includes(time as any)
                                ? current.filter(t => t !== time)
                                : [...current, time]
                              updateAppSettings({ planningTimeline: updated as any })
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${(appSettings.planningTimeline || []).includes(time as any)
                              ? 'bg-primary-100 border-primary-200 text-primary-700'
                              : 'bg-gray-50 border-gray-100 text-gray-400'
                              }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-6 pl-6 border-l border-gray-50">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={appSettings.planningEmail} onChange={(e) => updateAppSettings({ planningEmail: e.target.checked })} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={appSettings.planningSms} onChange={(e) => updateAppSettings({ planningSms: e.target.checked })} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Vendor Messages */}
                  <div className="flex items-center justify-between p-6 bg-white border border-gray-50 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="space-y-1 flex-1">
                      <p className="font-bold text-gray-800">Vendor Messages</p>
                      <p className="text-xs text-gray-500">New messages and inquiry responses</p>
                    </div>
                    <div className="flex gap-6 pl-6 border-l border-gray-50">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={appSettings.vendorEmail} onChange={(e) => updateAppSettings({ vendorEmail: e.target.checked })} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={appSettings.vendorSms} onChange={(e) => updateAppSettings({ vendorSms: e.target.checked })} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* RSVP Updates */}
                  <div className="flex items-center justify-between p-6 bg-white border border-gray-50 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="space-y-1 flex-1">
                      <p className="font-bold text-gray-800">RSVP Updates</p>
                      <p className="text-xs text-gray-500">Real-time alerts for guest responses</p>
                    </div>
                    <div className="flex gap-6 pl-6 border-l border-gray-50">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={appSettings.rsvpEmail} onChange={(e) => updateAppSettings({ rsvpEmail: e.target.checked })} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={appSettings.rsvpSms} onChange={(e) => updateAppSettings({ rsvpSms: e.target.checked })} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: PARTNER COLLABORATION */}
            {activeTab === 'partner' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-serif text-gray-900 mb-2">Partner Collaboration</h2>
                <p className="text-gray-500 text-sm mb-8">Invite your partner to plan together in real-time.</p>

                {appSettings.partnerEmail ? (
                  <div className="space-y-6">
                    <div className="p-8 bg-primary-50 rounded-[2rem] border border-primary-100 flex flex-col md:flex-row gap-6 items-center">
                      <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-3xl shadow-soft border border-primary-100">
                        {appSettings.partnerName?.charAt(0).toUpperCase() || 'P'}
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <p className="text-xl font-bold text-gray-800">{appSettings.partnerName || 'Partner'}</p>
                        <p className="text-gray-500 font-medium">{appSettings.partnerEmail}</p>
                        <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${appSettings.partnerStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                            {appSettings.partnerStatus || 'Invited'}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            {appSettings.partnerPermission || 'Collaborator'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <select
                          value={appSettings.partnerPermission || 'collaborative'}
                          onChange={(e) => updateAppSettings({ partnerPermission: e.target.value as any })}
                          className="bg-white border-primary-100 text-xs font-bold text-primary-700 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary-500/20 shadow-sm"
                        >
                          <option value="collaborative">Collaborative</option>
                          <option value="view">View Only</option>
                          <option value="admin">Full Admin</option>
                        </select>
                        <button
                          onClick={() => updateAppSettings({ partnerEmail: undefined })}
                          className="p-3 bg-white text-red-500 rounded-xl border border-red-50 hover:bg-red-50 transition-colors shadow-sm"
                          title="Remove Access"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-10 border-2 border-dashed border-gray-100 rounded-[2rem] text-center bg-gray-50/50">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-soft border border-gray-100">
                        <Users className="w-10 h-10 text-primary-200" />
                      </div>
                      <h3 className="text-xl font-serif text-gray-800 mb-2">Planning is better together</h3>
                      <p className="text-gray-500 text-sm max-w-sm mx-auto mb-8">
                        Invite your partner to share the load. They'll get full access to the budget, guest list, and more.
                      </p>

                      <div className="max-w-md mx-auto space-y-4">
                        <input
                          type="text"
                          placeholder="Partner's Name"
                          className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-primary-500/20"
                          id="new-partner-name"
                        />
                        <input
                          type="email"
                          placeholder="Partner's Email"
                          className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-primary-500/20"
                          id="new-partner-email"
                        />
                        <button
                          onClick={() => {
                            const nameEl = document.getElementById('new-partner-name') as HTMLInputElement
                            const emailEl = document.getElementById('new-partner-email') as HTMLInputElement
                            if (emailEl.value) {
                              updateAppSettings({
                                partnerName: nameEl.value,
                                partnerEmail: emailEl.value,
                                partnerStatus: 'invited',
                                partnerPermission: 'collaborative'
                              })
                            }
                          }}
                          className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-xl shadow-primary-200"
                        >
                          Invite Partner
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: PRIVACY & SECURITY */}
            {activeTab === 'privacy' && (
              <div className="space-y-10">
                <div className="flex items-center gap-6 p-8 bg-green-50 rounded-[2rem] border border-green-100">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-soft text-green-500 border border-green-100">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-900">Your Privacy is Sacred</h3>
                    <p className="text-green-700 text-sm">We don't sell your data to third parties. Every detail is encrypted and secure.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Link to="/privacy-policy" className="p-6 bg-white border border-gray-50 rounded-3xl flex items-center justify-between group hover:shadow-lg transition-all">
                    <span className="font-bold text-gray-800">Privacy Policy</span>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 transition-colors" />
                  </Link>
                  <Link to="/terms" className="p-6 bg-white border border-gray-50 rounded-3xl flex items-center justify-between group hover:shadow-lg transition-all">
                    <span className="font-bold text-gray-800">Terms of Service</span>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 transition-colors" />
                  </Link>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-8 bg-gray-50 rounded-[2rem] border border-gray-100">
                    <div className="flex-1 pr-8">
                      <p className="font-bold text-gray-800 mb-1">Data Portability</p>
                      <p className="text-xs text-gray-500">Download a full copy of all your wedding data in JSON format.</p>
                    </div>
                    <button
                      onClick={exportData}
                      className="whitespace-nowrap flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-xl font-bold text-sm text-gray-700 hover:bg-white/80 transition-all shadow-soft"
                    >
                      <Download className="w-4 h-4" />
                      Export Data
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-8 bg-red-50/50 rounded-[2rem] border border-red-50">
                    <div className="flex-1 pr-8">
                      <p className="font-bold text-red-900 mb-1">Danger Zone</p>
                      <p className="text-xs text-red-700">Permanently delete your account and all associated planning data.</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowDeleteModal(true)
                        setConfirmText('')
                      }}
                      className="whitespace-nowrap flex items-center gap-2 px-6 py-3 bg-white border border-red-100 rounded-xl font-bold text-sm text-red-600 hover:bg-red-50 transition-all shadow-soft"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl border border-red-100"
            >
              <button
                onClick={() => setShowDeleteModal(false)}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>

              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-8 mx-auto">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>

              <h3 className="text-2xl font-serif text-gray-900 text-center mb-4">Are you absolutely sure?</h3>
              <p className="text-gray-500 text-center mb-8 text-sm leading-relaxed">
                This action is irreversible. All your guests, budget data, inspiration boards, and photos will be permanently deleted.
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] text-center block w-full">
                    Type <span className="text-red-600">DELETE</span> to confirm
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="w-full bg-red-50/30 border border-red-100 rounded-2xl px-5 py-4 text-center font-bold text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    autoFocus
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-4 px-6 border border-gray-100 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={confirmText !== 'DELETE'}
                    className={`flex-1 py-4 px-6 rounded-2xl font-bold transition-all ${confirmText === 'DELETE'
                      ? 'bg-red-600 text-white shadow-xl shadow-red-200 hover:bg-red-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    Delete Now
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

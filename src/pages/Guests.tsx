import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useWeddingStore } from '../store/weddingStore'
import { QRCodeSVG } from 'qrcode.react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts'
import { format } from 'date-fns'
import type { Guest, RSVPStatus } from '../types'
import { exportGuestListPDF } from '../utils/exports'

const CHART_COLORS = ['#c97f66', '#9dc183', '#d4af37', '#d4a5a5', '#b5644d', '#7d4336', '#dba08b', '#f3d9d0']

const mealOptions = ['Chicken', 'Beef', 'Fish', 'Vegetarian', 'Vegan', 'Kids Meal']
const dietaryOptions = ['Gluten-Free', 'Dairy-Free', 'Nut Allergy', 'Shellfish Allergy', 'Kosher', 'Halal']
const mainGroups = [
  'Immediate family',
  'Extended family',
  'Wedding party',
  'Friends',
  'College friends',
  'Work friends (colleagues)',
  'Ceremony only',
  'Reception only'
]

export default function Guests() {
  const { guests, addGuest, updateGuest, deleteGuest, importGuests, tables, wedding } = useWeddingStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [rsvpFilter, setRsvpFilter] = useState<RSVPStatus | 'all'>('all')
  const [groupFilter, setGroupFilter] = useState<string>('all')

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: { street: '', city: '', state: '', zipCode: '', country: 'USA' },
    rsvpStatus: 'pending' as RSVPStatus,
    mealChoice: '',
    dietaryRestrictions: [] as string[],
    plusOne: false,
    plusOneName: '',
    tableAssignment: null as string | null,
    group: '',
    isBrideSide: false,
    isGroomSide: false,
    notes: ''
  })

  const uniqueGroups = [...new Set(guests.map(g => g.group).filter(Boolean))]

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = `${guest.firstName} ${guest.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRSVP = rsvpFilter === 'all' || guest.rsvpStatus === rsvpFilter
    const matchesGroup = groupFilter === 'all' || guest.group === groupFilter
    return matchesSearch && matchesRSVP && matchesGroup
  })

  const stats = {
    totalInvitations: guests.length,
    totalGuests: guests.length + guests.filter(g => g.plusOne).length,
    attending: guests.filter(g => g.rsvpStatus === 'attending').length + guests.filter(g => g.plusOne && g.rsvpStatus === 'attending').length,
    declined: guests.filter(g => g.rsvpStatus === 'declined').length,
    pending: guests.filter(g => g.rsvpStatus === 'pending').length,
  }

  const groupData = [...new Set([...mainGroups, ...uniqueGroups])]
    .map(group => {
      const groupGuests = guests.filter(g => g.group === group)
      const total = groupGuests.length + groupGuests.filter(g => g.plusOne).length
      return { name: group, value: total }
    })
    .filter(d => d.value > 0)

  const mealData = mealOptions
    .map(meal => {
      const count = guests.filter(g => g.rsvpStatus === 'attending' && g.mealChoice === meal).length
      return { name: meal, value: count }
    })
    .filter(d => d.value > 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingGuest) {
      updateGuest(editingGuest.id, formData)
    } else {
      addGuest(formData)
    }
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      firstName: '', lastName: '', email: '', phone: '',
      address: { street: '', city: '', state: '', zipCode: '', country: 'USA' },
      rsvpStatus: 'pending', mealChoice: '', dietaryRestrictions: [],
      plusOne: false, plusOneName: '', tableAssignment: null, group: '',
      isBrideSide: false, isGroomSide: false, notes: ''
    })
    setShowAddModal(false)
    setEditingGuest(null)
  }

  const startEdit = (guest: Guest) => {
    setEditingGuest(guest)
    setFormData({
      firstName: guest.firstName,
      lastName: guest.lastName,
      email: guest.email,
      phone: guest.phone,
      address: guest.address,
      rsvpStatus: guest.rsvpStatus,
      mealChoice: guest.mealChoice,
      dietaryRestrictions: guest.dietaryRestrictions,
      plusOne: guest.plusOne,
      plusOneName: guest.plusOneName,
      tableAssignment: guest.tableAssignment,
      group: guest.group,
      isBrideSide: guest.isBrideSide || false,
      isGroomSide: guest.isGroomSide || false,
      notes: guest.notes
    })
    setShowAddModal(true)
  }

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())

      const newGuests = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim())
        let firstName = values[headers.indexOf('first name')] || values[headers.indexOf('firstname')] || ''
        let lastName = values[headers.indexOf('last name')] || values[headers.indexOf('lastname')] || ''
        if (!firstName && !lastName) {
          const fullName = values[headers.indexOf('name')] || values[headers.indexOf('full name')] || ''
          if (fullName) {
            const parts = fullName.split(' ')
            if (parts.length > 0) {
              lastName = parts.pop() || ''
              firstName = parts.join(' ')
            }
          }
        }

        const guest: Omit<Guest, 'id'> = {
          firstName,
          lastName,
          email: values[headers.indexOf('email')] || values[headers.indexOf('e-mail')] || '',
          phone: values[headers.indexOf('phone')] || values[headers.indexOf('mobile')] || values[headers.indexOf('cell')] || '',
          address: {
            street: values[headers.indexOf('street')] || values[headers.indexOf('address')] || '',
            city: values[headers.indexOf('city')] || '',
            state: values[headers.indexOf('state')] || '',
            zipCode: values[headers.indexOf('zip')] || values[headers.indexOf('zipcode')] || values[headers.indexOf('postal')] || '',
            country: values[headers.indexOf('country')] || 'USA'
          },
          rsvpStatus: 'pending',
          mealChoice: values[headers.indexOf('meal')] || values[headers.indexOf('meal choice')] || '',
          dietaryRestrictions: (values[headers.indexOf('dietary')] || values[headers.indexOf('diet')] || '').split(';').filter(d => d.trim()),
          plusOne: (values[headers.indexOf('plus one')] || '').toLowerCase() === 'yes',
          plusOneName: values[headers.indexOf('plus one name')] || '',
          tableAssignment: null,
          group: values[headers.indexOf('group')] || '',
          isBrideSide: (values[headers.indexOf('side')] || '').toLowerCase().includes('bride'),
          isGroomSide: (values[headers.indexOf('side')] || '').toLowerCase().includes('groom'),
          notes: values[headers.indexOf('notes')] || ''
        }
        return guest
      }).filter(g => g.firstName || g.lastName)
      importGuests(newGuests)
      setShowImportModal(false)
    }
    reader.readAsText(file)
  }

  const exportCSV = () => {
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'RSVP Status', 'Meal Choice', 'Dietary Restrictions', 'Plus One', 'Plus One Name', 'Group', 'Table']
    const rows = guests.map(g => [
      g.firstName, g.lastName, g.email, g.phone, g.rsvpStatus, g.mealChoice,
      g.dietaryRestrictions.join('; '), g.plusOne ? 'Yes' : 'No', g.plusOneName, g.group,
      tables.find(t => t.id === g.tableAssignment)?.name || ''
    ])
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'guest-list.csv'
    a.click()
  }

  const downloadTemplate = () => {
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Street', 'City', 'State', 'Zip', 'Country', 'Group', 'Meal', 'Dietary', 'Plus One', 'Plus One Name', 'Notes']
    const csv = headers.join(',')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'guest-import-template.csv'
    a.click()
  }

  const rsvpUrl = `${window.location.origin}/rsvp/${wedding.id}`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link to="/" className="hover:text-primary-600 transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-gray-400">Guests</span>
          </div>
          <h1 className="text-2xl font-serif text-gray-800">Guest Management</h1>
          <p className="text-gray-500">{stats.totalGuests} total guests ({stats.totalInvitations} invitations)</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 border shadow-sm ${showAnalytics
              ? 'bg-primary-600 text-white border-primary-600 scale-105 shadow-primary-200'
              : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:text-primary-600'
              }`}
          >
            {showAnalytics ? '📋 Back to Management' : '📊 Visual Review'}
          </button>
          {!showAnalytics && (
            <>
              <Link to="/seating" className="btn-secondary flex items-center gap-2">
                <span className="text-xl">🪑</span>
                Seating Chart
              </Link>
              <button onClick={() => setShowQRModal(true)} className="btn-secondary">RSVP QR Code</button>
              <button onClick={() => setShowImportModal(true)} className="btn-secondary">Import CSV</button>
              <button onClick={exportCSV} className="btn-secondary">Export CSV</button>
              <button
                onClick={() => {
                  const coupleNames = wedding.partner1Name && wedding.partner2Name
                    ? `${wedding.partner1Name} & ${wedding.partner2Name}`
                    : 'Wedding'
                  const weddingDate = wedding.weddingDate
                    ? format(new Date(wedding.weddingDate), 'MMMM d, yyyy')
                    : ''
                  exportGuestListPDF(guests, tables, coupleNames, weddingDate)
                }}
                className="btn-secondary"
              >
                Export PDF
              </button>
              <button onClick={() => setShowAddModal(true)} className="btn-primary">+ Add Guest</button>
            </>
          )}
        </div>
      </div>

      {showAnalytics ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-gradient-to-br from-primary-50 to-white p-8 rounded-[2rem] border border-primary-100 shadow-sm">
            <h2 className="text-3xl font-serif text-gray-800 mb-2">Guest List Insights</h2>
            <p className="text-gray-500">A premium visual summary of your wedding attendance</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Radial RSVP Progress */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
              <h3 className="text-lg font-serif text-gray-700 mb-2">RSVP Achievement</h3>
              <p className="text-sm text-gray-400 mb-6 uppercase tracking-widest">Confirmed Attendance Ratio</p>
              <div className="relative w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Attending', value: stats.attending },
                        { name: 'Remaining', value: Math.max(0, stats.totalGuests - stats.attending) }
                      ]}
                      innerRadius={80}
                      outerRadius={110}
                      startAngle={90}
                      endAngle={450}
                      dataKey="value"
                    >
                      <Cell fill="#9dc183" />
                      <Cell fill="#f3f4f6" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-serif text-gray-800">
                    {stats.totalGuests > 0 ? Math.round((stats.attending / stats.totalGuests) * 100) : 0}%
                  </span>
                  <span className="text-xs text-green-600 font-bold uppercase mt-1 tracking-widest">Attending Confirmed</span>
                </div>
              </div>
            </div>

            {/* Premium Info Cards */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Headcount</span>
                <div>
                  <h4 className="text-5xl font-serif text-gray-800">{stats.totalGuests}</h4>
                  <p className="text-sm text-gray-500 mt-1">Expected guests including +1s</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between border-l-4 border-l-yellow-400 hover:shadow-md transition-shadow">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Awaiting RSVP</span>
                <div>
                  <h4 className="text-5xl font-serif text-yellow-600">{stats.pending}</h4>
                  <p className="text-sm text-gray-500 mt-1">Invitations still pending response</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between border-l-4 border-l-red-400 hover:shadow-md transition-shadow">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Regrets Received</span>
                <div>
                  <h4 className="text-5xl font-serif text-red-600">{stats.declined}</h4>
                  <p className="text-sm text-gray-500 mt-1">Declined invitations</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-6 rounded-2xl shadow-lg text-white hover:scale-[1.02] transition-transform">
                <span className="text-xs font-bold text-primary-100 uppercase tracking-widest">Invitations Active</span>
                <div className="mt-4">
                  <h4 className="text-5xl font-serif">{stats.totalInvitations}</h4>
                  <p className="text-sm text-primary-100 mt-1">Unique households/invites</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Social Circle Breakdown */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-[450px] flex flex-col">
              <h3 className="text-xl font-serif text-gray-800 mb-6 font-medium">Group Distribution</h3>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={groupData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={120}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {groupData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar Dynamics */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-[450px] flex flex-col">
              <h3 className="text-xl font-serif text-gray-800 mb-6 font-medium">Guest Mix Dynamics</h3>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                    { subject: 'Bride Side', A: guests.filter(g => g.isBrideSide).length },
                    { subject: 'Groom Side', A: guests.filter(g => g.isGroomSide).length },
                    { subject: 'Family', A: guests.filter(g => g.group?.toLowerCase().includes('family')).length },
                    { subject: 'Friends', A: guests.filter(g => g.group?.toLowerCase().includes('friend')).length },
                    { subject: 'Work', A: guests.filter(g => g.group?.toLowerCase().includes('work') || g.group?.toLowerCase().includes('colleague')).length },
                  ]}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} />
                    <Radar name="Count" dataKey="A" stroke="#c97f66" fill="#c97f66" fillOpacity={0.6} />
                    <Tooltip contentStyle={{ borderRadius: '12px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-[250px] flex flex-col">
              <h3 className="text-lg font-serif text-gray-800 mb-4 font-medium">Meal Selection Summary</h3>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mealData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} fontSize={12} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="value" fill="#c97f66" radius={[0, 10, 10, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 min-h-[250px]">
              <h3 className="text-lg font-serif text-gray-800 mb-6 font-medium">Critical Dietary Alerts</h3>
              <div className="flex flex-wrap gap-4">
                {dietaryOptions.map(diet => {
                  const count = guests.filter(g => g.rsvpStatus === 'attending' && g.dietaryRestrictions.includes(diet)).length
                  if (count === 0) return null
                  return (
                    <div key={diet} className="flex flex-col p-5 bg-orange-50 rounded-2xl border border-orange-100 min-w-[140px] shadow-sm transform hover:-translate-y-1 transition-transform">
                      <span className="text-3xl font-serif text-orange-700">{count}</span>
                      <span className="text-xs font-bold text-orange-900 uppercase tracking-wider mt-1">{diet}</span>
                    </div>
                  )
                })}
                {!dietaryOptions.some(diet => guests.some(g => g.rsvpStatus === 'attending' && g.dietaryRestrictions.includes(diet))) && (
                  <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-100 rounded-2xl">
                    <p className="text-sm text-gray-400 italic">No dietary restrictions reported yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search guests..."
              className="input-field w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <select className="input-field grow sm:grow-0 w-full sm:w-auto" value={rsvpFilter} onChange={(e) => setRsvpFilter(e.target.value as RSVPStatus | 'all')}>
                <option value="all">All RSVP Status</option>
                <option value="attending">Attending</option>
                <option value="declined">Declined</option>
                <option value="pending">Pending</option>
                <option value="maybe">Maybe</option>
              </select>
              <select className="input-field grow sm:grow-0 w-full sm:w-auto" value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)}>
                <option value="all">All Groups</option>
                {mainGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
                {uniqueGroups.filter(g => !mainGroups.includes(g)).map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="card overflow-hidden">
            {filteredGuests.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No guests found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Contact</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">RSVP</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Meal</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Side</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Group</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredGuests.map((guest) => (
                      <tr key={guest.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800">{guest.firstName} {guest.lastName}</p>
                          {guest.plusOne && <p className="text-sm text-gray-500">+1: {guest.plusOneName || 'TBD'}</p>}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <p>{guest.email}</p>
                          <p>{guest.phone}</p>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            className={`text-sm px-2 py-1 rounded ${guest.rsvpStatus === 'attending' ? 'bg-green-100 text-green-800' :
                              guest.rsvpStatus === 'declined' ? 'bg-red-100 text-red-800' :
                                guest.rsvpStatus === 'maybe' ? 'bg-blue-100 text-blue-800' :
                                  'bg-yellow-100 text-yellow-800'
                              }`}
                            value={guest.rsvpStatus}
                            onChange={(e) => updateGuest(guest.id, { rsvpStatus: e.target.value as RSVPStatus })}
                          >
                            <option value="pending">Pending</option>
                            <option value="attending">Attending</option>
                            <option value="declined">Declined</option>
                            <option value="maybe">Maybe</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{guest.mealChoice || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div className="flex gap-1">
                            {guest.isBrideSide && <span className="px-1.5 py-0.5 bg-primary-50 text-primary-700 rounded text-[10px] font-bold">B</span>}
                            {guest.isGroomSide && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold">G</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{guest.group || '-'}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => startEdit(guest)} className="text-primary-600 hover:underline mr-3">Edit</button>
                          <button onClick={() => deleteGuest(guest.id)} className="text-red-600 hover:underline">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modals */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4">
            <h2 className="text-xl font-serif text-gray-800 mb-4">{editingGuest ? 'Edit Guest' : 'Add Guest'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input type="text" required className="input-field" value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input type="text" required className="input-field" value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" className="input-field" value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" className="input-field" value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Side (Check all that apply)</label>
                <div className="flex gap-6 p-2 bg-gray-50 rounded-lg border border-gray-100">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                      checked={formData.isBrideSide} onChange={(e) => setFormData({ ...formData, isBrideSide: e.target.checked })} />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-primary-600 transition-colors">Bride's Side</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      checked={formData.isGroomSide} onChange={(e) => setFormData({ ...formData, isGroomSide: e.target.checked })} />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Groom's Side</span>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
                  <select className="input-field" value={formData.group} onChange={(e) => setFormData({ ...formData, group: e.target.value })}>
                    <option value="">Select Group</option>
                    {mainGroups.map(group => <option key={group} value={group}>{group}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meal Choice</label>
                  <select className="input-field" value={formData.mealChoice} onChange={(e) => setFormData({ ...formData, mealChoice: e.target.value })}>
                    <option value="">Select meal</option>
                    {mealOptions.map(meal => <option key={meal} value={meal}>{meal}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Restrictions</label>
                <div className="flex flex-wrap gap-2">
                  {dietaryOptions.map(diet => (
                    <label key={diet} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={formData.dietaryRestrictions.includes(diet)}
                        onChange={(e) => {
                          const newDietary = e.target.checked
                            ? [...formData.dietaryRestrictions, diet]
                            : formData.dietaryRestrictions.filter(d => d !== diet)
                          setFormData({ ...formData, dietaryRestrictions: newDietary })
                        }} />
                      {diet}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.plusOne} onChange={(e) => setFormData({ ...formData, plusOne: e.target.checked })} />
                  <span className="text-sm font-medium text-gray-700">Plus One</span>
                </label>
                {formData.plusOne && (
                  <input type="text" className="input-field flex-1" placeholder="Plus one name" value={formData.plusOneName}
                    onChange={(e) => setFormData({ ...formData, plusOneName: e.target.value })} />
                )}
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editingGuest ? 'Save Changes' : 'Add Guest'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-serif text-gray-800 mb-4">Import Guests from CSV</h2>
            <div className="mb-6 bg-blue-50 p-4 rounded-lg">
              <button onClick={downloadTemplate} className="text-sm text-primary-600 hover:text-primary-700 underline font-medium">Download CSV Template</button>
            </div>
            <input type="file" accept=".csv" onChange={handleImportCSV} className="input-field" />
            <button onClick={() => setShowImportModal(false)} className="btn-secondary mt-4 w-full">Cancel</button>
          </div>
        </div>
      )}

      {showQRModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 text-center">
            <h2 className="text-xl font-serif text-gray-800 mb-4">RSVP QR Code</h2>
            <div className="flex justify-center mb-4"><QRCodeSVG value={rsvpUrl} size={200} /></div>
            <p className="text-sm text-gray-500 mb-4">{rsvpUrl}</p>
            <button onClick={() => setShowQRModal(false)} className="btn-primary">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

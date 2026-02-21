import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useWeddingStore } from '../store/weddingStore'
import { QRCodeSVG } from 'qrcode.react'
import type { Guest, RSVPStatus, GuestGroup, AgeGroup } from '../types'
import UpgradeModal from '../components/UpgradeModal'
import GuestStats from '../components/guests/GuestStats'
import GuestTable from '../components/guests/GuestTable'
import GuestCard from '../components/guests/GuestCard'
import AddGuestModal from '../components/guests/AddGuestModal'
import { Search, Filter, Download, Upload, Plus, BarChart2, QrCode, Grid, Users } from 'lucide-react'

// Constants for filtered groups if not dynamically generated
const mainGroups: GuestGroup[] = ['Family', 'Friends', 'Work', 'Other']

export default function Guests() {
  const { guests, addGuest, updateGuest, deleteGuest, importGuests, user, wedding } = useWeddingStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [rsvpFilter, setRsvpFilter] = useState<RSVPStatus | 'all'>('all')
  const [groupFilter, setGroupFilter] = useState<string>('all')

  // Calculate stats
  const stats = {
    totalInvitations: guests.length,
    totalGuests: guests.length + guests.filter(g => g.plusOne).length,
    attending: guests.filter(g => g.rsvpStatus === 'attending').length + guests.filter(g => g.plusOne && g.rsvpStatus === 'attending').length,
    declined: guests.filter(g => g.rsvpStatus === 'declined').length,
    pending: guests.filter(g => g.rsvpStatus === 'pending').length,
  }

  const attendingPct = stats.totalGuests > 0 ? Math.round((stats.attending / stats.totalGuests) * 100) : 0
  const declinedPct = stats.totalGuests > 0 ? Math.round((stats.declined / stats.totalGuests) * 100) : 0
  const pendingPct = stats.totalGuests > 0 ? Math.round((stats.pending / stats.totalGuests) * 100) : 0

  // Filter logic
  const filteredGuests = guests.filter(guest => {
    const matchesSearch = `${guest.firstName} ${guest.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRSVP = rsvpFilter === 'all' || guest.rsvpStatus === rsvpFilter
    const matchesGroup = groupFilter === 'all' || guest.group === groupFilter
    return matchesSearch && matchesRSVP && matchesGroup
  })

  // Handlers
  const handleAddSubmit = (data: Partial<Guest>) => {
    if (editingGuest) {
      updateGuest(editingGuest.id, data)
    } else {
      if (!user?.isPremium && guests.length >= 100) {
        setShowUpgradeModal(true)
        return
      }
      addGuest(data as Omit<Guest, 'id'>)
    }
    setEditingGuest(null)
    setShowAddModal(false)
  }

  // Re-implementing the robust CSV parser for correctness
  const processCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())

      const newGuests = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim())
        const getVal = (keys: string[]) => {
          const idx = headers.findIndex(h => keys.some(k => h.includes(k)))
          return idx !== -1 ? values[idx] : ''
        }

        const firstName = getVal(['first', 'name'])
        const lastName = getVal(['last'])

        return {
          firstName: firstName || 'Guest',
          lastName: lastName,
          email: getVal(['email']),
          phone: getVal(['phone', 'cell', 'mobile']),
          address: { street: getVal(['street', 'address']), city: getVal(['city']), state: getVal(['state']), zipCode: getVal(['zip']), country: 'USA' },
          rsvpStatus: 'pending',
          mealChoice: getVal(['meal']),
          dietaryRestrictions: getVal(['diet']).split(';').filter(Boolean),
          plusOne: getVal(['plus']).toLowerCase().includes('yes'),
          plusOneName: getVal(['plus one name']),
          group: (getVal(['group']) || 'Other') as GuestGroup,
          ageGroup: 'Adult' as AgeGroup,
          giftSent: false,
          isBrideSide: getVal(['side']).toLowerCase().includes('bride'),
          isGroomSide: getVal(['side']).toLowerCase().includes('groom'),
          notes: getVal(['notes']),
          partyMembers: [],
          tableAssignment: null
        } as Omit<Guest, 'id'>
      })

      const availableSlots = user?.isPremium ? Infinity : Math.max(0, 100 - guests.length)
      if (newGuests.length > availableSlots) {
        setShowUpgradeModal(true)
        importGuests(newGuests.slice(0, availableSlots))
      } else {
        importGuests(newGuests)
      }
      setShowImportModal(false)
    }
    reader.readAsText(file)
  }

  const exportCSV = () => {
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'RSVP', 'Meal', 'Gift Sent', 'Group', 'Age', 'Plus One']
    const rows = guests.map(g => [
      g.firstName, g.lastName, g.email, g.phone, g.rsvpStatus, g.mealChoice, g.giftSent ? 'Yes' : 'No', g.group, g.ageGroup, g.plusOne ? 'Yes' : 'No'
    ])
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'guest-list.csv'
    a.click()
  }

  const rsvpUrl = `${window.location.origin}/rsvp/${wedding.id}`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link to="/" className="hover:text-primary-600 transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-gray-400">Guests</span>
          </div>
          <h1 className="text-2xl font-serif text-gray-800">Guest Management</h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`btn-secondary flex items-center gap-2 ${showAnalytics ? 'bg-primary-50 text-primary-700 border-primary-200' : ''}`}
          >
            <BarChart2 size={18} />
            {showAnalytics ? 'Hide Analytics' : 'Visual Review'}
          </button>
          {!showAnalytics && (
            <>
              <Link to="/seating" className="btn-secondary flex items-center gap-2">
                <Grid size={18} /> Seating
              </Link>
              <button onClick={() => setShowQRModal(true)} className="btn-secondary flex items-center gap-2">
                <QrCode size={18} /> RSVP Code
              </button>
              <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                <button onClick={() => setShowImportModal(true)} className="p-2 hover:bg-gray-50 rounded" title="Import CSV">
                  <Upload size={18} className="text-gray-600" />
                </button>
                <button onClick={exportCSV} className="p-2 hover:bg-gray-50 rounded" title="Export CSV">
                  <Download size={18} className="text-gray-600" />
                </button>
              </div>
              <button onClick={() => { setEditingGuest(null); setShowAddModal(true); }} className="btn-primary flex items-center gap-2">
                <Plus size={18} /> Add Guest
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats Summary Bar */}
      {!showAnalytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-center md:text-left md:pl-4 border-r border-gray-100 last:border-0">
            <div className="text-sm text-gray-500 uppercase tracking-wide font-medium">Total Invited</div>
            <div className="text-2xl font-serif text-gray-800">{stats.totalInvitations} <span className="text-sm text-gray-400 font-sans">({stats.totalGuests} guests)</span></div>
          </div>
          <div className="text-center md:text-left md:pl-4 border-r border-gray-100 last:border-0">
            <div className="text-sm text-green-600 uppercase tracking-wide font-medium">Attending</div>
            <div className="text-2xl font-serif text-gray-800">{stats.attending} <span className="text-sm text-gray-400 font-sans">({attendingPct}%)</span></div>
          </div>
          <div className="text-center md:text-left md:pl-4 border-r border-gray-100 last:border-0">
            <div className="text-sm text-red-500 uppercase tracking-wide font-medium">Declined</div>
            <div className="text-2xl font-serif text-gray-800">{stats.declined} <span className="text-sm text-gray-400 font-sans">({declinedPct}%)</span></div>
          </div>
          <div className="text-center md:text-left md:pl-4">
            <div className="text-sm text-yellow-600 uppercase tracking-wide font-medium">Pending</div>
            <div className="text-2xl font-serif text-gray-800">{stats.pending} <span className="text-sm text-gray-400 font-sans">({pendingPct}%)</span></div>
          </div>
        </div>
      )}

      {showAnalytics ? (
        <GuestStats guests={guests} />
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or email..."
                className="input-field pl-10 w-full bg-gray-50 border-gray-200 focus:bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <div className="relative min-w-[160px]">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select
                  className="input-field pl-10 w-full appearance-none bg-gray-50 border-gray-200 focus:bg-white cursor-pointer"
                  value={rsvpFilter}
                  onChange={(e) => setRsvpFilter(e.target.value as RSVPStatus | 'all')}
                >
                  <option value="all">All RSVP Status</option>
                  <option value="attending">Attending</option>
                  <option value="pending">Pending</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
              <div className="relative min-w-[160px]">
                <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  className="input-field pl-10 w-full appearance-none bg-gray-50 border-gray-200 focus:bg-white cursor-pointer"
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                >
                  <option value="all">All Groups</option>
                  {mainGroups.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Table View (Desktop) */}
          <div className="hidden md:block">
            <GuestTable
              guests={filteredGuests}
              onEdit={(g) => { setEditingGuest(g); setShowAddModal(true); }}
              onDelete={deleteGuest}
            />
          </div>

          {/* Card View (Mobile) */}
          <div className="md:hidden space-y-4">
            {filteredGuests.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No guests found.</p>
              </div>
            ) : (
              filteredGuests.map(guest => (
                <GuestCard
                  key={guest.id}
                  guest={guest}
                  onEdit={(g) => { setEditingGuest(g); setShowAddModal(true); }}
                  onDelete={deleteGuest}
                />
              ))
            )}
          </div>
        </>
      )}

      {/* Modals */}
      <AddGuestModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSubmit}
        guestToEdit={editingGuest}
      />

      <UpgradeModal
        isOpen={showUpgradeModal}
        title="Unlimited Guests"
        description="You've reached the 100 guest limit on the free tier."
        feature="Add unlimited guests and track their RSVP status."
        limitValue={100}
        currentValue={101}
        onClose={() => setShowUpgradeModal(false)}
        type="guests"
      />

      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-serif text-gray-800 mb-4">Import Guests from CSV</h2>
            <p className="text-sm text-gray-500 mb-4">Upload a CSV file with columns: First Name, Last Name, Email, etc.</p>
            <input type="file" accept=".csv" onChange={processCSV} className="input-field w-full" />
            <button onClick={() => setShowImportModal(false)} className="btn-secondary mt-4 w-full">Cancel</button>
          </div>
        </div>
      )}

      {showQRModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 text-center max-w-sm mx-auto">
            <h3 className="text-2xl font-serif mb-4">RSVP QR Code</h3>
            <div className="flex justify-center bg-white p-4 rounded-xl border border-gray-100 shadow-inner mb-6">
              <QRCodeSVG value={rsvpUrl} size={200} />
            </div>
            <p className="text-sm text-gray-500 mb-6 break-all bg-gray-50 p-2 rounded">{rsvpUrl}</p>
            <button onClick={() => setShowQRModal(false)} className="btn-primary w-full">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}


